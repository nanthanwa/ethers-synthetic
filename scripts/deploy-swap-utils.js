const { ethers, network } = require('hardhat');

async function main() {

  console.log('Network name:', network.name);

  if (network.name === 'kovan') {
    const SwapUtils = await ethers.getContractFactory('SwapUtils', { libraries: { MathUtils: '0xeb0c9Ee2fb17c9aCE397eD097F5272769bBdA27c' } });
    const swapUtils = await SwapUtils.deploy();
    await swapUtils.deployed();
    console.log('SwapUtils deployed to:', swapUtils.address);
  }
  else {
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
