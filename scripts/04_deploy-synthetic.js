const { ethers, network } = require('hardhat');

async function main() {

  console.log('Network name:', network.name);

  if (network.name === 'kovan') {
    const Synthetic = await ethers.getContractFactory('Synthetic');
    const synthetic = await Synthetic.deploy('0x172018C14eeA6312BF4243BFa3d07249feA7E542', '0x9106f09bf08dfb23fca61a9829543f1c80a81a4b'); // dolly, bandRef
    await synthetic.deployed();
    console.log('Synthetic', synthetic.address);
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
