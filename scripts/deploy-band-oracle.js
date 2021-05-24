const { ethers, network } = require('hardhat');

async function main() {

  console.log('Network name:', network.name);

  if (network.name === 'kovan') {
    const BandOracle = await ethers.getContractFactory('BandOracle');
    const bandOracle = await BandOracle.deploy('0x9106f09bf08dfb23fca61a9829543f1c80a81a4b');
    await bandOracle.deployed();
    console.log('BandOracle deployed to:', bandOracle.address);
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
