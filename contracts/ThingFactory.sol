// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
import "./Thing.sol";
import "./CloneFactory.sol";
import "./access/Ownable.sol";

contract ThingFactory is Ownable, CloneFactory {
    address public libraryAddress;

    event ThingCreated(address newThingAddress);

    constructor(address _libraryAddress) public {
        libraryAddress = _libraryAddress;
    }

    function setLibraryAddress(address _libraryAddress) public onlyOwner {
        libraryAddress = _libraryAddress;
    }

    function createThing(string memory _name) public onlyOwner {
        address clone = createClone(libraryAddress);
        Thing(clone).initialize(_name);
        ThingCreated(clone);
    }
}
