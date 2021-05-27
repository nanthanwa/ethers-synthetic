const { expect, assert } = require('chai');
const { BigNumber } = require('ethers');

describe('Deploy Contract', async () => {
  let result;
  const bandRef = '0xDA7a001b254CD22e46d3eAB04d937489c93174C3'; // use proxy
  let dolly, synthetic;
  before(async () => {

  });

  it('Can deploy Dolly contract', async () => {
    const Dolly = await ethers.getContractFactory("contracts/Dolly.sol:Dolly");
    dolly = await Dolly.deploy("Dolly Stable Coin", "DOLLY", "18");
    await dolly.deployed();
    console.log("Dolly deployed to:", dolly.address);
  });

});
