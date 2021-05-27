const chai = require('chai');
const { expect, assert } = chai;
const { deployments } = require('hardhat');
const { ethers, getNamedAccounts } = require('hardhat');
const { BigNumber } = ethers.utils;
const fs = require('fs');
chai.use(require('chai-bignumber')());

describe('Advance Testing', async () => {
    let actual, synthetic, networkName, dolly, doppleTSLA;
    let deployer, minter, liquidator;
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
            deployer = namedAccounts.deployer;
            minter = namedAccounts.minter;
            liquidator = namedAccounts.liquidator;
            // console.log('deployer', deployer);
            // console.log('minter', minter);
            // console.log('liquidator', liquidator);
            Synthetic = await deployments.get('Synthetic');
            synthetic = await ethers.getContractAt('Synthetic', Synthetic.address, minter);
            assert.ok(synthetic.address);
            const Dolly = await deployments.get('Dolly');
            dolly = await ethers.getContractAt('Dolly', Dolly.address, minter);
            assert.ok(dolly.address);
        }
    });

    it('Can mint $dTSLA', async () => {
        const DoppleTSLA = await deployments.get('DoppleTSLA');
        doppleTSLA = await ethers.getContractAt('DoppleTSLA', DoppleTSLA.address);
        assert.ok(doppleTSLA.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const aDollyBal = await dolly.balanceOf(minter);
        const aTSLABal = await doppleTSLA.balanceOf(minter);
        // console.log('aDollyBal', aDollyBal);
        // console.log('aTSLABal', aTSLABal);
        actual = await dolly.approve(synthetic.address, dollyAmount);
        assert.ok(actual.hash);

        actual = await synthetic.mintSynthetic(doppleTSLA.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bTSLABal = await doppleTSLA.balanceOf(minter);
        // console.log('bDollyBal', bDollyBal);
        // console.log('bTSLABal', bTSLABal);

        assert.ok(bDollyBal.eq(aDollyBal.sub(dollyAmount)));
        assert.ok(bTSLABal.eq(aTSLABal.add(syntheticAmount)));
    });

    it('Can mint $dCOIN', async () => {
        const DoppleCOIN = await deployments.get('DoppleCOIN');
        doppleCOIN = await ethers.getContractAt('DoppleCOIN', DoppleCOIN.address);
        assert.ok(doppleCOIN.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const aDollyBal = await dolly.balanceOf(minter);
        const aCOINBal = await doppleCOIN.balanceOf(minter);
        // console.log('aDollyBal', aDollyBal);
        // console.log('aCOINBal', aCOINBal);
        actual = await dolly.approve(synthetic.address, dollyAmount);
        assert.ok(actual.hash);

        actual = await synthetic.mintSynthetic(doppleCOIN.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bCOINBal = await doppleCOIN.balanceOf(minter);
        // console.log('bDollyBal', bDollyBal);
        // console.log('bCOINBal', bCOINBal);

        assert.ok(bDollyBal.eq(aDollyBal.sub(dollyAmount)));
        assert.ok(bCOINBal.eq(aCOINBal.add(syntheticAmount)));
    });

    it('Can mint $dAAPL', async () => {
        const DoppleAAPL = await deployments.get('DoppleAAPL');
        doppleAAPL = await ethers.getContractAt('DoppleAAPL', DoppleAAPL.address);
        assert.ok(doppleAAPL.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const aDollyBal = await dolly.balanceOf(minter);
        const aAAPLBal = await doppleAAPL.balanceOf(minter);
        // console.log('aDollyBal', aDollyBal);
        // console.log('aAAPLBal', aAAPLBal);
        actual = await dolly.approve(synthetic.address, dollyAmount);
        assert.ok(actual.hash);

        actual = await synthetic.mintSynthetic(doppleAAPL.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bAAPLBal = await doppleAAPL.balanceOf(minter);
        // console.log('bDollyBal', bDollyBal);
        // console.log('bAAPLBal', bAAPLBal);

        assert.ok(bDollyBal.eq(aDollyBal.sub(dollyAmount)));
        assert.ok(bAAPLBal.eq(aAAPLBal.add(syntheticAmount)));
    });

    it('Can mint $dQQQ', async () => {
        const DoppleQQQ = await deployments.get('DoppleQQQ');
        doppleQQQ = await ethers.getContractAt('DoppleQQQ', DoppleQQQ.address);
        assert.ok(doppleQQQ.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const aDollyBal = await dolly.balanceOf(minter);
        const aQQQBal = await doppleQQQ.balanceOf(minter);
        // console.log('aDollyBal', aDollyBal);
        // console.log('aQQQBal', aQQQBal);
        actual = await dolly.approve(synthetic.address, dollyAmount);
        assert.ok(actual.hash);

        actual = await synthetic.mintSynthetic(doppleQQQ.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bQQQBal = await doppleQQQ.balanceOf(minter);
        // console.log('bDollyBal', bDollyBal);
        // console.log('bQQQBal', bQQQBal);

        assert.ok(bDollyBal.eq(aDollyBal.sub(dollyAmount)));
        assert.ok(bQQQBal.eq(aQQQBal.add(syntheticAmount)));
    });

    // 3288.069999999
    // @notice do not foget to give 150% of collateral
    it('Can mint $dAMZN', async () => {
        const DoppleAMZN = await deployments.get('DoppleAMZN');
        doppleAMZN = await ethers.getContractAt('DoppleAMZN', DoppleAMZN.address);
        assert.ok(doppleAMZN.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('5200');
        const aDollyBal = await dolly.balanceOf(minter);
        const aAMZNBal = await doppleAMZN.balanceOf(minter);
        // console.log('aDollyBal', aDollyBal);
        // console.log('aAMZNBal', aAMZNBal);
        actual = await dolly.approve(synthetic.address, dollyAmount);
        assert.ok(actual.hash);

        actual = await synthetic.mintSynthetic(doppleAMZN.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bAMZNBal = await doppleAMZN.balanceOf(minter);
        // console.log('bDollyBal', bDollyBal);
        // console.log('bAMZNBal', bAMZNBal);

        assert.ok(bDollyBal.eq(aDollyBal.sub(dollyAmount)));
        assert.ok(bAMZNBal.eq(aAMZNBal.add(syntheticAmount)));
    });

    // 1889.019475
    it('Can mint $dXAU', async () => {
        const DoppleXAU = await deployments.get('DoppleXAU');
        doppleXAU = await ethers.getContractAt('DoppleXAU', DoppleXAU.address);
        assert.ok(doppleXAU.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('3200');
        const aDollyBal = await dolly.balanceOf(minter);
        const aXAUBal = await doppleXAU.balanceOf(minter);
        // console.log('aDollyBal', aDollyBal);
        // console.log('aXAUBal', aXAUBal);
        actual = await dolly.approve(synthetic.address, dollyAmount);
        assert.ok(actual.hash);

        actual = await synthetic.mintSynthetic(doppleXAU.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bXAUBal = await doppleXAU.balanceOf(minter);
        // console.log('bDollyBal', bDollyBal);
        // console.log('bXAUBal', bXAUBal);

        assert.ok(bDollyBal.eq(aDollyBal.sub(dollyAmount)));
        assert.ok(bXAUBal.eq(aXAUBal.add(syntheticAmount)));
    });

});
