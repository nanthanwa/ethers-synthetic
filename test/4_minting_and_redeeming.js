const chai = require('chai');
const { expect, assert } = chai;
const { deployments } = require('hardhat');
const { ethers, getNamedAccounts } = require('hardhat');
const { BigNumber } = ethers.utils;
const fs = require('fs');
chai.use(require('chai-bignumber')());

describe('Minting and Redeeming Testing', async () => {
    let actual, synthetic, networkName, dolly;
    let minter;
    before(async () => {
        networkName = (await ethers.provider.getNetwork()).name;
        console.log('network', networkName);
        if (networkName === 'kovan') {
            const data = JSON.parse(fs.readFileSync(`./deployments/${networkName}/Synthetic.json`).toString().trim());
            synthetic = await ethers.getContractAt('Synthetic', data.address, minter);
            assert.ok(synthetic.address);
        } else {
            await deployments.fixture(); // ensure you start from a fresh deployments
            const namedAccounts = await getNamedAccounts();
            minter = namedAccounts.minter;
            synthetic = await ethers.getContract('Synthetic', minter);
            assert.ok(synthetic.address);
            dolly = await ethers.getContract('Dolly', minter);
            assert.ok(dolly.address);
        }
    });

    it('Can mint $dTSLA', async () => {
        const doppleTSLA = await ethers.getContract('DoppleTSLA', minter);
        assert.ok(doppleTSLA.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const aDollyBal = await dolly.balanceOf(minter);
        const aTSLABal = await doppleTSLA.balanceOf(minter);
        actual = await dolly.approve(synthetic.address, dollyAmount);
        assert.ok(actual.hash);

        actual = await synthetic.mintSynthetic(doppleTSLA.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bTSLABal = await doppleTSLA.balanceOf(minter);

        assert.ok(bDollyBal.eq(aDollyBal.sub(dollyAmount)));
        assert.ok(bTSLABal.eq(aTSLABal.add(syntheticAmount)));
    });

    it('Can mint $dCOIN', async () => {
        const doppleCOIN = await ethers.getContract('DoppleCOIN', minter);
        assert.ok(doppleCOIN.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const aDollyBal = await dolly.balanceOf(minter);
        const aCOINBal = await doppleCOIN.balanceOf(minter);

        actual = await dolly.approve(synthetic.address, dollyAmount);
        assert.ok(actual.hash);

        actual = await synthetic.mintSynthetic(doppleCOIN.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bCOINBal = await doppleCOIN.balanceOf(minter);
        assert.ok(bDollyBal.eq(aDollyBal.sub(dollyAmount)));
        assert.ok(bCOINBal.eq(aCOINBal.add(syntheticAmount)));
    });

    it('Can mint $dAAPL', async () => {
        const doppleAAPL = await ethers.getContract('DoppleAAPL', minter);
        assert.ok(doppleAAPL.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const aDollyBal = await dolly.balanceOf(minter);
        const aAAPLBal = await doppleAAPL.balanceOf(minter);

        actual = await dolly.approve(synthetic.address, dollyAmount);
        assert.ok(actual.hash);

        actual = await synthetic.mintSynthetic(doppleAAPL.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bAAPLBal = await doppleAAPL.balanceOf(minter);
        assert.ok(bDollyBal.eq(aDollyBal.sub(dollyAmount)));
        assert.ok(bAAPLBal.eq(aAAPLBal.add(syntheticAmount)));
    });

    it('Can mint $dQQQ', async () => {
        const doppleQQQ = await ethers.getContract('DoppleQQQ', minter);
        assert.ok(doppleQQQ.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const aDollyBal = await dolly.balanceOf(minter);
        const aQQQBal = await doppleQQQ.balanceOf(minter);

        actual = await dolly.approve(synthetic.address, dollyAmount);
        assert.ok(actual.hash);

        actual = await synthetic.mintSynthetic(doppleQQQ.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bQQQBal = await doppleQQQ.balanceOf(minter);
        assert.ok(bDollyBal.eq(aDollyBal.sub(dollyAmount)));
        assert.ok(bQQQBal.eq(aQQQBal.add(syntheticAmount)));
    });

    // 3288.069999999
    // @notice do not foget to give 150% of collateral
    it('Can mint $dAMZN', async () => {
        const doppleAMZN = await ethers.getContract('DoppleAMZN', minter);
        assert.ok(doppleAMZN.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('5200');
        const aDollyBal = await dolly.balanceOf(minter);
        const aAMZNBal = await doppleAMZN.balanceOf(minter);

        actual = await dolly.approve(synthetic.address, dollyAmount);
        assert.ok(actual.hash);

        actual = await synthetic.mintSynthetic(doppleAMZN.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bAMZNBal = await doppleAMZN.balanceOf(minter);
        assert.ok(bDollyBal.eq(aDollyBal.sub(dollyAmount)));
        assert.ok(bAMZNBal.eq(aAMZNBal.add(syntheticAmount)));
    });

    // 1889.019475
    it('Can mint $dXAU', async () => {
        const doppleXAU = await ethers.getContract('DoppleXAU', minter);
        assert.ok(doppleXAU.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('3200');
        const aDollyBal = await dolly.balanceOf(minter);
        const aXAUBal = await doppleXAU.balanceOf(minter);

        actual = await dolly.approve(synthetic.address, dollyAmount);
        assert.ok(actual.hash);

        actual = await synthetic.mintSynthetic(doppleXAU.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bXAUBal = await doppleXAU.balanceOf(minter);
        assert.ok(bDollyBal.eq(aDollyBal.sub(dollyAmount)));
        assert.ok(bXAUBal.eq(aXAUBal.add(syntheticAmount)));
    });

    it('Can fully redeem $dTSLA', async () => {
        const doppleTSLA = await ethers.getContract('DoppleTSLA', minter);
        assert.ok(doppleTSLA.address);

        const aDollyBal = await dolly.balanceOf(minter);
        const aTSLABal = await doppleTSLA.balanceOf(minter);
        actual = await doppleTSLA.approve(synthetic.address, aTSLABal);
        assert.ok(actual.hash);

        actual = await synthetic.redeemSynthetic(doppleTSLA.address, aTSLABal);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bTSLABal = await doppleTSLA.balanceOf(minter);

        assert.ok(bDollyBal.gt(aDollyBal));
        assert.ok(bTSLABal.lt(aTSLABal));
    });

    it('Can fully redeem $dCOIN', async () => {
        const doppleCOIN = await ethers.getContract('DoppleCOIN', minter);
        assert.ok(doppleCOIN.address);

        const aDollyBal = await dolly.balanceOf(minter);
        const aCOINBal = await doppleCOIN.balanceOf(minter);

        actual = await doppleCOIN.approve(synthetic.address, aCOINBal);
        assert.ok(actual.hash);

        actual = await synthetic.redeemSynthetic(doppleCOIN.address, aCOINBal);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bCOINBal = await doppleCOIN.balanceOf(minter);

        assert.ok(bDollyBal.gt(aDollyBal));
        assert.ok(bCOINBal.lt(aCOINBal));
    });

    it('Can fully redeem $dAAPL', async () => {
        const doppleAAPL = await ethers.getContract('DoppleAAPL', minter);
        assert.ok(doppleAAPL.address);

        const aDollyBal = await dolly.balanceOf(minter);
        const aAAPLBal = await doppleAAPL.balanceOf(minter);

        actual = await doppleAAPL.approve(synthetic.address, aAAPLBal);
        assert.ok(actual.hash);

        actual = await synthetic.redeemSynthetic(doppleAAPL.address, aAAPLBal);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bAAPLBal = await doppleAAPL.balanceOf(minter);

        assert.ok(bDollyBal.gt(aDollyBal));
        assert.ok(bAAPLBal.lt(aAAPLBal));
    });

    it('Can fully redeem $dQQQ', async () => {
        const doppleQQQ = await ethers.getContract('DoppleQQQ', minter);
        assert.ok(doppleQQQ.address);

        const aDollyBal = await dolly.balanceOf(minter);
        const aQQQBal = await doppleQQQ.balanceOf(minter);

        actual = await doppleQQQ.approve(synthetic.address, aQQQBal);
        assert.ok(actual.hash);

        actual = await synthetic.redeemSynthetic(doppleQQQ.address, aQQQBal);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bQQQBal = await doppleQQQ.balanceOf(minter);

        assert.ok(bDollyBal.gt(aDollyBal));
        assert.ok(bQQQBal.lt(aQQQBal));
    });

    it('Can fully redeem $dAMZN', async () => {
        const doppleAMZN = await ethers.getContract('DoppleAMZN', minter);
        assert.ok(doppleAMZN.address);

        const aDollyBal = await dolly.balanceOf(minter);
        const aAMZNBal = await doppleAMZN.balanceOf(minter);

        actual = await doppleAMZN.approve(synthetic.address, aAMZNBal);
        assert.ok(actual.hash);

        actual = await synthetic.redeemSynthetic(doppleAMZN.address, aAMZNBal);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bAMZNBal = await doppleAMZN.balanceOf(minter);

        assert.ok(bDollyBal.gt(aDollyBal));
        assert.ok(bAMZNBal.lt(aAMZNBal));
    });

    it('Can fully redeem $dXAU', async () => {
        const doppleXAU = await ethers.getContract('DoppleXAU', minter);
        assert.ok(doppleXAU.address);

        const aDollyBal = await dolly.balanceOf(minter);
        const aXAUBal = await doppleXAU.balanceOf(minter);

        actual = await doppleXAU.approve(synthetic.address, aXAUBal);
        assert.ok(actual.hash);

        actual = await synthetic.redeemSynthetic(doppleXAU.address, aXAUBal);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bXAUBal = await doppleXAU.balanceOf(minter);

        assert.ok(bDollyBal.gt(aDollyBal));
        assert.ok(bXAUBal.lt(aXAUBal));
    });
});
