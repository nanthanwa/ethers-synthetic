// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./token/ERC20/ERC20.sol";
import "./token/ERC20/ERC20Burnable.sol";
import "./access/Ownable.sol";

contract DoppleSyntheticToken is ERC20Burnable, Ownable {
    event Burn(address indexed _sender, bytes32 indexed _to, uint256 amount);

    // syntheticAddress
    address public syntheticAddress;

    modifier onlySyntheticContract() {
        require(
            msg.sender == syntheticAddress,
            "DoppleSyntheticToken::onlySyntheticContract: only synthetic contract can call"
        );
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        address _syntheticAddress
    ) public ERC20(_name, _symbol, 18) {
        _mint(msg.sender, 10000 ether);
        syntheticAddress = _syntheticAddress;
    }

    function mint(address account, uint256 amount)
        public
        onlySyntheticContract
    {
        _mint(account, amount);
    }

    // Update admin address by the previous dev.
    function setSyntheticAddress(address _syntheticAddress) external onlyOwner {
        syntheticAddress = _syntheticAddress;
    }
}

contract DoppleTSLA is DoppleSyntheticToken {
    constructor(address _syntheticAddress)
        public
        DoppleSyntheticToken(
            "Dopple Synthetic TSLA Token",
            "dTSLA",
            _syntheticAddress
        )
    {}
}

contract DoppleCOIN is DoppleSyntheticToken {
    constructor(address _syntheticAddress)
        public
        DoppleSyntheticToken(
            "Dopple Synthetic COIN Token",
            "dCOIN",
            _syntheticAddress
        )
    {}
}

contract DoppleAAPL is DoppleSyntheticToken {
    constructor(address _syntheticAddress)
        public
        DoppleSyntheticToken(
            "Dopple Synthetic AAPL Token",
            "dAAPL",
            _syntheticAddress
        )
    {}
}

contract DoppleQQQ is DoppleSyntheticToken {
    constructor(address _syntheticAddress)
        public
        DoppleSyntheticToken(
            "Dopple Synthetic QQQ Token",
            "dQQQ",
            _syntheticAddress
        )
    {}
}

contract DoppleAMZN is DoppleSyntheticToken {
    constructor(address _syntheticAddress)
        public
        DoppleSyntheticToken(
            "Dopple Synthetic AMZN Token",
            "dAMZN",
            _syntheticAddress
        )
    {}
}

contract DoppleXAU is DoppleSyntheticToken {
    constructor(address _syntheticAddress)
        public
        DoppleSyntheticToken(
            "Dopple Synthetic XAU Token",
            "dXAU",
            _syntheticAddress
        )
    {}
}
