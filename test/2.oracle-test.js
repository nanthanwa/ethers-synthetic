const { expect, assert } = require('chai');
const { deployments } = require('hardhat');
const { BigNumber } = require('ethers');

describe('Oracle Testing', async () => {
    const bandRef = '0xDA7a001b254CD22e46d3eAB04d937489c93174C3'; // use proxy
    let dolly, synthetic;
    before(async () => {
        await deployments.fixture();
        const Synthetic = await deployments.get('Synthetic');
        console.log(Synthetic.address);
        // const Synthetic = await ethers.getContractFactory('Synthetic');
        // synthetic = await Synthetic.deploy(dolly.address, bandRef);
        // await synthetic.deployed();
        // console.log("Synthetic deployed to:", synthetic.address);
        // assert.ok(synthetic.address);
    });
    it('Can deploy Synthetic contract', async () => {

    });
});
