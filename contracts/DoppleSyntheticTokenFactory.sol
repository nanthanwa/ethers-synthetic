// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
import "./DoppleSyntheticToken.sol";
import "./CloneFactory.sol";
import "./access/Ownable.sol";

contract DoppleSyntheticTokenFactory is Ownable, CloneFactory {
    address public immutable libraryAddress;
    mapping(string => address) public cloned;
    uint16 public clonedCount; // MAX 0-65535

    event SyntheticTokenCreated(address syntheticTokenAddress, string symbol);

    constructor(address _libraryAddress) public {
        libraryAddress = _libraryAddress;
    }

    function createSyntheticToken(
        string memory _name,
        string memory _symbol,
        address _owner
    ) public onlyOwner {
        address clone = createClone(libraryAddress);
        DoppleSyntheticToken(clone).initialize(_name, _symbol, _owner);
        cloned[_symbol] = clone;
        require(
            clonedCount < uint16(65535),
            "DoppleSyntheticTokenFactory::createSyntheticToken: clonedCount overflow"
        );
        clonedCount = clonedCount + 1;
        emit SyntheticTokenCreated(clone, _symbol);
    }

    function pauseAndRemoveCloned(string memory _symbol) public onlyOwner {
        require(
            cloned[_symbol] != address(0),
            "DoppleSyntheticTokenFactory::removeCloned: symbol not found"
        );
        require(
            clonedCount > uint16(0),
            "DoppleSyntheticTokenFactory::createSyntheticToken: clonedCount underflow"
        );
        clonedCount = clonedCount - 1;
        DoppleSyntheticToken(cloned[_symbol]).pause();
        delete cloned[_symbol];
    }
}
