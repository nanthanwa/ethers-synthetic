const { expect, assert } = require('chai');
const { BigNumber } = require('ethers');
const { deployments } = require('hardhat');

describe('Deploy Contract', () => {
  const bandRef = '0xDA7a001b254CD22e46d3eAB04d937489c93174C3'; // use proxy
  let dolly, synthetic, doppleTSLA, doppleCOIN, doppleAAPL, doppleQQQ, doppleAMZN, doppleXAU;
  before(async () => {

  });

  afterEach(async () => {
    // const setupTest = deployments.createFixture(async ({ deployments, getNamedAccounts, ethers }, options) => {
    //   await deployments.fixture(); // ensure you start from a fresh deployments
    //   const { owner } = await getNamedAccounts();
    //   const TokenContract = await ethers.getContract("Token", owner);
    //   await TokenContract.mint(10).then(tx => tx.wait()); //this mint is executed once and then `createFixture` will ensure it is snapshotted
    //   return {
    //     tokenOwner: {
    //       address: tokenOwner,
    //       TokenContract
    //     }
    //   };
    // };
  });

  it('Can deploy Dolly contract', async () => {
    const Dolly = await ethers.getContractFactory("contracts/Dolly.sol:Dolly");
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

  it('Can deploy DoppleTSLA TSLA contract', async () => {
    const DoppleTSLA = await ethers.getContractFactory('DoppleTSLA');
    doppleTSLA = await DoppleTSLA.deploy(synthetic.address);
    console.log("DoppleTSLA deployed to:", doppleTSLA.address);
    assert.ok(doppleTSLA.address);
  });

  it('Can deploy DoppleCOIN TSLA contract', async () => {
    const DoppleCOIN = await ethers.getContractFactory('DoppleCOIN');
    doppleCOIN = await DoppleCOIN.deploy(synthetic.address);
    console.log("DoppleCOIN deployed to:", doppleCOIN.address);
    assert.ok(doppleCOIN.address);
  });

  it('Can deploy DoppleAAPL TSLA contract', async () => {
    const DoppleAAPL = await ethers.getContractFactory('DoppleAAPL');
    doppleAAPL = await DoppleAAPL.deploy(synthetic.address);
    console.log("DoppleAAPL deployed to:", doppleAAPL.address);
    assert.ok(doppleAAPL.address);
  });

  it('Can deploy DoppleQQQ TSLA contract', async () => {
    const DoppleQQQ = await ethers.getContractFactory('DoppleQQQ');
    doppleQQQ = await DoppleQQQ.deploy(synthetic.address);
    console.log("DoppleQQQ deployed to:", doppleQQQ.address);
    assert.ok(doppleQQQ.address);
  });

  it('Can deploy DoppleAMZN TSLA contract', async () => {
    const DoppleAMZN = await ethers.getContractFactory('DoppleAMZN');
    doppleAMZN = await DoppleAMZN.deploy(synthetic.address);
    console.log("DoppleAMZN deployed to:", doppleAMZN.address);
    assert.ok(doppleAMZN.address);
  });

  it('Can deploy DoppleXAU TSLA contract', async () => {
    const DoppleXAU = await ethers.getContractFactory('DoppleXAU');
    doppleXAU = await DoppleXAU.deploy(synthetic.address);
    console.log("DoppleXAU deployed to:", doppleXAU.address);
    assert.ok(doppleXAU.address);
  });
});
