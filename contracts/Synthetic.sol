// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;
import "./token/ERC20/IERC20.sol";
import "./access/Ownable.sol";
import "./IStdReference.sol";

interface IERC20Burnable is IERC20 {
    function burn(uint256 amount) external;

    function burnFrom(address account, uint256 amount) external;

    function mint(address account, uint256 amount) external;
}

contract Synthetic is Ownable {
    IERC20Burnable public systheticAsset;
    IERC20 public dolly;
    IStdReference public bandOracle;

    mapping(string => string[2]) public pairsToQuote;
    mapping(string => address) public pairsToAddress;
    mapping(address => string) public addressToPairs;

    uint256 public denominator = 1e18; // 1 scaled by 1e18
    uint256 public collateralRatio = 1e18 + 5e17; // 1.5 scaled by 1e18 (> 1.5 is good)
    uint256 public liquidationRatio = 1e18 + 25e16; // 1.25 scaled by 1e18

    struct MintingNote {
        address minter;
        IERC20Burnable asset; // synthetic
        IERC20 assetBacked; // dolly
        uint256 assetAmount;
        uint256 assetBackedAmount;
        uint256 currentRatio;
        uint256 willLiquidateAtPrice;
        uint256 canMintRemainning;
        uint256 canWithdrawRemainning;
        uint256 updatedAt;
        uint256 updatedBlock;
        uint256 pastDays;
        uint256 exchangeRateAtMinted;
    }

    mapping(address => mapping(address => MintingNote)) public minter; // lender => asset => MintingNote

    event MintAsset(
        address minter,
        address indexed syntheticAddress,
        uint256 amount
    );
    event RedeemAsset(address indexed syntheticAddress, uint256 amount);
    event addCollateral(address indexed user, uint256 amount);
    event removeCollateral(address indexed user, uint256 amount);
    event liquidated(
        address indexed liquidated,
        address indexed liquidator,
        address indexed syntheticAddress,
        uint256 amount,
        uint256 timestamp
    );

    constructor(IERC20 _dolly, IStdReference _ref) public {
        dolly = _dolly; // use Dolly as collateral
        bandOracle = _ref;
        pairsToQuote["TSLA/USD"] = ["TSLA", "USD"];

        pairsToAddress["TSLA/USD"] = 0x65cAC0F09EFdB88195a002E8DD4CBF6Ec9BC7f60;

        addressToPairs[0x65cAC0F09EFdB88195a002E8DD4CBF6Ec9BC7f60] = "TSLA/USD";
    }

    // user need to approve for synthetic mint at dolly contract first.
    function mintSynthetic(
        IERC20Burnable _synthetic,
        uint256 _amount, // amount of synthetic that want to mint
        uint256 _backedAmount // amount of Dolly that you want to collateral
    ) external {
        MintingNote storage mn = minter[_msgSender()][address(_synthetic)];
        require(
            mn.minter == address(0),
            "Synthetic::mintSynthetic: transfer to address(0)"
        );

        uint256 exchangeRate = getRate(addressToPairs[address(_synthetic)]);
        uint256 assetBackedAtRateAmount =
            (_amount * exchangeRate) / denominator; // 606872500000000000000
        uint256 requiredAmount =
            (assetBackedAtRateAmount * collateralRatio) / denominator;
        require(
            _backedAmount >= requiredAmount,
            "Synthetic::mintSynthetic: under collateral"
        );
        uint256 canWithdrawRemainning = _backedAmount - requiredAmount;
        _synthetic.mint(_msgSender(), _amount);

        require(dolly.transferFrom(_msgSender(), address(this), _backedAmount));
        mn.minter = _msgSender();
        mn.asset = _synthetic;
        mn.assetBacked = dolly;
        mn.assetAmount = _amount;
        mn.assetBackedAmount = _backedAmount;
        mn.canWithdrawRemainning = canWithdrawRemainning;
        mn.canMintRemainning =
            (((canWithdrawRemainning * denominator) / exchangeRate) *
                denominator) /
            denominator;
        mn.exchangeRateAtMinted = exchangeRate;
        mn.currentRatio =
            (((_backedAmount * denominator) / exchangeRate) * denominator) /
            denominator; // must more than 1.5 ratio (15e17)
        mn.willLiquidateAtPrice =
            (_backedAmount * liquidationRatio) /
            denominator; // more assetBacked, more liquidatePrice
        mn.updatedAt = block.timestamp;
        mn.updatedBlock = block.number;
        emit MintAsset(_msgSender(), address(_synthetic), _amount);
    }

    // minter needs to approve for burn at SyntheticAsset before call this function.
    // ne need to redeem entire colateral amount
    function redeemSynthetic(IERC20Burnable _synthetic, uint256 _amount)
        external
    {
        MintingNote storage mn = minter[_msgSender()][address(_synthetic)];

        require(
            mn.assetAmount >= _amount,
            "Synthetic::redeemSynthetic: amount exceeds collateral"
        );
        uint256 percent = (_amount / mn.assetAmount) * denominator;
        uint256 assetToBeBurned =
            (mn.assetAmount * (denominator - percent)) / denominator;
        uint256 assetBackedToBeRedeemed =
            (mn.assetBackedAmount * (denominator - percent)) / denominator;

        _synthetic.burnFrom(_msgSender(), assetToBeBurned);
        dolly.transfer(_msgSender(), assetBackedToBeRedeemed);

        uint256 exchangeRate = getRate(addressToPairs[address(_synthetic)]);

        mn.assetAmount = mn.assetAmount - assetToBeBurned;
        mn.assetBackedAmount = mn.assetBackedAmount - assetBackedToBeRedeemed;
        mn.willLiquidateAtPrice =
            (mn.assetBackedAmount / liquidationRatio) *
            denominator;
        mn.currentRatio = (mn.assetBackedAmount / exchangeRate) * denominator; // must more than 1.5 ratio
        // mn.canWithdrawRemainning = canWithdrawRemainning;
        // mn.canMintRemainning =
        //     (canWithdrawRemainning * exchangeRate) /
        //     denominator;
        mn.updatedAt = block.timestamp;
        mn.updatedBlock = block.number;
    }

    function liquidate() external {}

    function getRate(string memory _pairs) public view returns (uint256) {
        require(isSupported(_pairs));
        IStdReference.ReferenceData memory data =
            bandOracle.getReferenceData(
                pairsToQuote[_pairs][0],
                pairsToQuote[_pairs][1]
            );
        return data.rate;
    }

    function isSupported(string memory _pairs) public view returns (bool) {
        return pairsToQuote[_pairs].length > 0;
    }

    function setPairsToQuote(
        string memory _pairs,
        string[2] memory baseAndQuote
    ) external onlyOwner {
        pairsToQuote[_pairs] = baseAndQuote;
    }

    function setPairsToAddress(string memory _pairs, address _syntheticAddress)
        external
        onlyOwner
    {
        pairsToAddress[_pairs] = _syntheticAddress;
    }

    function setAddressToPairs(address _syntheticAddress, string memory _pairs)
        external
        onlyOwner
    {
        addressToPairs[_syntheticAddress] = _pairs;
    }
}
