const { assert } = require('chai');
const { deployments } = require('hardhat');
const { ethers, getNamedAccounts } = require('hardhat');

describe('Basic Testing', async () => {
    let synthetic, doppleSyntheticTokenFactory, networkName, minter;
    before(async () => {
        networkName = (await ethers.provider.getNetwork()).name;
        console.log('network', networkName);
        const namedAccounts = await getNamedAccounts();
        minter = namedAccounts.minter;
        if (networkName !== 'kovan') {
            await deployments.fixture(); // ensure you start from a fresh deployments
        }
        synthetic = await ethers.getContract('Synthetic', minter);
        assert.ok(synthetic.address);
        doppleSyntheticTokenFactory = await ethers.getContract('DoppleSyntheticTokenFactory', minter);
        assert.ok(doppleSyntheticTokenFactory.address);
    });

    it('Can approve dolly before mint', async () => {
        const dolly = await ethers.getContract('Dolly', minter);
        assert.ok(dolly.address);
        const actual = await dolly.approve(synthetic.address, ethers.utils.parseEther('1000000000000').toString());
        assert.ok(actual.hash);
    });

    it('Can approve doppleTSLA before redeem', async () => {
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dTSLA');
        // console.log('contract address', contractAddress);
        const doppleTSLA = await ethers.getContractAt('DoppleSyntheticToken', contractAddress);
        assert.ok(doppleTSLA.address);
        const actual = await doppleTSLA.approve(synthetic.address, ethers.utils.parseEther('1000000000000').toString());
        assert.ok(actual.hash);
    });

    it('Can approve doppleCOIN before redeem', async () => {
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dCOIN');
        // console.log('contract address', contractAddress);
        const doppleCOIN = await ethers.getContractAt('DoppleSyntheticToken', contractAddress);
        assert.ok(doppleCOIN.address);
        const actual = await doppleCOIN.approve(synthetic.address, ethers.utils.parseEther('1000000000000').toString());
        assert.ok(actual.hash);
    });

    it('Can approve doppleAAPL before redeem', async () => {
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dAAPL');
        // console.log('contract address', contractAddress);
        const doppleAAPL = await ethers.getContractAt('DoppleSyntheticToken', contractAddress);
        assert.ok(doppleAAPL.address);
        const actual = await doppleAAPL.approve(synthetic.address, ethers.utils.parseEther('1000000000000').toString());
        assert.ok(actual.hash);
    });

    it('Can approve doppleQQQ before redeem', async () => {
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dQQQ');
        // console.log('contract address', contractAddress);
        const doppleQQQ = await ethers.getContractAt('DoppleSyntheticToken', contractAddress);
        assert.ok(doppleQQQ.address);
        const actual = await doppleQQQ.approve(synthetic.address, ethers.utils.parseEther('1000000000000').toString());
        assert.ok(actual.hash);
    });

    it('Can approve doppleAMZN before redeem', async () => {
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dAMZN');
        // console.log('contract address', contractAddress);
        const doppleAMZN = await ethers.getContractAt('DoppleSyntheticToken', contractAddress);
        assert.ok(doppleAMZN.address);
        const actual = await doppleAMZN.approve(synthetic.address, ethers.utils.parseEther('1000000000000').toString());
        assert.ok(actual.hash);
    });

    it('Can approve doppleXAU before redeem', async () => {
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dXAU');
        // console.log('contract address', contractAddress);
        const doppleXAU = await ethers.getContractAt('DoppleSyntheticToken', contractAddress);
        assert.ok(doppleXAU.address);
        const actual = await doppleXAU.approve(synthetic.address, ethers.utils.parseEther('1000000000000').toString());
        assert.ok(actual.hash);
    });
});
