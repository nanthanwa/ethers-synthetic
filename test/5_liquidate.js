const chai = require('chai');
const { expect, assert } = chai;
const { deployments } = require('hardhat');
const { ethers, getNamedAccounts } = require('hardhat');
const { BigNumber } = ethers.utils;
const fs = require('fs');
chai.use(require('chai-bignumber')());

// @dev We will simulate liquidate condition with remove almost entire collateral
// @notice Synthetic's contract owner (deployer) can call special method called removeLowerCollateral()
describe('Liquidation Testing', async () => {
    let actual, synthetic, networkName, dolly;
    let deployer, minter, liquidator, developer;
    before(async () => {
        networkName = (await ethers.provider.getNetwork()).name;
        console.log('network', networkName);
        [deployer, minter, liquidator, developer] = await ethers.getSigners();
        if (networkName === 'kovan') {
            const data = JSON.parse(fs.readFileSync(`./deployments/${networkName}/Synthetic.json`).toString().trim());
            synthetic = await ethers.getContractAt('Synthetic', data.address);
            assert.ok(synthetic.address);
        } else {
            await deployments.fixture(); // ensure you start from a fresh deployments
            dolly = await ethers.getContract('Dolly');
            assert.ok(dolly.address);
            synthetic = await ethers.getContract('Synthetic');
            assert.ok(synthetic.address);
        }
    });

    // current price 629.9875, collateral 944.98125, liquidate at 787.484375
    // we put collateral 1000, remove 25% of collateral = 750 => liquidation ratio is 1.19
    it('Can liquidate $dTSLA', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const doppleTSLA = await ethers.getContract('DoppleTSLA');

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const aDollyBal = await dolly.balanceOf(deployer.address);
        const aTSLABal = await doppleTSLA.balanceOf(deployer.address);
        const aDevBal = await dolly.balanceOf(developer.address);

        actual = await dolly.connect(deployer).approve(synthetic.address, dollyAmount);
        assert.ok(actual.hash);

        actual = await synthetic.connect(deployer).mintSynthetic(doppleTSLA.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal1 = await dolly.balanceOf(deployer.address);
        const bTSLABal1 = await doppleTSLA.balanceOf(deployer.address);

        assert.ok(bDollyBal1.eq(aDollyBal.sub(dollyAmount)));
        assert.ok(bTSLABal1.eq(aTSLABal.add(syntheticAmount)));

        // ========================================================
        // REMOVE COLLATERAL
        // ========================================================
        actual = await synthetic.connect(deployer).removeLowerCollateral(doppleTSLA.address, dollyAmount.mul(25).div(100));
        const bDollyBal2 = await dolly.balanceOf(deployer.address);
        assert.ok(bDollyBal2.gt(bDollyBal1));

        // ========================================================
        // LIQUIDATE
        // ========================================================
        actual = await synthetic.connect(liquidator).getRewardFromLiquidate(doppleTSLA.address, deployer.address);
        const [assetBackedAtRateAmount,
            remainingGapAmount,
            minterReceiveAmount,
            liquidatorReceiveAmount,
            platformReceiveAmount] = actual;

        assert.ok(liquidatorReceiveAmount.gt(0)); // ensure liquidator will receive the money.

        actual = await dolly.connect(liquidator).approve(synthetic.address, assetBackedAtRateAmount);
        assert.ok(actual.hash);

        const bDollyBal3 = await dolly.balanceOf(liquidator.address);
        actual = await synthetic.connect(liquidator).liquidate(doppleTSLA.address, deployer.address);
        assert.ok(actual.hash);

        const bDollyBal4 = await dolly.balanceOf(liquidator.address);
        assert.ok(bDollyBal4.gt(bDollyBal3)); // liquidator receive reward.

        const bDevBal = await dolly.balanceOf(developer.address);
        assert.ok(bDevBal.gt(aDevBal)); // developer receive liquidation fee.
    });
});
