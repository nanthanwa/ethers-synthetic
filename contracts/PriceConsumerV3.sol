// SPDX-License-Identifier: MIT

// This example code is designed to quickly deploy an example contract using Remix.

pragma solidity 0.6.12;

import "./chainlink/AggregatorV3Interface.sol";
import "./access/Ownable.sol";

contract PriceConsumerV3 is Ownable {
    AggregatorV3Interface internal priceFeed;

    // pair => aggAddress
    mapping(string => address) public aggAddresses;
    // pair => aggDecimal
    mapping(string => uint8) public aggDecimals;

    constructor() public {}

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
        require(
            _aggAddress != address(0),
            "PriceConsumerV3::setAggAddress::cannot set address(0)"
        );
        aggAddresses[_pair] = _aggAddress;
    }

    function setAggDecimal(string memory _pair, uint8 _decimal)
        external
        onlyOwner
    {
        aggDecimals[_pair] = _decimal;
    }
}
