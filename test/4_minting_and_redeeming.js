const chai = require('chai');
const { expect, assert } = chai;
const { deployments } = require('hardhat');
const { ethers, getNamedAccounts } = require('hardhat');
const { BigNumber } = ethers.utils;
const fs = require('fs');
chai.use(require('chai-bignumber')());

describe('Minting and Redeeming Testing', async () => {
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

    it('Can fully redeem $dTSLA', async () => {
        const DoppleTSLA = await deployments.get('DoppleTSLA');
        doppleTSLA = await ethers.getContractAt('DoppleTSLA', DoppleTSLA.address, minter);
        assert.ok(doppleTSLA.address);

        const aDollyBal = await dolly.balanceOf(minter);
        const aTSLABal = await doppleTSLA.balanceOf(minter);
        // console.log('aDollyBal', aDollyBal);
        // console.log('aTSLABal', aTSLABal);
        actual = await doppleTSLA.approve(synthetic.address, aTSLABal);
        assert.ok(actual.hash);
        const allowance = await doppleTSLA.allowance(minter, synthetic.address);
        // console.log('allowance', allowance);
        actual = await synthetic.redeemSynthetic(doppleTSLA.address, aTSLABal);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bTSLABal = await doppleTSLA.balanceOf(minter);
        // console.log('bDollyBal', bDollyBal);
        // console.log('bTSLABal', bTSLABal);

        assert.ok(bDollyBal.gt(aDollyBal));
        assert.ok(bTSLABal.lt(aTSLABal));
    });

    it('Can fully redeem $dCOIN', async () => {
        const DoppleCOIN = await deployments.get('DoppleCOIN');
        doppleCOIN = await ethers.getContractAt('DoppleCOIN', DoppleCOIN.address, minter);
        assert.ok(doppleCOIN.address);

        const aDollyBal = await dolly.balanceOf(minter);
        const aCOINBal = await doppleCOIN.balanceOf(minter);
        // console.log('aDollyBal', aDollyBal);
        // console.log('aCOINBal', aCOINBal);
        actual = await doppleCOIN.approve(synthetic.address, aCOINBal);
        assert.ok(actual.hash);
        const allowance = await doppleCOIN.allowance(minter, synthetic.address);
        // console.log('allowance', allowance);
        actual = await synthetic.redeemSynthetic(doppleCOIN.address, aCOINBal);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bCOINBal = await doppleCOIN.balanceOf(minter);
        // console.log('bDollyBal', bDollyBal);
        // console.log('bCOINBal', bCOINBal);

        assert.ok(bDollyBal.gt(aDollyBal));
        assert.ok(bCOINBal.lt(aCOINBal));
    });

    it('Can fully redeem $dAAPL', async () => {
        const DoppleAAPL = await deployments.get('DoppleAAPL');
        doppleAAPL = await ethers.getContractAt('DoppleAAPL', DoppleAAPL.address, minter);
        assert.ok(doppleAAPL.address);

        const aDollyBal = await dolly.balanceOf(minter);
        const aAAPLBal = await doppleAAPL.balanceOf(minter);
        // console.log('aDollyBal', aDollyBal);
        // console.log('aAAPLBal', aAAPLBal);
        actual = await doppleAAPL.approve(synthetic.address, aAAPLBal);
        assert.ok(actual.hash);
        const allowance = await doppleAAPL.allowance(minter, synthetic.address);
        // console.log('allowance', allowance);
        actual = await synthetic.redeemSynthetic(doppleAAPL.address, aAAPLBal);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bAAPLBal = await doppleAAPL.balanceOf(minter);
        // console.log('bDollyBal', bDollyBal);
        // console.log('bAAPLBal', bAAPLBal);

        assert.ok(bDollyBal.gt(aDollyBal));
        assert.ok(bAAPLBal.lt(aAAPLBal));
    });

    it('Can fully redeem $dQQQ', async () => {
        const DoppleQQQ = await deployments.get('DoppleQQQ');
        doppleQQQ = await ethers.getContractAt('DoppleQQQ', DoppleQQQ.address, minter);
        assert.ok(doppleQQQ.address);

        const aDollyBal = await dolly.balanceOf(minter);
        const aQQQBal = await doppleQQQ.balanceOf(minter);
        // console.log('aDollyBal', aDollyBal);
        // console.log('aQQQBal', aQQQBal);
        actual = await doppleQQQ.approve(synthetic.address, aQQQBal);
        assert.ok(actual.hash);
        const allowance = await doppleQQQ.allowance(minter, synthetic.address);
        // console.log('allowance', allowance);
        actual = await synthetic.redeemSynthetic(doppleQQQ.address, aQQQBal);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bQQQBal = await doppleQQQ.balanceOf(minter);
        // console.log('bDollyBal', bDollyBal);
        // console.log('bQQQBal', bQQQBal);

        assert.ok(bDollyBal.gt(aDollyBal));
        assert.ok(bQQQBal.lt(aQQQBal));
    });

    it('Can fully redeem $dAMZN', async () => {
        const DoppleAMZN = await deployments.get('DoppleAMZN');
        doppleAMZN = await ethers.getContractAt('DoppleAMZN', DoppleAMZN.address, minter);
        assert.ok(doppleAMZN.address);

        const aDollyBal = await dolly.balanceOf(minter);
        const aAMZNBal = await doppleAMZN.balanceOf(minter);
        // console.log('aDollyBal', aDollyBal);
        // console.log('aAMZNBal', aAMZNBal);
        actual = await doppleAMZN.approve(synthetic.address, aAMZNBal);
        assert.ok(actual.hash);
        const allowance = await doppleAMZN.allowance(minter, synthetic.address);
        // console.log('allowance', allowance);
        actual = await synthetic.redeemSynthetic(doppleAMZN.address, aAMZNBal);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bAMZNBal = await doppleAMZN.balanceOf(minter);
        // console.log('bDollyBal', bDollyBal);
        // console.log('bAMZNBal', bAMZNBal);

        assert.ok(bDollyBal.gt(aDollyBal));
        assert.ok(bAMZNBal.lt(aAMZNBal));
    });

    it('Can fully redeem $dXAU', async () => {
        const DoppleXAU = await deployments.get('DoppleXAU');
        doppleXAU = await ethers.getContractAt('DoppleXAU', DoppleXAU.address, minter);
        assert.ok(doppleXAU.address);

        const aDollyBal = await dolly.balanceOf(minter);
        const aXAUBal = await doppleXAU.balanceOf(minter);
        // console.log('aDollyBal', aDollyBal);
        // console.log('aXAUBal', aXAUBal);
        actual = await doppleXAU.approve(synthetic.address, aXAUBal);
        assert.ok(actual.hash);
        const allowance = await doppleXAU.allowance(minter, synthetic.address);
        // console.log('allowance', allowance);
        actual = await synthetic.redeemSynthetic(doppleXAU.address, aXAUBal);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bXAUBal = await doppleXAU.balanceOf(minter);
        // console.log('bDollyBal', bDollyBal);
        // console.log('bXAUBal', bXAUBal);

        assert.ok(bDollyBal.gt(aDollyBal));
        assert.ok(bXAUBal.lt(aXAUBal));
    });
});
