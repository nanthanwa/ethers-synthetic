// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
import "./proxy/Initializable.sol";
import "./access/OwnableUpgradeable.sol";

contract Thing is Initializable, OwnableUpgradeable {
    string public name;

    function initialize(string memory _name) public {
        OwnableUpgradeable.__Ownable_init();
        name = _name;
    }
}
