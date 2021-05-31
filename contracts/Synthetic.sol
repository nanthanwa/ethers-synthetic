// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;
import "./token/ERC20/IERC20.sol";
import "./token/ERC20/SafeERC20.sol";
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

/**
 * @dev Synthetic contract is the contract that minting systhetic asset by given amount of collateral
 * Minter can mint, redeem (some or all all them), add more collateral (to avoid liquidation),
 * remove some collateral (to withdraw the backed asset). If the ratio between collateral and synthetic value
 * goes lower than liquidation ratio, anyone can call the liquidate function to get the reward and close that contract.
 * @notice the requirement of this contract are
 * Contract address of Dolly (constuctor parameter).
 * Contract address of referrence of orale Band protocol (constuctor parameter).
 * Contract address of synthetic token contracts.
 * Set the ownership of synthetic token contract (e.g. TSLA) to this contract.
 * Set the pairsToQuote of supported synthetic asset (e.g. pairsToQuote["TSLA/USD"] = ["TSLA", "USD"]).
 * Set the pairsToAddress of supported synthetic asset (e.g. pairsToAddress["TSLA/USD"] = 0x65cAC0F09EFdB88195a002E8DD4CBF6Ec9BC7f60).
 * Set the pairsToAddress of supported synthetic asset (e.g. pairsToAddress["TSLA/USD"] = 0x65cAC0F09EFdB88195a002E8DD4CBF6Ec9BC7f60).
 * Set the addressToPairs of supported synthetic asset (e.g.) addressToPairs[0x65cAC0F09EFdB88195a002E8DD4CBF6Ec9BC7f60] = "TSLA/USD".
 */
