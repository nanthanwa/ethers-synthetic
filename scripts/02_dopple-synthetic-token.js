const { ethers, network } = require('hardhat');

async function main() {

  console.log('Network name:', network.name);

  if (network.name === 'kovan') {

    // const dTSLAContractAddress = (await dTSLA.wait()).events[2].args[0];
    // console.log('dTSLA contract address', dTSLAContractAddress);
    // const artifact = await deployments.getArtifact('DoppleSyntheticToken');
    // // console.log('artifact', artifact.abi);
    // const dTSLAContract = await ethers.getContractAt(artifact.abi, dTSLAContractAddress);
    // const dTSLAName = await dTSLAContract.name();
    // console.log('dTSLAName', dTSLAName);


    const syntheticAddress = '0xAdde342E77525862Bf435fb85004Af9F40403BAe';
    const DoppleTSLA = await ethers.getContractFactory('DoppleTSLA');
    const doppleTSLA = await DoppleTSLA.deploy(syntheticAddress);
    await doppleTSLA.deployed();
    console.log('DoppleTSLA deployed to:', doppleTSLA.address);
    await run('verify:verify', {
      address: doppleTSLA.address,
      contract: 'contracts/DoppleSyntheticToken.sol:DoppleTSLA',
      constructorArguments: [
        syntheticAddress,
      ],
    });
    // const DoppleCOIN = await ethers.getContractFactory('DoppleCOIN');
    // const doppleCoin = await DoppleCOIN.deploy("0xAdde342E77525862Bf435fb85004Af9F40403BAe");
    // await doppleCoin.deployed();
    // console.log('DoppleCOIN deployed to:', doppleCoin.address);
    // await run('verify:verify', {
    //   address: doppleCoin.address,
    //   contract: 'contracts/DoppleSyntheticToken.sol:DoppleCOIN',
    //   constructorArguments: [
    //     syntheticAddress,
    //   ],
    // });
    // const DoppleAAPL = await ethers.getContractFactory('DoppleAAPL');
    // const doppleAAPL = await DoppleAAPL.deploy("0xAdde342E77525862Bf435fb85004Af9F40403BAe");
    // await doppleAAPL.deployed();
    // console.log('DoppleAAPL deployed to:', doppleAAPL.address);
    // await run('verify:verify', {
    //   address: doppleAAPL.address,
    //   contract: 'contracts/DoppleSyntheticToken.sol:DoppleAAPL',
    //   constructorArguments: [
    //     syntheticAddress,
    //   ],
    // });
    // const DoppleQQQ = await ethers.getContractFactory('DoppleQQQ');
    // const doppleQQQ = await DoppleQQQ.deploy("0xAdde342E77525862Bf435fb85004Af9F40403BAe");
    // await doppleQQQ.deployed();
    // console.log('DoppleQQQ deployed to:', doppleQQQ.address);
    // await run('verify:verify', {
    //   address: doppleQQQ.address,
    //   contract: 'contracts/DoppleSyntheticToken.sol:DoppleQQQ',
    //   constructorArguments: [
    //     syntheticAddress,
    //   ],
    // });
    // const DoppleAMZN = await ethers.getContractFactory('DoppleAMZN');
    // const doppleAMZN = await DoppleAMZN.deploy("0xAdde342E77525862Bf435fb85004Af9F40403BAe");
    // await doppleAMZN.deployed();
    // console.log('DoppleAMZN deployed to:', doppleAMZN.address);
    // await run('verify:verify', {
    //   address: doppleAMZN.address,
    //   contract: 'contracts/DoppleSyntheticToken.sol:DoppleAMZN',
    //   constructorArguments: [
    //     syntheticAddress,
    //   ],
    // });
    // const DoppleXAU = await ethers.getContractFactory('DoppleXAU');
    // const doppleXAU = await DoppleXAU.deploy("0xAdde342E77525862Bf435fb85004Af9F40403BAe");
    // await doppleXAU.deployed();
    // console.log('DoppleXAU deployed to:', doppleXAU.address);
    // await run('verify:verify', {
    //   address: doppleXAU.address,
    //   contract: 'contracts/DoppleSyntheticToken.sol:DoppleXAU',
    //   constructorArguments: [
    //     syntheticAddress,
    //   ],
    // });
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
