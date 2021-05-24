// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./token/ERC20/ERC20.sol";
import "./token/ERC20/ERC20Burnable.sol";
import "./access/Ownable.sol";

contract DoppleSyntheticToken is ERC20Burnable, Ownable {
    event Burn(address indexed _sender, bytes32 indexed _to, uint256 amount);

    constructor(string memory _name, string memory _symbol)
        public
        ERC20(_name, _symbol, 18)
    {
        _mint(msg.sender, 10000 ether);
    }

    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }
}

contract DoppleTSLA is DoppleSyntheticToken {
    constructor()
        public
        DoppleSyntheticToken("Dopple Synthetic TSLA Token", "dTSLA")
    {}
}

contract DoppleCOIN is DoppleSyntheticToken {
    constructor()
        public
        DoppleSyntheticToken("Dopple Synthetic COIN Token", "dCOIN")
    {}
}

contract DoppleAAPL is DoppleSyntheticToken {
    constructor()
        public
        DoppleSyntheticToken("Dopple Synthetic AAPL Token", "dAAPL")
    {}
}

contract DoppleQQQ is DoppleSyntheticToken {
    constructor()
        public
        DoppleSyntheticToken("Dopple Synthetic QQQ Token", "dQQQ")
    {}
}

contract DoppleAMZN is DoppleSyntheticToken {
    constructor()
        public
        DoppleSyntheticToken("Dopple Synthetic AMZN Token", "dAMZN")
    {}
}

contract DoppleXAU is DoppleSyntheticToken {
    constructor()
        public
        DoppleSyntheticToken("Dopple Synthetic XAU Token", "dXAU")
    {}
}
