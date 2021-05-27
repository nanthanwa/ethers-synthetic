// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;
import "./token/ERC20/IERC20.sol";
import "./access/Ownable.sol";
import "./utils/Pausable.sol";
import "./utils/ReentrancyGuard.sol";
import "./IStdReference.sol";
import "./math/SafeMath.sol";

// @dev use this interface for burning systhetic asset.
// @notic burnFrom() need to call approve() before call this function.
interface IERC20Burnable is IERC20 {
    function burn(uint256 amount) external;

    function burnFrom(address account, uint256 amount) external;

    function mint(address account, uint256 amount) external;
}

// @info Synthetic contract is the contract that minting systhetic asset by given amount of collateral
// Minter can mint, redeem (some or all all them), add more collateral (to avoid liquidation),
// remove some collateral (to withdraw the backed asset). If the ratio between collateral and synthetic value
// goes lower than liquidation ratio, anyone can call the liquidate function to get the reward and close that contract.
//
// @requirements:
// - Contract address of Dolly (constuctor parameter).
// - Contract address of referrence of orale Band protocol (constuctor parameter).
// - Contract address of synthetic token contract (e.g. TSLA).
// - Set the ownership of synthetic token contract (e.g. TSLA) to this contract.
// - Set the pairsToQuote of supported synthetic asset (e.g. pairsToQuote["TSLA/USD"] = ["TSLA", "USD"]).
// - Set the pairsToAddress of supported synthetic asset (e.g. pairsToAddress["TSLA/USD"] = 0x65cAC0F09EFdB88195a002E8DD4CBF6Ec9BC7f60).
// - Set the addressToPairs of supported synthetic asset (e.g.) addressToPairs[0x65cAC0F09EFdB88195a002E8DD4CBF6Ec9BC7f60] = "TSLA/USD".

