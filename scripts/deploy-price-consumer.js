const { ethers, network } = require('hardhat');

async function main() {

  console.log('Network name:', network.name);

  if (network.name === 'hardhat') {
    const Oracle = await ethers.getContractFactory('Oracle');
    const oracle = await Oracle.deploy('0xDA7a001b254CD22e46d3eAB04d937489c93174C3');
    await oracle.deployed();
    console.log('Oracle deployed to:', oracle.address);
  } else if (network.name === 'bscTestnet') {
    const PriceConsumerV3 = await ethers.getContractFactory('PriceConsumerV3');
    const priceConsumer = await PriceConsumerV3.deploy();
    await priceConsumer.deployed();

    await priceConsumer.getPrice('BTC', 'USD');

    console.log('PriceConsumerV3 deployed to:', oracle.address);
  } else if (network.name === 'kovan') {
    const PriceConsumerV3 = await ethers.getContractFactory('PriceConsumerV3');
    const tsla = await PriceConsumerV3.deploy();
    await tsla.deployed();
    await tsla.setAggAddress('TSLA/USD', '0xb31357d152638fd1ae0853d24b9Ea81dF29E3EF2');
    await tsla.setAggAddress('XAU/USD', '0xc8fb5684f2707C82f28595dEaC017Bfdf44EE9c5');
    await tsla.setAggAddress('FerrariF12TDF/USD', '0x22a2D07993A1A18b3b86E56F960fa735b6D6cFD9');
    await tsla.setAggDecimal('TSLA/USD', '8');
    await tsla.setAggDecimal('XAU/USD', '8');
    await tsla.setAggDecimal('FerrariF12TDF/USD', '8');
    console.log('PriceConsumerV3 deployed to:', tsla.address);
  } else if (network.name === 'bsc') {
    // aggAddresses["AAPL/USD"] = 0xb7Ed5bE7977d61E83534230f3256C021e0fae0B6;
    // aggAddresses["AMZN/USD"] = 0x51d08ca89d3e8c12535BA8AEd33cDf2557ab5b2a;
    // aggAddresses["COIN/USD"] = 0x2d1AB79D059e21aE519d88F978cAF39d74E31AEB;
    // aggAddresses["GOOGL/USD"] = 0xeDA73F8acb669274B15A977Cb0cdA57a84F18c2a;
    // aggAddresses["TSLA/USD"] = 0xb31357d152638fd1ae0853d24b9Ea81dF29E3EF2;
    // aggAddresses["QQQ/USD"] = 0x9A41B56b2c24683E2f23BdE15c14BC7c4a58c3c4;
    // aggAddresses["XAU/USD"] = 0x86896fEB19D8A607c3b11f2aF50A0f239Bd71CD0;

    // aggDecimals["AAPL/USD"] = 8;
    // aggDecimals["AMZN/USD"] = 8;
    // aggDecimals["COIN/USD"] = 8;
    // aggDecimals["GOOGL/USD"] = 8;
    // aggDecimals["TSLA/USD"] = 8;
    // aggDecimals["QQQ/USD"] = 8;
    // aggDecimals["XAU/USD"] = 8;
  } else {
    console.error('please specify the network!');
    return;
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
