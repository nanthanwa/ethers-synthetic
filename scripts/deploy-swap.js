const { ethers, network } = require('hardhat');

async function main() {

  console.log('Network name:', network.name);

  if (network.name === 'kovan') {
    const Swap = await ethers.getContractFactory('Swap', { libraries: { SwapUtils: '0x5059094C47B7a7ee3009E8ef28ADA9c5fFE2E088' } });
    const swap = await Swap.deploy();
    await swap.deployed();
    console.log('Swap deployed to:', swap.address);
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
