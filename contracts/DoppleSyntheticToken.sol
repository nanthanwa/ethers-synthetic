// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
import "./token/ERC20/ERC20BurnableUpgradeable.sol";
import "./proxy/Initializable.sol";
import "./access/OwnableUpgradeable.sol";
import "./utils/PausableUpgradeable.sol";

contract DoppleSyntheticToken is
    Initializable,
    OwnableUpgradeable,
    ERC20BurnableUpgradeable,
    PausableUpgradeable
{
    address public synthetic;

    event SetSyntheticAddress(address oldAddress, address newAddress);

    function initialize(
        string memory _name,
        string memory _symbol,
        address _owner,
        address _synthetic
    ) public initializer {
        __Ownable_init_unchained();
        transferOwnership(_owner); // Admin (EOA)
        __ERC20_init_unchained(_name, _symbol);
        __Pausable_init_unchained();
        synthetic = _synthetic; // Synthetic contract
    }

    function mint(address account, uint256 amount) public whenNotPaused {
        require(
            _msgSender() == synthetic,
            "DoppleSyntheticToken::mint: only synthetic contract can mint"
        );
        _mint(account, amount);
    }

    function setSyntheticAddress(address _synthetic) public onlyOwner {
        address oldSynthetic = synthetic;
        synthetic = _synthetic;
        emit SetSyntheticAddress(oldSynthetic, _synthetic);
    }

    function pause() public whenNotPaused {
        require(
            _msgSender() == synthetic,
            "DoppleSyntheticToken::pause: only synthetic contract can pause"
        );
        _pause();
    }
}
