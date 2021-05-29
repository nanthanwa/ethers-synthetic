const { assert } = require('chai');

describe('Deploy Contract', () => {
  const bandRef = '0xDA7a001b254CD22e46d3eAB04d937489c93174C3'; // use proxy
  let dolly, synthetic, doppleSyntheticToken, doppleSyntheticTokenFactory;

  it('Can deploy Dolly contract', async () => {
    const Dolly = await ethers.getContractFactory("Dolly");
    dolly = await Dolly.deploy("Dolly Stable Coin", "DOLLY", "18");
    await dolly.deployed();
    console.log("Dolly deployed to:", dolly.address);
    assert.ok(dolly.address);
  });

  it('Can deploy Synthetic contract', async () => {
    const Synthetic = await ethers.getContractFactory('Synthetic');
    synthetic = await Synthetic.deploy(dolly.address, bandRef);
    await synthetic.deployed();
    console.log("Synthetic deployed to:", synthetic.address);
    assert.ok(synthetic.address);
  });

  it('Can deploy DoppleSyntheticToken contract', async () => {
    const DoppleSyntheticToken = await ethers.getContractFactory('DoppleSyntheticToken');
    doppleSyntheticToken = await DoppleSyntheticToken.deploy();
    console.log("DoppleSyntheticToken deployed to:", doppleSyntheticToken.address);
    assert.ok(doppleSyntheticToken.address);
  });

  it('Can deploy DoppleSyntheticTokenFactory contract', async () => {
    const DoppleSyntheticTokenFactory = await ethers.getContractFactory('DoppleSyntheticTokenFactory');
    doppleSyntheticTokenFactory = await DoppleSyntheticTokenFactory.deploy(doppleSyntheticToken.address);
    console.log("DoppleSyntheticTokenFactory deployed to:", doppleSyntheticTokenFactory.address);
    assert.ok(doppleSyntheticTokenFactory.address);
  });

  it('Can deploy DoppleTSLA contract', async () => {
    const tx = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic TSLA Token', 'dTSLA', synthetic.address);
    const contractAddress = (await tx.wait()).events[2].args[0];
    const assetName = (await tx.wait()).events[2].args[1].substr(1);
    console.log('contractAddress', contractAddress);
    console.log('assetName', assetName);
  });

  it('Can deploy DoppleCOIN contract', async () => {
    const tx = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic COIN Token', 'dCOIN', synthetic.address);
    const contractAddress = (await tx.wait()).events[2].args[0];
    const assetName = (await tx.wait()).events[2].args[1].substr(1);
    console.log('contractAddress', contractAddress);
    console.log('assetName', assetName);
  });

  it('Can deploy DoppleAAPL contract', async () => {
    const tx = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic AAPL Token', 'dAAPL', synthetic.address);
    const contractAddress = (await tx.wait()).events[2].args[0];
    const assetName = (await tx.wait()).events[2].args[1].substr(1);
    console.log('contractAddress', contractAddress);
    console.log('assetName', assetName);
  });

  it('Can deploy DoppleQQQ contract', async () => {
    const tx = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic QQQ Token', 'dQQQ', synthetic.address);
    const contractAddress = (await tx.wait()).events[2].args[0];
    const assetName = (await tx.wait()).events[2].args[1].substr(1);
    console.log('contractAddress', contractAddress);
    console.log('assetName', assetName);
  });

  it('Can deploy DoppleAMZN contract', async () => {
    const tx = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic AMZN Token', 'dAMZN', synthetic.address);
    const contractAddress = (await tx.wait()).events[2].args[0];
    const assetName = (await tx.wait()).events[2].args[1].substr(1);
    console.log('contractAddress', contractAddress);
    console.log('assetName', assetName);
  });

  it('Can deploy DoppleXAU contract', async () => {
    const tx = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic XAU Token', 'dXAU', synthetic.address);
    const contractAddress = (await tx.wait()).events[2].args[0];
    const assetName = (await tx.wait()).events[2].args[1].substr(1);
    console.log('contractAddress', contractAddress);
    console.log('assetName', assetName);
  });
});