contract Synthetic is Ownable, Pausable, ReentrancyGuard {
    using SafeMath for uint256;

    IERC20Burnable public systheticAsset;
    IERC20 public dolly;
    IStdReference public bandOracle;

    mapping(string => string[2]) public pairsToQuote;
    mapping(string => address) public pairsToAddress;
    mapping(address => string) public addressToPairs;

    uint256 public constant denominator = 1e18; // 1 scaled by 1e18
    uint256 public collateralRatio = 1e18 + 5e17; // 1.5 scaled by 1e18 (> 1.5 is good)
    uint256 public liquidationRatio = 1e18 + 25e16; // 1.25 scaled by 1e18

    // allocation of liquidating gap between closing contract and remainning backedAsset
    uint256 public liquidatorRewardRatio = 5e16; // 0.05 scaled by 1e18
    uint256 public platfromFeeRatio = 5e16; // 0.05 scaled by 1e18
    uint256 public remainingToMinterRatio = 9e17; // 0.9 scaled by 1e18
    address public devAddress; // dev address to collect liquidation fee

    // struct of minting the synthetic asset
    struct MintingNote {
        address minter; // address of minter
        IERC20Burnable asset; // synthetic asset address
        IERC20 assetBacked; // dolly address
        uint256 assetAmount; // amount of synthetic asset to be minted
        uint256 assetBackedAmount; // amount of Dolly
        uint256 currentRatio; // the current ratio between collateral value and minted systhetic value
        uint256 willLiquidateAtPrice; // the price that will liquidate this contract
        uint256 canMintRemainning; // amount of this synthetic asset that can be minted
        uint256 canWithdrawRemainning; // amount of Dolly that can be withdraw
        uint256 updatedAt;
        uint256 updatedBlock;
        uint256 exchangeRateAtMinted; // exchange rate at minted
        uint256 currentExchangeRate; // last exchage rate
    }

    mapping(address => mapping(address => MintingNote)) public contracts; // minter => asset => MintingNote

    event MintAsset(
        address minter,
        address indexed syntheticAddress,
        uint256 amount
    );
    event RedeemAsset(address indexed syntheticAddress, uint256 amount);
    event AddCollateral(address indexed user, uint256 amount);
    event RemoveCollateral(address indexed user, uint256 amount);
    event Liquidated(
        address indexed liquidated,
        address indexed liquidator,
        address indexed syntheticAddress,
        uint256 amount,
        uint256 timestamp
    );

    event SetDevAddress(address oldDevAddress, address newDevAddress);

    // @dev the constructor requires an address of Dolly and referrence of oracle Band Protocol
    constructor(IERC20 _dolly, IStdReference _ref) public {
        dolly = _dolly; // use Dolly as collateral
        bandOracle = _ref;
        devAddress = _msgSender();
    }

    // user need to approve for deducting $DOLLY at Dolly contract first.
    function mintSynthetic(
        IERC20Burnable _synthetic,
        uint256 _amount, // amount of synthetic that want to mint
        uint256 _backedAmount // amount of Dolly that you want to collateral
    ) external whenNotPaused nonReentrant {
        MintingNote storage mn = contracts[_msgSender()][address(_synthetic)];
        require(
            mn.minter == address(0),
            "Synthetic::mintSynthetic: transfer to address(0)"
        );

        uint256 exchangeRate = getRate(addressToPairs[address(_synthetic)]);
        uint256 assetBackedAtRateAmount =
            (_amount.mul(exchangeRate)).div(denominator); // 606872500000000000000
        uint256 requiredAmount =
            (assetBackedAtRateAmount.mul(collateralRatio)).div(denominator);
        require(
            _backedAmount >= requiredAmount,
            "Synthetic::mintSynthetic: under collateral"
        );
        uint256 canWithdrawRemainning = _backedAmount.sub(requiredAmount);
        _synthetic.mint(_msgSender(), _amount);

        require(dolly.transferFrom(_msgSender(), address(this), _backedAmount));
        mn.minter = _msgSender();
        mn.asset = _synthetic;
        mn.assetBacked = dolly;
        mn.assetAmount = _amount;
        mn.assetBackedAmount = _backedAmount;
        mn.exchangeRateAtMinted = exchangeRate;
        mn.currentExchangeRate = exchangeRate;
        mn.currentRatio = getCurrentRatio(
            _backedAmount,
            assetBackedAtRateAmount
        );
        mn.willLiquidateAtPrice = getWillLiquidateAtPrice(
            exchangeRate,
            mn.currentRatio
        );
        mn.canWithdrawRemainning = canWithdrawRemainning;
        mn.canMintRemainning = getCanMintRemainning(
            canWithdrawRemainning,
            assetBackedAtRateAmount
        );
        mn.updatedAt = block.timestamp;
        mn.updatedBlock = block.number;
        emit MintAsset(_msgSender(), address(_synthetic), _amount);
    }

    // @dev minter needs to approve for burn at SyntheticAsset before call this function.
    // @notice no need to redeem entire colateral amount.
    function redeemSynthetic(IERC20Burnable _synthetic, uint256 _amount)
        external
        whenNotPaused
        nonReentrant
    {
        MintingNote storage mn = contracts[_msgSender()][address(_synthetic)];
        require(
            mn.assetAmount >= _amount,
            "Synthetic::redeemSynthetic: amount exceeds collateral"
        );

        if (_amount == mn.assetAmount) {
            // redeem and exit
            _synthetic.burnFrom(_msgSender(), _amount);
            dolly.transfer(_msgSender(), mn.assetBackedAmount);
            delete contracts[_msgSender()][address(_synthetic)];
            emit RedeemAsset(address(_synthetic), _amount);
        } else {
            // patial redeeming
            uint256 percent = getRedeemPercent(_amount, mn.assetAmount);
            uint256 assetToBeBurned = (mn.assetAmount * percent) / denominator;
            uint256 assetBackedToBeRedeemed =
                (mn.assetBackedAmount * percent) / denominator;

            uint256 exchangeRate = getRate(addressToPairs[address(_synthetic)]);
            uint256 assetBackedAmountAfterRedeem =
                mn.assetBackedAmount.sub(assetBackedToBeRedeemed);

            uint256 assetRemainningAfterBurned =
                mn.assetAmount.sub(assetToBeBurned);
            uint256 assetBackedAtRateAmount =
                (assetRemainningAfterBurned.mul(exchangeRate)).div(denominator);

            uint256 requiredAmount =
                (assetBackedAtRateAmount.mul(collateralRatio)).div(denominator);
            require(
                assetBackedAmountAfterRedeem >= requiredAmount,
                "Synthetic::redeemSynthetic: under collateral ratio"
            );
            uint256 canWithdrawRemainning =
                assetBackedAmountAfterRedeem.sub(requiredAmount);

            _synthetic.burnFrom(_msgSender(), assetToBeBurned);
            dolly.transfer(_msgSender(), assetBackedToBeRedeemed);

            mn.assetAmount = assetRemainningAfterBurned;
            mn.assetBackedAmount = assetBackedAmountAfterRedeem;
            mn.currentRatio = getCurrentRatio(
                mn.assetBackedAmount,
                assetBackedAtRateAmount
            );
            mn.willLiquidateAtPrice = getWillLiquidateAtPrice(
                exchangeRate,
                mn.currentRatio
            );
            mn.canWithdrawRemainning = canWithdrawRemainning;
            mn.canMintRemainning = getCanMintRemainning(
                canWithdrawRemainning,
                assetBackedAtRateAmount
            );
            mn.currentExchangeRate = exchangeRate;
            mn.updatedAt = block.timestamp;
            mn.updatedBlock = block.number;
            emit RedeemAsset(address(_synthetic), _amount);
        }
    }

    // @info add more collateral for minted contract
    // @param _synthetic: the address of synthetic asset
    // @param _addAmount: amount of Dolly which want to add
    function addCollateral(IERC20Burnable _synthetic, uint256 _addAmount)
        external
        whenNotPaused
        nonReentrant
    {
        MintingNote storage mn = contracts[_msgSender()][address(_synthetic)];
        require(
            mn.assetAmount > 0,
            "Synthetic::addCollateral: cannot add collateral to empty contract"
        );
        mn.assetBackedAmount = mn.assetBackedAmount.add(_addAmount);

        uint256 exchangeRate = getRate(addressToPairs[address(_synthetic)]);
        uint256 assetBackedAtRateAmount =
            (mn.assetAmount.mul(exchangeRate)).div(denominator);
        uint256 requiredAmount =
            (assetBackedAtRateAmount.mul(collateralRatio)).div(denominator);

        uint256 canWithdrawRemainning =
            mn.assetBackedAmount.sub(requiredAmount);
        require(dolly.transferFrom(_msgSender(), address(this), _addAmount));
        mn.currentRatio = getCurrentRatio(
            mn.assetBackedAmount,
            assetBackedAtRateAmount
        );
        mn.willLiquidateAtPrice = getWillLiquidateAtPrice(
            exchangeRate,
            mn.currentRatio
        );
        mn.canWithdrawRemainning = canWithdrawRemainning;
        mn.canMintRemainning = getCanMintRemainning(
            canWithdrawRemainning,
            assetBackedAtRateAmount
        );
        mn.currentExchangeRate = exchangeRate;
        mn.updatedAt = block.timestamp;
        mn.updatedBlock = block.number;
        emit AddCollateral(_msgSender(), _addAmount);
    }

    // @info remove some collateral for minted contract
    // @param _synthetic: the address of synthetic asset
    // @param _removeBackedAmount: amount of collateral which want to remove
    function removeCollateral(
        IERC20Burnable _synthetic,
        uint256 _removeBackedAmount
    ) external whenNotPaused nonReentrant {
        MintingNote storage mn = contracts[_msgSender()][address(_synthetic)];
        require(
            mn.assetAmount > 0,
            "Synthetic::removeCollateral: cannot remove collateral to empty contract"
        );
        mn.assetBackedAmount = mn.assetBackedAmount.sub(_removeBackedAmount);
        require(
            mn.canWithdrawRemainning >= _removeBackedAmount,
            "Synthetic::removeCollateral: amount exceeds required collateral"
        );
        uint256 exchangeRate = getRate(addressToPairs[address(_synthetic)]);
        uint256 assetBackedAtRateAmount =
            (mn.assetAmount.mul(exchangeRate)).div(denominator);
        uint256 requiredAmount =
            (assetBackedAtRateAmount.mul(collateralRatio)).div(denominator);

        uint256 canWithdrawRemainning =
            mn.assetBackedAmount.sub(requiredAmount);
        require(
            canWithdrawRemainning >= 0,
            "Synthetic::removeCollateral: canWithdrawRemainning less than zero"
        );
        dolly.transfer(_msgSender(), _removeBackedAmount);
        mn.currentRatio = getCurrentRatio(
            mn.assetBackedAmount,
            assetBackedAtRateAmount
        );
        mn.willLiquidateAtPrice = getWillLiquidateAtPrice(
            exchangeRate,
            mn.currentRatio
        );
        mn.canWithdrawRemainning = canWithdrawRemainning;
        mn.canMintRemainning = getCanMintRemainning(
            canWithdrawRemainning,
            assetBackedAtRateAmount
        );
        mn.currentExchangeRate = exchangeRate;
        mn.updatedAt = block.timestamp;
        mn.updatedBlock = block.number;
        emit RemoveCollateral(_msgSender(), _removeBackedAmount);
    }

    // @dev for testing purpose.
    // @notice this function will remove some collateral to simulate under collateral and need to be liquidated in the future.
    // @param _synthetic: the address of synthetic asset.
    // @param _removeAmount: amount of collateral which want to remove.
    function removeLowerCollateral(
        IERC20Burnable _synthetic,
        uint256 _removeAmount
    ) external onlyOwner whenNotPaused nonReentrant {
        MintingNote storage mn = contracts[_msgSender()][address(_synthetic)];
        require(
            mn.assetAmount > 0,
            "Synthetic::removeCollateral: cannot remove collateral to empty contract"
        );
        mn.assetBackedAmount = mn.assetBackedAmount.sub(_removeAmount);
        uint256 exchangeRate = getRate(addressToPairs[address(_synthetic)]);
        uint256 assetBackedAtRateAmount =
            (mn.assetAmount.mul(exchangeRate)).div(denominator);
        dolly.transfer(_msgSender(), _removeAmount);
        mn.currentRatio = getCurrentRatio(
            mn.assetBackedAmount,
            assetBackedAtRateAmount
        );
        mn.willLiquidateAtPrice = getWillLiquidateAtPrice(
            exchangeRate,
            mn.currentRatio
        );
        mn.canWithdrawRemainning = 0;
        mn.canMintRemainning = 0;
        mn.currentExchangeRate = exchangeRate;
        mn.updatedAt = block.timestamp;
        mn.updatedBlock = block.number;
        emit RemoveCollateral(_msgSender(), _removeAmount);
    }

    // @dev liquidator must approve Synthetic asset to spending Dolly
    // @param _synthetic: the address of synthetic asset.
    // @param _minter: address of minter.
    function liquidate(IERC20Burnable _synthetic, address _minter)
        external
        whenNotPaused
        nonReentrant
    {
        MintingNote storage mn = contracts[_minter][address(_synthetic)];
        require(
            mn.minter != address(0),
            "Synthetic::liquidate: empty contract"
        );

        // if less than 1.25, will be liquidated
        require(
            mn.currentRatio < liquidationRatio,
            "Synthetic::liquidate: ratio is sastisfy"
        );
        uint256 exchangeRate = getRate(addressToPairs[address(_synthetic)]);
        require(
            mn.willLiquidateAtPrice < exchangeRate,
            "Synthetic::liquidate: asset price is sastisfy"
        );

        uint256 assetBackedAtRateAmount =
            (mn.assetAmount.mul(exchangeRate)).div(denominator);

        uint256 remainingGapAmount =
            mn.assetBackedAmount.sub(assetBackedAtRateAmount);

        uint256 minterReceiveAmount =
            (remainingGapAmount.mul(remainingToMinterRatio)).div(denominator);

        uint256 liquidatorReceiveAmount =
            (remainingGapAmount.mul(liquidatorRewardRatio)).div(denominator);

        uint256 platformReceiveAmount =
            (remainingGapAmount.mul(platfromFeeRatio)).div(denominator);

        dolly.transferFrom(
            _msgSender(),
            address(this),
            assetBackedAtRateAmount
        ); // deduct Doly from liquidator
        dolly.transfer(mn.minter, minterReceiveAmount); // transfer remainning to minter (90%)
        dolly.transfer(_msgSender(), assetBackedAtRateAmount.add(liquidatorReceiveAmount)); // transfer reward to to liquidator (5%) + original amount
        dolly.transfer(devAddress, platformReceiveAmount); // transfer liquidating fee to dev address (5%)

        delete contracts[_minter][address(_synthetic)];
    }

    // @info set the pairs and quotes to calling the oracle
    // @param _pairs: string of pairs e.g. "TSLA/USD".
    // @param baseAndQuote: 2 elements array e.g. ["TSLA"]["USD"].
    function setPairsToQuote(
        string memory _pairs,
        string[2] memory baseAndQuote
    ) external onlyOwner {
        pairsToQuote[_pairs] = baseAndQuote;
    }

    // @info use this function to get the synthetic token address by given string pairs
    // @param _pairs: string of pairs e.g. "TSLA/USD".
    // @param _syntheticAddress: address of synthetic asset.
    function setPairsToAddress(string memory _pairs, address _syntheticAddress)
        external
        onlyOwner
    {
        pairsToAddress[_pairs] = _syntheticAddress;
    }

    // @info map synthetic token address to string of pairs. Used for getRate() function
    // @param _pairs: string of pairs e.g. "TSLA/USD".
    // @param _syntheticAddress: address of synthetic asset.
    function setAddressToPairs(address _syntheticAddress, string memory _pairs)
        external
        onlyOwner
    {
        addressToPairs[_syntheticAddress] = _pairs;
    }

    // @info set dev address to receive liquidation fee.
    // @param _devAddress: new developer address.
    function setDevAddress(address _devAddress) external onlyOwner {
        address oldDevAddress = devAddress;
        devAddress = _devAddress;
        emit SetDevAddress(oldDevAddress, _devAddress);
    }

    // @dev for simulate all relevant amount of liqiodation
    // @notice liquidate bot can call this function to estimate the profit.
    // @param _synthetic: a contract address of synthetic asset.
    // @param _minter: an address of minter.
    function viewRewardFromLiquidate(IERC20Burnable _synthetic, address _minter)
        external
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        MintingNote storage mn = contracts[_minter][address(_synthetic)];
        require(
            mn.minter != address(0),
            "Synthetic::liquidate: empty contract"
        );

        // if less than 1.25, will be liquidated
        require(
            mn.currentRatio < liquidationRatio,
            "Synthetic::liquidate: ratio is sastisfy"
        );
        uint256 exchangeRate = getRate(addressToPairs[address(_synthetic)]);
        require(
            mn.willLiquidateAtPrice < exchangeRate,
            "Synthetic::liquidate: asset price is sastisfy"
        );

        uint256 assetBackedAtRateAmount =
            (mn.assetAmount.mul(exchangeRate)).div(denominator);

        uint256 remainingGapAmount =
            mn.assetBackedAmount.sub(assetBackedAtRateAmount);

        uint256 minterReceiveAmount =
            (remainingGapAmount.mul(remainingToMinterRatio)).div(denominator);

        uint256 liquidatorReceiveAmount =
            (remainingGapAmount.mul(liquidatorRewardRatio)).div(denominator);

        uint256 platformReceiveAmount =
            (remainingGapAmount.mul(platfromFeeRatio)).div(denominator);

        return (
            assetBackedAtRateAmount,
            remainingGapAmount,
            minterReceiveAmount,
            liquidatorReceiveAmount,
            platformReceiveAmount
        );
    }

    // @dev for pause this smart contract to prevent mint, redeem, add collateral, remove collateral, liquidate process.
    function pause() external whenNotPaused onlyOwner {
        _pause();
    }

    // @dev for unpause this smart contract to allow mint, redeem, add collateral, remove collateral, liquidate process.
    function unpause() external whenPaused onlyOwner {
        _unpause();
    }

    // @dev get current rate of given asset by Oracle
    // @param _pairs: the pairs of asset.
    function getRate(string memory _pairs) public view returns (uint256) {
        require(isSupported(_pairs));
        IStdReference.ReferenceData memory data =
            bandOracle.getReferenceData(
                pairsToQuote[_pairs][0],
                pairsToQuote[_pairs][1]
            );
        return data.rate;
    }

    // @dev get current ratio between collateral and minted synthetic asset
    // @param _backedAmount: callateral value
    // @param _assetBackedAtRateAmount: the value of minted synthetic asset
    function getCurrentRatio(
        uint256 _backedAmount,
        uint256 _assetBackedAtRateAmount
    ) internal pure returns (uint256) {
        return
            (
                ((_backedAmount.mul(denominator)).div(_assetBackedAtRateAmount))
                    .mul(denominator)
            )
                .div(denominator);
    }

    // @dev get liquidate price at current ratio
    // @param exchangeRate: the current exchange rate
    // @param currentRatio: the current ratio
    function getWillLiquidateAtPrice(uint256 exchangeRate, uint256 currentRatio)
        internal
        view
        returns (uint256)
    {
        return
            (exchangeRate.mul(currentRatio.sub(liquidationRatio - denominator)))
                .div(denominator);
    }

    // @dev get the maximum amount of asset that can be minted depends on current collateral ratio.
    // @param canWithdrawRemainning: the amount of Dolly that can be withdrawed.
    // @param assetBackedAtRateAmount: the current value of minted synthetic asset.
    function getCanMintRemainning(
        uint256 canWithdrawRemainning,
        uint256 assetBackedAtRateAmount
    ) internal pure returns (uint256) {
        return
            (
                (
                    (canWithdrawRemainning.mul(denominator)).div(
                        assetBackedAtRateAmount
                    )
                )
                    .mul(denominator)
            )
                .div(denominator);
    }

    // @dev get the percent of redeeming.
    // @notice use this function for calculate partial redeeming.
    // @param _amount: the number of synthetic asset that want to redeem.
    // @param assetAmount: the number of minted synthetic asset.
    function getRedeemPercent(uint256 _amount, uint256 assetAmount)
        internal
        pure
        returns (uint256)
    {
        return
            (((_amount.mul(denominator)).div(assetAmount)).mul(denominator))
                .div(denominator);
    }

    // @dev using for get supported asset before do the operation.
    // @param _pairs: the string of pairs e.g. "TSLA/USD"
    function isSupported(string memory _pairs) public view returns (bool) {
        return pairsToAddress[_pairs] != address(0);
    }
}
