const { ethers, network } = require('hardhat');

async function main() {

  console.log('Network name:', network.name);

  if (network.name === 'kovan') {
    const MathUtils = await ethers.getContractFactory('MathUtils');
    const mathUtils = await MathUtils.deploy();
    await mathUtils.deployed();
    console.log('MathUtils deployed to:', mathUtils.address);
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
