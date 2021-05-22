const { expect } = require("chai");

describe("Oracle", async () => {
  let oracle;
  before(async () => {
    const Oracle = await ethers.getContractFactory("Oracle");
    oracle = await Oracle.deploy("0xDA7a001b254CD22e46d3eAB04d937489c93174C3");
    console.log('oracle address', oracle.address);
    await oracle.deployed();
  });

  after(async () => {
  });

  beforeEach(async () => {
  });

  afterEach(async () => {
  });

  it("Should return the new oracle once it's changed", async () => {
    expect(await oracle.price()).to.equal("0");
  });

  it("Can get BTC/USD price", async () => {
    await oracle.deployed();
    console.log('oracle address', oracle.address);
    const price = (await oracle.getPrice('BTC', 'USD')).toString();
    console.log('price', price);
    expect(await oracle.getPrice('BTC', 'USD')).to.not.equal("0");
  });
});
