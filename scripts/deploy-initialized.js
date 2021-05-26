const { ethers, network, run } = require('hardhat');

async function main() {

  console.log('Network name:', network.name);

  if (network.name === 'kovan') {
    let result;
    const dollyAddress = '0x172018C14eeA6312BF4243BFa3d07249feA7E542';
    const bandRef = '0x9106f09bf08dfb23fca61a9829543f1c80a81a4b';
    const dolly = await ethers.getContractAt('contracts/Dolly.sol:Dolly', dollyAddress);
    await dolly.deployed();
    console.log('Dolly deployed to:', dolly.address);
    // console.log('verify Synthetic');
    // await run('verify:verify', {
    //   address: '0x172018C14eeA6312BF4243BFa3d07249feA7E542',
    //   constructorArguments: [
    //     'Dolly Stable Coin',
    //     'DOLLY',
    //     18,
    //   ],
    // });

    // const Synthetic = await ethers.getContractFactory('Synthetic');
    // const synthetic = await Synthetic.deploy(dolly.address, bandRef); // dolly, bandRef
    const synthetic = await ethers.getContractAt('Synthetic', '0x6A23889CbA84D8E3D3e66Dad086c67Dd69909fFD');
    await synthetic.deployed();
    console.log('Synthetic deployed to:', synthetic.address);
    console.log('verify Synthetic');
    await run('verify:verify', {
      address: synthetic.address,
      constructorArguments: [
        dolly.address,
        bandRef,
      ],
    });
    // // const DoppleTSLA = await ethers.getContractFactory('DoppleTSLA');
    // // const doppleTSLA = await DoppleTSLA.deploy(synthetic.address); // synthetic address
    const doppleTSLA = await ethers.getContractAt('DoppleTSLA', '0xdC47e2C0b6046cD58d3B21583DA19B45Ebf679ad');
    await doppleTSLA.deployed();
    console.log('DoppleTSLA deployed to:', doppleTSLA.address);
    // await run('verify:verify', {
    //   address: doppleTSLA.address,
    //   contract: 'contracts/DoppleSyntheticToken.sol:DoppleTSLA',
    //   constructorArguments: [
    //     synthetic.address,
    //   ],
    // });

    console.log('setting setPairsToAddress');
    result = await synthetic.setPairsToAddress('TSLA/USD', doppleTSLA.address);
    console.log('hash', result.hash);
    console.log('setting setAddressToPairs');
    result = await synthetic.setAddressToPairs(doppleTSLA.address, 'TSLA/USD');
    console.log('hash', result.hash);


    console.log('approve dolly');
    result = await dolly.approve(synthetic.address, ethers.utils.parseEther('1000000000000').toString()); // for minting purpose.
    console.log('hash', result.hash);
    console.log('approve doppleTSLA');
    result = await doppleTSLA.approve(synthetic.address, ethers.utils.parseEther('1000000000000').toString()); // for redeem purpose (burned by synthetic contract).
    console.log('hash', result.hash);
    console.log('Set owner of systetic asset');
    result = await doppleTSLA.setSyntheticAddress(synthetic.address); // only Synthetic contract can mint synthetic asset.
    console.log('hash', result.hash);

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
