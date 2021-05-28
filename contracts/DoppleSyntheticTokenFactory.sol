// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
import "./DoppleSyntheticToken.sol";
import "./CloneFactory.sol";
import "./access/Ownable.sol";

contract DoppleSyntheticTokenFactory is Ownable, CloneFactory {
    address public libraryAddress;

    event SyntheticTokenCreated(address syntheticTokenAddress);

    constructor(address _libraryAddress) public {
        libraryAddress = _libraryAddress;
    }

    function setLibraryAddress(address _libraryAddress) public onlyOwner {
        libraryAddress = _libraryAddress;
    }

    function createSyntheticToken(
        string memory _name,
        string memory _symbol,
        address _owner
    ) public onlyOwner {
        address clone = createClone(libraryAddress);
        DoppleSyntheticToken(clone).initialize(_name, _symbol, _owner);
        emit SyntheticTokenCreated(clone);
    }
}
