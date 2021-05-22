// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;
import "./IStdReference.sol";

contract Oracle {
    IStdReference ref;

    uint256 public price;

    constructor(IStdReference _ref) public {
        ref = _ref;
    }

    function getPrice(string memory _base, string memory quote)
        external
        view
        returns (uint256)
    {
        IStdReference.ReferenceData memory data =
            ref.getReferenceData(_base, quote);
        return data.rate;
    }

    function savePrice(string memory base, string memory quote) external {
        IStdReference.ReferenceData memory data =
            ref.getReferenceData(base, quote);
        price = data.rate;
    }
}
