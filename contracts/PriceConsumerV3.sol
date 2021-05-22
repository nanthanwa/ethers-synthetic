// SPDX-License-Identifier: MIT

// This example code is designed to quickly deploy an example contract using Remix.

pragma solidity 0.6.12;

import "./AggregatorV3Interface.sol";
import "./access/Ownable.sol";

contract PriceConsumerV3 is Ownable {
    AggregatorV3Interface internal priceFeed;

    // pair => aggAddress
    mapping(string => address) public aggAddresses;
    // pair => aggDecimal
    mapping(string => uint8) public aggDecimals;

    constructor() public {
        aggAddresses["AAPL/USD"] = 0xb7Ed5bE7977d61E83534230f3256C021e0fae0B6;
        aggAddresses["AMZN/USD"] = 0x51d08ca89d3e8c12535BA8AEd33cDf2557ab5b2a;
        aggAddresses["COIN/USD"] = 0x2d1AB79D059e21aE519d88F978cAF39d74E31AEB;
        aggAddresses["GOOGL/USD"] = 0xeDA73F8acb669274B15A977Cb0cdA57a84F18c2a;
        aggAddresses["TSLA/USD"] = 0xb31357d152638fd1ae0853d24b9Ea81dF29E3EF2;
        aggAddresses["QQQ/USD"] = 0x9A41B56b2c24683E2f23BdE15c14BC7c4a58c3c4;
        aggAddresses["XAU/USD"] = 0x86896fEB19D8A607c3b11f2aF50A0f239Bd71CD0;

        aggDecimals["AAPL/USD"] = 8;
        aggDecimals["AMZN/USD"] = 8;
        aggDecimals["COIN/USD"] = 8;
        aggDecimals["GOOGL/USD"] = 8;
        aggDecimals["TSLA/USD"] = 8;
        aggDecimals["QQQ/USD"] = 8;
        aggDecimals["XAU/USD"] = 8;
    }

    /**
     * Returns the latest price
     */
    function getLatestPrice(string memory _pair)
        public
        view
        returns (
            uint80,
            int256,
            uint256,
            uint256,
            uint80
        )
    {
        AggregatorV3Interface _priceFeed =
            AggregatorV3Interface(aggAddresses[_pair]);
        (
            uint80 roundID,
            int256 price,
            uint256 startedAt,
            uint256 timeStamp,
            uint80 answeredInRound
        ) = _priceFeed.latestRoundData();
        return (roundID, price, startedAt, timeStamp, answeredInRound);
    }

    function setAggAddress(string memory _pair, address _aggAddress)
        external
        onlyOwner
    {
        aggAddresses[_pair] = _aggAddress;
    }

    function setAggDecimal(string memory _pair, uint8 _decimal)
        external
        onlyOwner
    {
        aggDecimals[_pair] = _decimal;
    }
}
