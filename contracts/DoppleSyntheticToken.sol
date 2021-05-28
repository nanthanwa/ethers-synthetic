// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
import "./token/ERC20/ERC20BurnableUpgradeable.sol";
import "./proxy/Initializable.sol";
import "./access/OwnableUpgradeable.sol";

contract DoppleSyntheticToken is
    Initializable,
    OwnableUpgradeable,
    ERC20BurnableUpgradeable
{
    function initialize(
        string memory _name,
        string memory _symbol,
        address _owner
    ) public initializer {
        __Ownable_init_unchained();
        transferOwnership(_owner);
        __ERC20_init_unchained(_name, _symbol);
    }

    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }
}