contract Synthetic is Ownable, Pausable, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

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
    event AddSynthetic(address indexed user, uint256 amount);
    event RemoveSynthetic(address indexed user, uint256 amount);
    event Liquidated(
        address indexed liquidated,
        address indexed liquidator,
        address indexed syntheticAddress,
        uint256 amount,
        uint256 timestamp
    );

    event SetDevAddress(address oldDevAddress, address newDevAddress);
    event SetCollateralRatio(
        uint256 oldCollateralRatio,
        uint256 newCollateralRatio
    );
    event SetLiquidationRatio(
        uint256 oldLiquidationRatio,
        uint256 newLiquidationRatio
    );
    event SetLiquidatorRewardRatio(
        uint256 oldLiquidatorRewardRatio,
        uint256 newLiquidatorRewardRatio
    );
    event SetPlatfromFeeRatio(
        uint256 oldPlatfromFeeRatio,
        uint256 newPlatfromFeeRatio
    );
    event SetRemainingToMinterRatio(
        uint256 oldRemainingToMinterRatio,
        uint256 newRemainingToMinterRatio
    );

    /**
     * @dev the constructor requires an address of Dolly and referrence of oracle Band Protocol
     * @param _dolly smartcontract address of Dolly
     * @param _ref referrence of oracle Band Protocol
     */
    constructor(IERC20 _dolly, IStdReference _ref) public {
        dolly = _dolly; // use Dolly as collateral
        bandOracle = _ref;
        devAddress = _msgSender();
    }

    /**
     * @dev user need to approve for deducting $DOLLY at Dolly contract first.
     * @param _synthetic name
     * @param _amount amount of synthetic that want to mint
     * @param _backedAmount amount of Dolly that you want to collateral
     */
    function mintSynthetic(
        IERC20Burnable _synthetic,
        uint256 _amount,
        uint256 _backedAmount
    ) external whenNotPaused nonReentrant {
        MintingNote storage mn = contracts[_msgSender()][address(_synthetic)];

        uint256 exchangeRate = getRate(addressToPairs[address(_synthetic)]);
        uint256 assetBackedAtRateAmount = getProductOf(_amount, exchangeRate);
        uint256 requiredAmount =
            getProductOf(assetBackedAtRateAmount, collateralRatio);
        require(
            _backedAmount >= requiredAmount,
            "Synthetic::mintSynthetic: under collateral"
        );
        _synthetic.mint(_msgSender(), _amount);
        dolly.safeTransferFrom(_msgSender(), address(this), _backedAmount);
        mn.minter = _msgSender();
        mn.asset = _synthetic;
        mn.assetBacked = dolly;
        mn.assetAmount = _amount;
        mn.assetBackedAmount = _backedAmount;
        mn.exchangeRateAtMinted = exchangeRate;
        mn.currentExchangeRate = exchangeRate;
        mn.currentRatio = getRatioOf(_backedAmount, assetBackedAtRateAmount);
        mn.willLiquidateAtPrice = getWillLiquidateAtPrice(
            exchangeRate,
            mn.currentRatio
        );
        mn.canWithdrawRemainning = _backedAmount.sub(requiredAmount);
        mn.canMintRemainning = getRatioOf(
            mn.canWithdrawRemainning,
            assetBackedAtRateAmount
        );
        mn.updatedAt = block.timestamp;
        mn.updatedBlock = block.number;
        emit MintAsset(_msgSender(), address(_synthetic), _amount);
    }

    /**
     * @dev minter needs to approve for burn at SyntheticAsset before call this function.
     * @param _synthetic amount of synthetic that want to mint
     * @param _amount amount of Dolly that you want to collateral
     */
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
            dolly.safeTransfer(_msgSender(), mn.assetBackedAmount);
            delete contracts[_msgSender()][address(_synthetic)];
            emit RedeemAsset(address(_synthetic), _amount);
        } else {
            // patial redeeming
            uint256 percent = getRatioOf(_amount, mn.assetAmount);
            uint256 assetToBeBurned = getProductOf(mn.assetAmount, percent);
            uint256 assetBackedToBeRedeemed =
                getProductOf(mn.assetBackedAmount, percent);
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
            _synthetic.burnFrom(_msgSender(), assetToBeBurned);
            dolly.safeTransfer(_msgSender(), assetBackedToBeRedeemed);

            mn.assetAmount = assetRemainningAfterBurned;
            mn.assetBackedAmount = assetBackedAmountAfterRedeem;
            mn.currentRatio = getRatioOf(
                mn.assetBackedAmount,
                assetBackedAtRateAmount
            );
            mn.willLiquidateAtPrice = getWillLiquidateAtPrice(
                exchangeRate,
                mn.currentRatio
            );
            mn.canWithdrawRemainning = assetBackedAmountAfterRedeem.sub(
                requiredAmount
            );
            mn.canMintRemainning = getRatioOf(
                mn.canWithdrawRemainning,
                assetBackedAtRateAmount
            );
            mn.currentExchangeRate = exchangeRate;
            mn.updatedAt = block.timestamp;
            mn.updatedBlock = block.number;
            emit RedeemAsset(address(_synthetic), _amount);
        }
    }

    /**
     * @dev add more collateral for minted contract
     * @param _synthetic the address of synthetic asset
     * @param _addAmount amount of Dolly which want to add
     */
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
        dolly.safeTransferFrom(_msgSender(), address(this), _addAmount);
        mn.currentRatio = getRatioOf(
            mn.assetBackedAmount,
            assetBackedAtRateAmount
        );
        mn.willLiquidateAtPrice = getWillLiquidateAtPrice(
            exchangeRate,
            mn.currentRatio
        );
        mn.canWithdrawRemainning = mn.assetBackedAmount.sub(requiredAmount);
        mn.canMintRemainning = getRatioOf(
            mn.canWithdrawRemainning,
            assetBackedAtRateAmount
        );
        mn.currentExchangeRate = exchangeRate;
        mn.updatedAt = block.timestamp;
        mn.updatedBlock = block.number;
        emit AddCollateral(_msgSender(), _addAmount);
    }

    /**
     * @dev remove some collateral for minted contract
     * @param _synthetic the address of synthetic asset
     * @param _removeBackedAmount amount of collateral which want to remove
     */
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
        uint256 exchangeRate = getRate(addressToPairs[address(_synthetic)]);
        uint256 assetBackedAtRateAmount =
            getProductOf(mn.assetAmount, exchangeRate);
        uint256 requiredAmount =
            getProductOf(assetBackedAtRateAmount, collateralRatio);
        uint256 canWithdrawRemainning =
            mn.assetBackedAmount.sub(requiredAmount);
        require(
            canWithdrawRemainning >= _removeBackedAmount,
            "Synthetic::removeCollateral: amount exceeds required collateral"
        );
        dolly.safeTransfer(_msgSender(), _removeBackedAmount);
        mn.currentRatio = getRatioOf(
            mn.assetBackedAmount,
            assetBackedAtRateAmount
        );
        mn.willLiquidateAtPrice = getWillLiquidateAtPrice(
            exchangeRate,
            mn.currentRatio
        );
        mn.canWithdrawRemainning = canWithdrawRemainning;
        mn.canMintRemainning = getRatioOf(
            canWithdrawRemainning,
            assetBackedAtRateAmount
        );
        mn.currentExchangeRate = exchangeRate;
        mn.updatedAt = block.timestamp;
        mn.updatedBlock = block.number;
        emit RemoveCollateral(_msgSender(), _removeBackedAmount);
    }

    /**
     * @dev for testing purpose.
     * @notice this function will remove some collateral to simulate under collateral and need to be liquidated in the future.
     * @param _synthetic: the address of synthetic asset.
     * @param _removeAmount: amount of collateral which want to remove.
     */
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
        dolly.safeTransfer(_msgSender(), _removeAmount);
        mn.currentRatio = getRatioOf(
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

    /**
     * @dev if minter have a lot of collateral, minter can get more synthetic asset while the collateral ratio is sastisfy
     * @param _synthetic the address of synthetic asset.
     * @param _addAmount the amount of synthetic asset that want to mint more.
     */
    function addSynthetic(IERC20Burnable _synthetic, uint256 _addAmount)
        external
        whenNotPaused
        nonReentrant
    {
        MintingNote storage mn = contracts[_msgSender()][address(_synthetic)];
        require(
            mn.assetAmount > 0,
            "Synthetic::addCollateral: cannot add synthetic to empty contract"
        );
        mn.assetAmount = mn.assetAmount.add(_addAmount);
        uint256 exchangeRate = getRate(addressToPairs[address(_synthetic)]);
        uint256 assetBackedAtRateAmount =
            getProductOf(mn.assetAmount, exchangeRate);
        uint256 requiredAmount =
            getProductOf(assetBackedAtRateAmount, collateralRatio);
        require(
            mn.assetBackedAmount > requiredAmount,
            "Synthetic::addSynthetic: under collateral"
        );
        _synthetic.mint(_msgSender(), _addAmount);
        mn.currentRatio = getRatioOf(
            mn.assetBackedAmount,
            assetBackedAtRateAmount
        );
        mn.willLiquidateAtPrice = getWillLiquidateAtPrice(
            exchangeRate,
            mn.currentRatio
        );
        mn.canWithdrawRemainning = mn.assetBackedAmount.sub(requiredAmount);
        mn.canMintRemainning = getRatioOf(
            mn.canWithdrawRemainning,
            assetBackedAtRateAmount
        );
        mn.currentExchangeRate = exchangeRate;
        mn.updatedAt = block.timestamp;
        mn.updatedBlock = block.number;
        emit AddSynthetic(_msgSender(), _addAmount);
    }

    /**
     * @dev if minter have a lot of synthetic asset, minter can remove synthetic asset to increase the collateral ratio
     * @param _synthetic: the address of synthetic asset.
     * @param _removeAmount: amount of synthetic asset that want to remove.
     */
    function removeSynthetic(IERC20Burnable _synthetic, uint256 _removeAmount)
        external
        whenNotPaused
        nonReentrant
    {
        MintingNote storage mn = contracts[_msgSender()][address(_synthetic)];
        require(
            mn.assetAmount > 0,
            "Synthetic::removeSynthetic: cannot add synthetic to empty contract"
        );
        mn.assetAmount = mn.assetAmount.sub(_removeAmount);
        uint256 exchangeRate = getRate(addressToPairs[address(_synthetic)]);
        uint256 assetBackedAtRateAmount =
            getProductOf(mn.assetAmount, exchangeRate);
        uint256 requiredAmount =
            getProductOf(assetBackedAtRateAmount, collateralRatio);
        _synthetic.burnFrom(_msgSender(), _removeAmount);
        mn.currentRatio = getRatioOf(
            mn.assetBackedAmount,
            assetBackedAtRateAmount
        );
        mn.willLiquidateAtPrice = getWillLiquidateAtPrice(
            exchangeRate,
            mn.currentRatio
        );
        mn.canWithdrawRemainning = mn.assetBackedAmount.sub(requiredAmount);
        mn.canMintRemainning = getRatioOf(
            mn.canWithdrawRemainning,
            assetBackedAtRateAmount
        );
        mn.currentExchangeRate = exchangeRate;
        mn.updatedAt = block.timestamp;
        mn.updatedBlock = block.number;
        emit RemoveSynthetic(_msgSender(), _removeAmount);
    }

    /**
     * @dev liquidator must approve Synthetic asset to spending Dolly
     * @param _synthetic the address of synthetic asset.
     * @param _minter address of minter.
     */
    function liquidate(IERC20Burnable _synthetic, address _minter)
        external
        whenNotPaused
        nonReentrant
    {
        (
            uint256 assetBackedAtRateAmount,
            uint256 remainingGapAmount,
            uint256 minterReceiveAmount,
            uint256 liquidatorReceiveAmount,
            uint256 platformReceiveAmount
        ) = getRewardFromLiquidate(_synthetic, _minter);

        if (remainingGapAmount > 0) {
            // collateral ratio is between 1.0 - 1.25, so liquidator will get the reward.
            dolly.safeTransferFrom(
                _msgSender(),
                address(this),
                assetBackedAtRateAmount
            ); // deduct Doly from liquidator.
            dolly.safeTransfer(_minter, minterReceiveAmount); // transfer remainning to minter (90%).
            dolly.safeTransfer(
                _msgSender(),
                assetBackedAtRateAmount.add(liquidatorReceiveAmount)
            ); // transfer reward to to liquidator (5%) + original amount.
            dolly.safeTransfer(devAddress, platformReceiveAmount); // transfer liquidating fee to dev address (5%).
        } else {
            // collateral ratio is less than 1.0.
            dolly.safeTransferFrom(
                _msgSender(),
                address(this),
                assetBackedAtRateAmount
            ); // deduct Doly from liquidator.
        }
        delete contracts[_minter][address(_synthetic)];
    }

    /**
     * @dev set the pairs and quotes to calling the oracle.
     * @param _pairs string of pairs e.g. "TSLA/USD".
     * @param baseAndQuote 2 elements array e.g. ["TSLA"]["USD"].
     */
    function setPairsToQuote(
        string memory _pairs,
        string[2] memory baseAndQuote
    ) external onlyOwner {
        pairsToQuote[_pairs] = baseAndQuote;
    }

    /**
     * @dev use this function to get the synthetic token address by given string pairs.
     * @param _pairs string of pairs e.g. "TSLA/USD".
     * @param _syntheticAddress address of synthetic asset.
     */
    function setPairsToAddress(string memory _pairs, address _syntheticAddress)
        external
        onlyOwner
    {
        pairsToAddress[_pairs] = _syntheticAddress;
    }

    /**
     * @dev map synthetic token address to string of pairs. Used for getRate() function
     * @param _pairs string of pairs e.g. "TSLA/USD".
     * @param _syntheticAddress address of synthetic asset.
     */
    function setAddressToPairs(address _syntheticAddress, string memory _pairs)
        external
        onlyOwner
    {
        addressToPairs[_syntheticAddress] = _pairs;
    }

    /**
     * @dev set dev address to receive liquidation fee.
     * @param _devAddress new developer address.
     */
    function setDevAddress(address _devAddress) external onlyOwner {
        address oldDevAddress = devAddress;
        devAddress = _devAddress;
        emit SetDevAddress(oldDevAddress, _devAddress);
    }

    /**
     * @dev set collateral ratio.
     * @param _collateralRatio: new collateral ratio.
     */
    function setCollateralRatio(uint256 _collateralRatio) external onlyOwner {
        uint256 oldCollateralRatio = collateralRatio;
        collateralRatio = _collateralRatio;
        emit SetCollateralRatio(oldCollateralRatio, _collateralRatio);
    }

    /**
     * @dev set liquidation ratio.
     * @param _liquidationRatio new liquidation ratio.
     */
    function setLiquidationRatio(uint256 _liquidationRatio) external onlyOwner {
        uint256 oldLiquidationRatio = liquidationRatio;
        liquidationRatio = _liquidationRatio;
        emit SetLiquidationRatio(oldLiquidationRatio, _liquidationRatio);
    }

    /**
     * @dev set liquidator reward ratio.
     * @param _liquidatorRewardRatio new liquidator reward ratio.
     */
    function setLiquidatorRewardRatio(uint256 _liquidatorRewardRatio)
        external
        onlyOwner
    {
        uint256 oldLiquidatorRewardRatio = liquidatorRewardRatio;
        liquidatorRewardRatio = _liquidatorRewardRatio;
        emit SetLiquidatorRewardRatio(
            oldLiquidatorRewardRatio,
            _liquidatorRewardRatio
        );
    }

    /**
     * @dev set platfrom fee ratio.
     * @param _platfromFeeRatio new platfrom fee ratio.
     */
    function setPlatfromFeeRatio(uint256 _platfromFeeRatio) external onlyOwner {
        uint256 oldPlatfromFeeRatio = platfromFeeRatio;
        platfromFeeRatio = _platfromFeeRatio;
        emit SetPlatfromFeeRatio(oldPlatfromFeeRatio, _platfromFeeRatio);
    }

    /**
     * @dev set remaining of backed asset to minter ratio.
     * @param _remainingToMinterRatio new remaining to minter ratio.
     */
    function setRemainingToMinterRatio(uint256 _remainingToMinterRatio)
        external
        onlyOwner
    {
        uint256 oldRemainingToMinterRatio = remainingToMinterRatio;
        remainingToMinterRatio = _remainingToMinterRatio;
        emit SetRemainingToMinterRatio(
            oldRemainingToMinterRatio,
            _remainingToMinterRatio
        );
    }

    /**
     * @dev for simulate all relevant amount of liqiodation
     * @notice both liquidate bot and this contract can call this function to estimate the profit.
     * @param _synthetic a contract address of synthetic asset.
     * @param _minter an address of minter.
     */
    function getRewardFromLiquidate(IERC20Burnable _synthetic, address _minter)
        public
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
            getProductOf(mn.assetAmount, exchangeRate);

        uint256 remainingGapAmount;
        uint256 minterReceiveAmount;
        uint256 liquidatorReceiveAmount;
        uint256 platformReceiveAmount;

        if (mn.assetBackedAmount > assetBackedAtRateAmount) {
            // liquidator will receive the reward because liquidation ratio is more than 1.0 (and less than 1.25)
            remainingGapAmount = mn.assetBackedAmount - assetBackedAtRateAmount; // no need to check overflow
            minterReceiveAmount = getProductOf(
                remainingGapAmount,
                remainingToMinterRatio
            );

            liquidatorReceiveAmount = getProductOf(
                remainingGapAmount,
                liquidatorRewardRatio
            );

            platformReceiveAmount = getProductOf(
                remainingGapAmount,
                platfromFeeRatio
            );
        }
        // ELSE
        // Too late to liquidate, liquidator need to pay extra amount because
        // the current collateral value is less than minted synthetic value (collateral ratio < 1)
        // to close this contract, liquidator must pay off 100% of collateral value

        return (
            assetBackedAtRateAmount,
            remainingGapAmount,
            minterReceiveAmount,
            liquidatorReceiveAmount,
            platformReceiveAmount
        );
    }

    /**
     * @dev for pause this smart contract to prevent mint, redeem, add collateral, remove collateral, liquidate process.
     */
    function pause() external whenNotPaused onlyOwner {
        _pause();
    }

    /**
     * @dev for unpause this smart contract to prevent mint, redeem, add collateral, remove collateral, liquidate process.
     */
    function unpause() external whenPaused onlyOwner {
        _unpause();
    }

    /**
     * @dev get current rate of given asset by Oracle
     * @param _pairs the pairs of asset.
     */
    function getRate(string memory _pairs) public view returns (uint256) {
        require(isSupported(_pairs));
        IStdReference.ReferenceData memory data =
            bandOracle.getReferenceData(
                pairsToQuote[_pairs][0],
                pairsToQuote[_pairs][1]
            );
        return data.rate;
    }

    /**
     * @dev get liquidate price at current ratio
     * @param exchangeRate the current exchange rate
     * @param currentRatio the current ratio
     */
    function getWillLiquidateAtPrice(uint256 exchangeRate, uint256 currentRatio)
        internal
        view
        returns (uint256)
    {
        return
            (exchangeRate.mul(currentRatio.sub(liquidationRatio - denominator)))
                .div(denominator);
    }

    /**
     * @dev using for get supported asset before do the operation.
     * @param _pairs the string of pairs e.g. "TSLA/USD"
     */
    function isSupported(string memory _pairs) public view returns (bool) {
        return pairsToAddress[_pairs] != address(0);
    }

    /**
     * @dev using for get supported asset before do the operation.
     * @notice this function cal calculate multi purposes e.g.
     * 1. get assetBackedAtRateAmount
     * 2. get requiredAmount
     * 3. get assetToBeBurned
     * 4. get assetBackedToBeRedeemed
     * @param _amount amount of base
     * @param _multiplier amount of multiplier
     */
    function getProductOf(uint256 _amount, uint256 _multiplier)
        internal
        pure
        returns (uint256)
    {
        return (_amount.mul(_multiplier)).div(denominator);
    }

    /**
     * @dev this function cal calculate multi purposes e.g.
     * @notice this function cal calculate multi purposes e.g.
     * 1. get currentRatio: current ratio between collateral and minted synthetic asset
     * 2. get canMintRemainning: the maximum amount of asset that can be minted depends on current collateral ratio.
     * 3. get percent: the percent of redeeming (in partial redeeming function).
     * @param _amount amount of base
     * @param _divider amount of divider
     */
    function getRatioOf(uint256 _amount, uint256 _divider)
        internal
        pure
        returns (uint256)
    {
        return
            (((_amount.mul(denominator)).div(_divider)).mul(denominator)).div(
                denominator
            );
    }
}
