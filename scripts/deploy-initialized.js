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
    //   address: dollyAddress,
    //   constructorArguments: [
    //     'Dolly Stable Coin',
    //     'DOLLY',
    //     18,
    //   ],
    // });

    const Synthetic = await ethers.getContractFactory('Synthetic');
    const synthetic = await Synthetic.deploy(dolly.address, bandRef); // dolly, bandRef
    // const synthetic = await ethers.getContractAt('Synthetic', '0xAdde342E77525862Bf435fb85004Af9F40403BAe');
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
    // result = await synthetic.setPairsToAddress('COIN/USD', '0x6B4Bf2BEa14A000445e9f0bd59883AE5d3398651');
    // console.log('hash', result.hash);
    // result = await synthetic.setPairsToAddress('AAPL/USD', '0x93cb5A0806f8e682b03FCbA4633eEEd65c5a107E');
    // console.log('hash', result.hash);
    // result = await synthetic.setPairsToAddress('QQQ/USD', '0xf18b915D65E7139cc5F04FaF49ae2a3465eA5E04');
    // console.log('hash', result.hash);
    // result = await synthetic.setPairsToAddress('AMZN/USD', '0xd305b6bC1Bb5E12EF7751B82a0342A12CbfaEc90');
    // console.log('hash', result.hash);
    // result = await synthetic.setPairsToAddress('XAU/USD', '0x78126a97618c67694F553b8769a8591cA3114F41');
    // console.log('hash', result.hash);
    console.log('setting setAddressToPairs');
    result = await synthetic.setAddressToPairs(doppleTSLA.address, 'TSLA/USD');
    console.log('hash', result.hash);
    // result = await synthetic.setAddressToPairs('0x6B4Bf2BEa14A000445e9f0bd59883AE5d3398651', 'COIN/USD');
    // console.log('hash', result.hash);
    // result = await synthetic.setAddressToPairs('0x93cb5A0806f8e682b03FCbA4633eEEd65c5a107E', 'AAPL/USD');
    // console.log('hash', result.hash);
    // result = await synthetic.setAddressToPairs('0xf18b915D65E7139cc5F04FaF49ae2a3465eA5E04', 'QQQ/USD');
    // console.log('hash', result.hash);
    // result = await synthetic.setAddressToPairs('0xd305b6bC1Bb5E12EF7751B82a0342A12CbfaEc90', 'AMZN/USD');
    // console.log('hash', result.hash);
    // result = await synthetic.setAddressToPairs('0x78126a97618c67694F553b8769a8591cA3114F41', 'XAU/USD');
    // console.log('hash', result.hash);
    console.log('setting setPairsToQuote');
    result = await synthetic.setPairsToQuote('TSLA/USD', ['TSLA', 'USD']);
    console.log('hash', result.hash);
    // result = await synthetic.setPairsToQuote('COIN/USD', ['COIN', 'USD']);
    // console.log('hash', result.hash);
    // result = await synthetic.setPairsToQuote('AAPL/USD', ['AAPL', 'USD']);
    // console.log('hash', result.hash);
    // result = await synthetic.setPairsToQuote('QQQ/USD', ['QQQ', 'USD']);
    // console.log('hash', result.hash);
    // result = await synthetic.setPairsToQuote('AMZN/USD', ['AMZN', 'USD']);
    // console.log('hash', result.hash);
    // result = await synthetic.setPairsToQuote('XAU/USD', ['XAU', 'USD']);
    // console.log('hash', result.hash);


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
