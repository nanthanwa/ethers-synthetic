const { expect, assert } = require('chai');
const { deployments } = require('hardhat');
const { BigNumber } = require('ethers');
const { ethers, getNamedAccounts } = require('hardhat');

describe('Oracle Testing', async () => {
    let synthetic;
    before(async () => {
        await deployments.fixture(); // ensure you start from a fresh deployments
        const Synthetic = await deployments.get('Synthetic');
        synthetic = await ethers.getContractAt('Synthetic', Synthetic.address);
        // const { deployer } = await getNamedAccounts();
        // synthetic = await ethers.getContract('Synthetic', deployer);
        // assert.ok(synthetic.address);
    });
    it('Can get TSLA/USD price', async () => {
        console.log('synthetic', synthetic.address);
        const price = await synthetic.getRate('BTC/USD');
        console.log('price', price);
    });
});
