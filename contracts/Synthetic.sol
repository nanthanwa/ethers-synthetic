// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;
import "./token/ERC20/IERC20.sol";
import "./token/ERC20/SafeERC20.sol";
import "./access/Ownable.sol";

interface IStdReference {
    /// A structure returned whenever someone requests for standard reference data.
    struct ReferenceData {
        uint256 rate; // base/quote exchange rate, multiplied by 1e18.
        uint256 lastUpdatedBase; // UNIX epoch of the last time when base price gets updated.
        uint256 lastUpdatedQuote; // UNIX epoch of the last time when quote price gets updated.
    }

    /// Returns the price data for the given base/quote pair. Revert if not available.
    function getReferenceData(string memory _base, string memory _quote)
        external
        view
        returns (ReferenceData memory);

    /// Similar to getReferenceData, but with multiple base/quote pairs at once.
    function getReferenceDataBulk(
        string[] memory _bases,
        string[] memory _quotes
    ) external view returns (ReferenceData[] memory);
}

contract Synthetic is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public synAsset;
    IERC20 public dolly;
    IStdReference public oracle;

    mapping(string => string[2]) public supportedAssets; // token's pairs => is supported?

    constructor(IERC20 _dolly, IStdReference _ref) public {
        dolly = _dolly; // use Dolly as collateral
        oracle = _ref;
        supportedAssets["AAPL/USD"] = ["AAPL", "USD"];
        supportedAssets["COIN/USD"] = ["COIN", "USD"];
        supportedAssets["TSLA/USD"] = ["TSLA", "USD"];
        supportedAssets["QQQ/USD"] = ["QQQ", "USD"];
        supportedAssets["AMZN/USD"] = ["AMZN", "USD"];
        supportedAssets["XAU/USD"] = ["XAU", "USD"];
    }

    function mintSynthetic(
        address _synthetic,
        uint256 _amount,
        uint256 _backedAmount
    ) external {}

    function redeemSynthetic() external {}

    function liquidate() external {}

    function getRate(string memory _pairs) internal view returns (uint256) {
        require(isSupported(_pairs));
        IStdReference.ReferenceData memory data =
            oracle.getReferenceData(
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
