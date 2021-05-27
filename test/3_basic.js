const chai = require('chai');
const { expect, assert } = chai;
const { deployments } = require('hardhat');
const { ethers, getNamedAccounts } = require('hardhat');
const fs = require('fs');
chai.use(require('chai-bignumber')());

describe('Basic Testing', async () => {
    let synthetic, networkName, dolly, doppleTSLA;
    before(async () => {
        networkName = (await ethers.provider.getNetwork()).name;
        console.log('network', networkName);
        if(networkName === 'kovan'){
            const data = JSON.parse(fs.readFileSync(`./deployments/${networkName}/Synthetic.json`).toString().trim());
            synthetic = await ethers.getContractAt('Synthetic', data.address);
            assert.ok(synthetic.address);
        } else {
              await deployments.fixture(); // ensure you start from a fresh deployments
              const { deployer } = await getNamedAccounts();
              Synthetic = await deployments.get('Synthetic');
              synthetic = await ethers.getContractAt('Synthetic', Synthetic.address);
              assert.ok(synthetic.address);
        }
    });

    it('Can approve dolly before mint', async () => {
        if(networkName === 'kovan'){
            const data = JSON.parse(fs.readFileSync(`./deployments/${networkName}/Dolly.json`).toString().trim());
            dolly = await ethers.getContractAt('Dolly', data.address);
            assert.ok(dolly.address);
            const actual = await dolly.approve(synthetic.address, ethers.utils.parseEther('1000000000000').toString());
            assert.ok(actual.hash);
        } else {
            const Dolly = await deployments.get('Dolly');
            dolly = await ethers.getContractAt('Dolly', Dolly.address);
            assert.ok(dolly.address);
            const actual = await dolly.approve(synthetic.address, ethers.utils.parseEther('1000000000000').toString());
            assert.ok(actual.hash);
        }
    });

    it('Can approve doppleTSLA before redeem', async () => {
        if(networkName === 'kovan'){
            const data = JSON.parse(fs.readFileSync(`./deployments/${networkName}/DoppleTSLA.json`).toString().trim());
            const DoppleTSLA = await ethers.getContractAt('DoppleTSLA', data.address);
            assert.ok(DoppleTSLA.address);
            const actual = await DoppleTSLA.approve(synthetic.address, ethers.utils.parseEther('1000000000000').toString());
            assert.ok(actual.hash);
        } else {
            const DoppleTSLA = await deployments.get('DoppleTSLA');
            doppleTSLA = await ethers.getContractAt('DoppleTSLA', DoppleTSLA.address);
            assert.ok(doppleTSLA.address);
            const actual = await doppleTSLA.approve(synthetic.address, ethers.utils.parseEther('1000000000000').toString());
            assert.ok(actual.hash);
        }
    });

    it('Can set synthetic contract address to synthetic asset contract before mint', async () => {
        if(networkName === 'kovan'){
            const data = JSON.parse(fs.readFileSync(`./deployments/${networkName}/DoppleTSLA.json`).toString().trim());
            doppleTSLA = await ethers.getContractAt('DoppleTSLA', data.address);
            assert.ok(doppleTSLA.address);
            const actual = await doppleTSLA.setSyntheticAddress(synthetic.address); // only Synthetic contract can mint synthetic asset.
            assert.ok(actual.hash);
        } else {
            const DoppleTSLA = await deployments.get('DoppleTSLA');
            doppleTSLA = await ethers.getContractAt('DoppleTSLA', DoppleTSLA.address);
            assert.ok(doppleTSLA.address);
            const actual = await doppleTSLA.setSyntheticAddress(synthetic.address); // only Synthetic contract can mint synthetic asset.
            assert.ok(actual.hash);
        }
    });
});
