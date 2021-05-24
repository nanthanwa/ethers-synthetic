const { ethers, network } = require('hardhat');

async function main() {

  console.log('Network name:', network.name);

  if (network.name === 'hardhat') {
    const Synthetic = await ethers.getContractFactory('Synthetic');
    const synthetic = await Synthetic.deploy('0xbB114C04e75E22d2AFd3DCc23ffF75C138d274fa', '0x9106f09bf08dfb23fca61a9829543f1c80a81a4b');
    await synthetic.deployed();
    console.log('Synthetic deployed to:', synthetic.address);
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
