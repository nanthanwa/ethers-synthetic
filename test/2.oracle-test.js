const chai = require('chai');
const { expect, assert } = chai;
const { deployments } = require('hardhat');
const { BigNumber } = require('ethers');
const { ethers, getNamedAccounts } = require('hardhat');
const fs = require('fs');
chai.use(require('chai-bignumber')());


// @dev this test can run on Kovan network only
describe('Oracle Testing', async () => {
    let synthetic;
    before(async () => {
        const networkName = (await ethers.provider.getNetwork()).name;
        const { address } = JSON.parse(fs.readFileSync(`./deployments/${networkName}/Synthetic.json`).toString().trim());
        console.log('network', networkName);
        synthetic = await ethers.getContractAt('Synthetic', address);
        assert.ok(synthetic.address);
    });

    it('Can get TSLA/USD price', async () => {
        const actual = await synthetic.getRate('TSLA/USD');
        expect(actual).to.be.a.bignumber.that.is.not.lessThan('100000000000000000000');
    });

    it('Can get COIN/USD price', async () => {
        const actual = await synthetic.getRate('COIN/USD');
        expect(actual).to.be.a.bignumber.that.is.not.lessThan('100000000000000000000');
    });

    it('Can get AAPL/USD price', async () => {
        const actual = await synthetic.getRate('AAPL/USD');
        expect(actual).to.be.a.bignumber.that.is.not.lessThan('100000000000000000000');
    });

    it('Can get QQQ/USD price', async () => {
        const actual = await synthetic.getRate('QQQ/USD');
        expect(actual).to.be.a.bignumber.that.is.not.lessThan('100000000000000000000');
    });

    it('Can get AMZN/USD price', async () => {
        const actual = await synthetic.getRate('AMZN/USD');
        expect(actual).to.be.a.bignumber.that.is.not.lessThan('100000000000000000000');
    });

    it('Can get XAU/USD price', async () => {
        const actual = await synthetic.getRate('XAU/USD');
        expect(actual).to.be.a.bignumber.that.is.not.lessThan('100000000000000000000');
    });
});
