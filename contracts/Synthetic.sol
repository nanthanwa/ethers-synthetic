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

    mapping(string => string[2]) public supportedAssets;
    mapping(string => address) public supportedAssetsAddr;

    constructor(IERC20 _dolly, IStdReference _ref) public {
        dolly = _dolly; // use Dolly as collateral
        bandOracle = _ref;
        supportedAssets["TSLA/USD"] = ["TSLA", "USD"];

        supportedAssetsAddr[
            "TSLA/USD"
        ] = 0x65cAC0F09EFdB88195a002E8DD4CBF6Ec9BC7f60;
    }

    // user need to approve for synthetic mint at dolly contract first.
    function mintSynthetic(
        IERC20Burnable _synthetic,
        uint256 _amount,
        uint256 _backedAmount
    ) external {
        _synthetic.mint(_msgSender(), _amount);
        dolly.transferFrom(_msgSender(), address(this), _backedAmount);
    }

    // user need to approve for burn at SyntheticAsset before call this function.
    function redeemSynthetic(IERC20Burnable _synthetic, uint256 _amount)
        external
    {
        _synthetic.burnFrom(_msgSender(), _amount);
    }

    function liquidate() external {}

    function getRate(string memory _pairs) internal view returns (uint256) {
        require(isSupported(_pairs));
        IStdReference.ReferenceData memory data =
            bandOracle.getReferenceData(
                supportedAssets[_pairs][0],
                supportedAssets[_pairs][1]
            );
        return data.rate;
    }

    function isSupported(string memory _pairs) public view returns (bool) {
        return supportedAssets[_pairs].length > 0;
    }

    function stringToBytesArray(string memory _str)
        internal
        pure
        returns (bytes memory)
    {
        return bytes(_str);
    }

    function bytesArrayToString(bytes memory _bytes)
        internal
        pure
        returns (string memory)
    {
        return string(_bytes);
    }
}
