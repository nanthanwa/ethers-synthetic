const { expect, assert } = require('chai');
const { deployments } = require('hardhat');
const { BigNumber } = require('ethers');
const { ethers, getNamedAccounts } = require('hardhat');
const fs = require('fs');

describe('Oracle Testing', async () => {
    let synthetic;
    before(async () => {
        const networkName = (await ethers.provider.getNetwork()).name;
        const { address } = JSON.parse(fs.readFileSync(`./deployments/${networkName}/Synthetic.json`).toString().trim());
        console.log('address', address);
        console.log('network', networkName);
        synthetic = await ethers.getContractAt('Synthetic', address);
        assert.ok(synthetic.address);
    });
    it('Can get TSLA/USD price', async () => {
        console.log('synthetic', synthetic.address);
        const price = await synthetic.getRate('BTC/USD');
        console.log('price', price);
    });
});
