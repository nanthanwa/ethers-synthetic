const { ethers, network } = require('hardhat');

async function main() {

  console.log('Network name:', network.name);

  if (network.name === 'kovan') {
    const Clones = await ethers.getContractFactory('Clones');
    const clones = await Clones.deploy();
    await clones.deployed();
    console.log('Clones deployed to:', clones.address);
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
