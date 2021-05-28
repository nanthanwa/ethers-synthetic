const { assert } = require('chai');
const { deployments } = require('hardhat');
const { ethers, getNamedAccounts } = require('hardhat');
const fs = require('fs');

describe('Basic Testing', async () => {
    let synthetic, networkName, minter, deployer;
    before(async () => {
        networkName = (await ethers.provider.getNetwork()).name;
        console.log('network', networkName);
        if (networkName === 'kovan') {
            const data = JSON.parse(fs.readFileSync(`./deployments/${networkName}/Synthetic.json`).toString().trim());
            synthetic = await ethers.getContractAt('Synthetic', data.address);
            assert.ok(synthetic.address);
        } else {
            await deployments.fixture(); // ensure you start from a fresh deployments
            const namedAccounts = await getNamedAccounts();
            minter = namedAccounts.minter;
            deployer = namedAccounts.deployer;
            synthetic = await ethers.getContract('Synthetic', minter);
            assert.ok(synthetic.address);
        }
    });

    it('Can approve dolly before mint', async () => {
        if (networkName === 'kovan') {
            const data = JSON.parse(fs.readFileSync(`./deployments/${networkName}/Dolly.json`).toString().trim());
            const dolly = await ethers.getContractAt('Dolly', data.address, minter);
            assert.ok(dolly.address);
            const actual = await dolly.approve(synthetic.address, ethers.utils.parseEther('1000000000000').toString());
            assert.ok(actual.hash);
        } else {
            const dolly = await ethers.getContract('Dolly', minter);
            assert.ok(dolly.address);
            const actual = await dolly.approve(synthetic.address, ethers.utils.parseEther('1000000000000').toString());
            assert.ok(actual.hash);
        }
    });

    it('Can approve doppleTSLA before redeem', async () => {
        if (networkName === 'kovan') {
            const data = JSON.parse(fs.readFileSync(`./deployments/${networkName}/DoppleTSLA.json`).toString().trim());
            const DoppleTSLA = await ethers.getContractAt('DoppleTSLA', data.address);
            assert.ok(DoppleTSLA.address);
            const actual = await DoppleTSLA.approve(synthetic.address, ethers.utils.parseEther('1000000000000').toString());
            assert.ok(actual.hash);
        } else {
            const doppleTSLA = await ethers.getContract('DoppleTSLA', minter);
            assert.ok(doppleTSLA.address);
            const actual = await doppleTSLA.approve(synthetic.address, ethers.utils.parseEther('1000000000000').toString());
            assert.ok(actual.hash);
        }
    });

    it('Can set synthetic contract address to synthetic asset contract before mint', async () => {
        if (networkName === 'kovan') {
            const data = JSON.parse(fs.readFileSync(`./deployments/${networkName}/DoppleTSLA.json`).toString().trim());
            doppleTSLA = await ethers.getContractAt('DoppleTSLA', data.address);
            assert.ok(doppleTSLA.address);
            const actual = await doppleTSLA.setSyntheticAddress(synthetic.address); // only Synthetic contract can mint synthetic asset.
            assert.ok(actual.hash);
        } else {
            const doppleTSLA = await ethers.getContract('DoppleTSLA', deployer);
            assert.ok(doppleTSLA.address);
            const actual = await doppleTSLA.setSyntheticAddress(synthetic.address); // only Synthetic contract can mint synthetic asset.
            assert.ok(actual.hash);
        }
    });
});
