const { ethers, network } = require('hardhat');

async function main() {

  console.log('Network name:', network.name);

  if (network.name === 'kovan') {
    const DoppleTSLA = await ethers.getContractFactory('DoppleTSLA');
    const doppleTSLA = await DoppleTSLA.deploy("0x779727409FeEc915B98E574f4EfEbB9f427f74B0");
    await doppleTSLA.deployed();
    console.log('DoppleTSLA deployed to:', doppleTSLA.address);
    // const DoppleCOIN = await ethers.getContractFactory('DoppleCOIN');
    // const doppleCoin = await DoppleCOIN.deploy();
    // await doppleCoin.deployed();
    // console.log('DoppleCOIN deployed to:', doppleCoin.address);
    // const DoppleAAPL = await ethers.getContractFactory('DoppleAAPL');
    // const doppleAAPL = await DoppleAAPL.deploy();
    // await doppleAAPL.deployed();
    // console.log('DoppleAAPL deployed to:', doppleAAPL.address);
    // const DoppleQQQ = await ethers.getContractFactory('DoppleQQQ');
    // const doppleQQQ = await DoppleQQQ.deploy();
    // await doppleQQQ.deployed();
    // console.log('DoppleQQQ deployed to:', doppleQQQ.address);
    // const DoppleAMZN = await ethers.getContractFactory('DoppleAMZN');
    // const doppleAMZN = await DoppleAMZN.deploy();
    // await doppleAMZN.deployed();
    // console.log('DoppleAMZN deployed to:', doppleAMZN.address);
    // const DoppleXAU = await ethers.getContractFactory('DoppleXAU');
    // const doppleXAU = await DoppleXAU.deploy();
    // await doppleXAU.deployed();
    // console.log('DoppleXAU deployed to:', doppleXAU.address);
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
