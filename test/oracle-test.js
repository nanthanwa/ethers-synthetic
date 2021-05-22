const { expect, assert } = require('chai');
const { BigNumber } = require('ethers');

describe('PriceConsumerV3', async () => {
  let priceConsumerContract;
  before(async () => {
    priceConsumerContract = await ethers.getContractAt('PriceConsumerV3', '0xe14b76C21eB129Db30Db428A6f90d1dE313DBB4b');
    console.log('PriceConsumerV3 address', priceConsumerContract.address);
  });

  after(async () => {
  });

  beforeEach(async () => {
  });

  afterEach(async () => {
  });

  it('Owner should not be address(0)', async () => {
    assert.notEqual(await priceConsumerContract.owner(), '0x0000000000000000000000000000000000000000', 'these numbers are not equal');
  });

  it('Can get TSLA/USD price', async () => {
    assert.isOk((await priceConsumerContract.getLatestPrice('TSLA/USD'))[0].gt(0), 'TSLA price is zero');
  });

  it('Can get XAU/USD price', async () => {
    assert.isOk((await priceConsumerContract.getLatestPrice('XAU/USD'))[0].gt(0), 'TSLA price is zero');
  });

  it('Can get FerrariF12TDF/USD price', async () => {
    assert.isOk((await priceConsumerContract.getLatestPrice('FerrariF12TDF/USD'))[0].gt(0), 'TSLA price is zero');
  });

});
