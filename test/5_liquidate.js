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

    // current price 246.92, collateral 370.38, liquidate at 308.65
    // we put collateral 1000, remove 70% of collateral = 300 => liquidation ratio is 1.214
    it('Can liquidate $dCOIN', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const doppleCOIN = await ethers.getContract('DoppleCOIN');

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const aDollyBal = await dolly.balanceOf(deployer.address);
        const aCOINBal = await doppleCOIN.balanceOf(deployer.address);
        const aDevBal = await dolly.balanceOf(developer.address);

        actual = await dolly.connect(deployer).approve(synthetic.address, dollyAmount);
        assert.ok(actual.hash);

        actual = await synthetic.connect(deployer).mintSynthetic(doppleCOIN.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal1 = await dolly.balanceOf(deployer.address);
        const bCOINBal1 = await doppleCOIN.balanceOf(deployer.address);

        assert.ok(bDollyBal1.eq(aDollyBal.sub(dollyAmount)));
        assert.ok(bCOINBal1.eq(aCOINBal.add(syntheticAmount)));

        // ========================================================
        // REMOVE COLLATERAL
        // ========================================================
        actual = await synthetic.connect(deployer).removeLowerCollateral(doppleCOIN.address, dollyAmount.mul(70).div(100));
        const bDollyBal2 = await dolly.balanceOf(deployer.address);
        assert.ok(bDollyBal2.gt(bDollyBal1));

        // ========================================================
        // LIQUIDATE
        // ========================================================
        actual = await synthetic.connect(liquidator).getRewardFromLiquidate(doppleCOIN.address, deployer.address);
        const [assetBackedAtRateAmount,
            remainingGapAmount,
            minterReceiveAmount,
            liquidatorReceiveAmount,
            platformReceiveAmount] = actual;

        assert.ok(liquidatorReceiveAmount.gt(0)); // ensure liquidator will receive the money.

        actual = await dolly.connect(liquidator).approve(synthetic.address, assetBackedAtRateAmount);
        assert.ok(actual.hash);

        const bDollyBal3 = await dolly.balanceOf(liquidator.address);
        actual = await synthetic.connect(liquidator).liquidate(doppleCOIN.address, deployer.address);
        assert.ok(actual.hash);

        const bDollyBal4 = await dolly.balanceOf(liquidator.address);
        assert.ok(bDollyBal4.gt(bDollyBal3)); // liquidator receive reward.

        const bDevBal = await dolly.balanceOf(developer.address);
        assert.ok(bDevBal.gt(aDevBal)); // developer receive liquidation fee.
    });

    // current price 125.7075, collateral 188.56125, liquidate at 157.134375
    // we put collateral 1000, remove 85% of collateral = 150 => liquidation ratio is 1.1933174224
    it('Can liquidate $dAAPL', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const doppleAAPL = await ethers.getContract('DoppleAAPL');

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const aDollyBal = await dolly.balanceOf(deployer.address);
        const aAAPLBal = await doppleAAPL.balanceOf(deployer.address);
        const aDevBal = await dolly.balanceOf(developer.address);

        actual = await dolly.connect(deployer).approve(synthetic.address, dollyAmount);
        assert.ok(actual.hash);

        actual = await synthetic.connect(deployer).mintSynthetic(doppleAAPL.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal1 = await dolly.balanceOf(deployer.address);
        const bAAPLBal1 = await doppleAAPL.balanceOf(deployer.address);

        assert.ok(bDollyBal1.eq(aDollyBal.sub(dollyAmount)));
        assert.ok(bAAPLBal1.eq(aAAPLBal.add(syntheticAmount)));

        // ========================================================
        // REMOVE COLLATERAL
        // ========================================================
        actual = await synthetic.connect(deployer).removeLowerCollateral(doppleAAPL.address, dollyAmount.mul(85).div(100));
        const bDollyBal2 = await dolly.balanceOf(deployer.address);
        assert.ok(bDollyBal2.gt(bDollyBal1));

        // ========================================================
        // LIQUIDATE
        // ========================================================
        actual = await synthetic.connect(liquidator).getRewardFromLiquidate(doppleAAPL.address, deployer.address);
        const [assetBackedAtRateAmount,
            remainingGapAmount,
            minterReceiveAmount,
            liquidatorReceiveAmount,
            platformReceiveAmount] = actual;

        assert.ok(liquidatorReceiveAmount.gt(0)); // ensure liquidator will receive the money.

        actual = await dolly.connect(liquidator).approve(synthetic.address, assetBackedAtRateAmount);
        assert.ok(actual.hash);

        const bDollyBal3 = await dolly.balanceOf(liquidator.address);
        actual = await synthetic.connect(liquidator).liquidate(doppleAAPL.address, deployer.address);
        assert.ok(actual.hash);

        const bDollyBal4 = await dolly.balanceOf(liquidator.address);
        assert.ok(bDollyBal4.gt(bDollyBal3)); // liquidator receive reward.

        const bDevBal = await dolly.balanceOf(developer.address);
        assert.ok(bDevBal.gt(aDevBal)); // developer receive liquidation fee.
    });

    // current price 333.3875, collateral 500.08125, liquidate at 416.734375
    // we put collateral 1000, remove 65% of collateral = 350 => liquidation ratio is 1.0498294027
    it('Can liquidate $dQQQ', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const doppleQQQ = await ethers.getContract('DoppleQQQ');

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const aDollyBal = await dolly.balanceOf(deployer.address);
        const aQQQBal = await doppleQQQ.balanceOf(deployer.address);
        const aDevBal = await dolly.balanceOf(developer.address);

        actual = await dolly.connect(deployer).approve(synthetic.address, dollyAmount);
        assert.ok(actual.hash);

        actual = await synthetic.connect(deployer).mintSynthetic(doppleQQQ.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal1 = await dolly.balanceOf(deployer.address);
        const bQQQBal1 = await doppleQQQ.balanceOf(deployer.address);

        assert.ok(bDollyBal1.eq(aDollyBal.sub(dollyAmount)));
        assert.ok(bQQQBal1.eq(aQQQBal.add(syntheticAmount)));

        // ========================================================
        // REMOVE COLLATERAL
        // ========================================================
        actual = await synthetic.connect(deployer).removeLowerCollateral(doppleQQQ.address, dollyAmount.mul(65).div(100));
        const bDollyBal2 = await dolly.balanceOf(deployer.address);
        assert.ok(bDollyBal2.gt(bDollyBal1));

        // ========================================================
        // LIQUIDATE
        // ========================================================
        actual = await synthetic.connect(liquidator).getRewardFromLiquidate(doppleQQQ.address, deployer.address);
        const [assetBackedAtRateAmount,
            remainingGapAmount,
            minterReceiveAmount,
            liquidatorReceiveAmount,
            platformReceiveAmount] = actual;

        assert.ok(liquidatorReceiveAmount.gt(0)); // ensure liquidator will receive the money.

        actual = await dolly.connect(liquidator).approve(synthetic.address, assetBackedAtRateAmount);
        assert.ok(actual.hash);

        const bDollyBal3 = await dolly.balanceOf(liquidator.address);
        actual = await synthetic.connect(liquidator).liquidate(doppleQQQ.address, deployer.address);
        assert.ok(actual.hash);

        const bDollyBal4 = await dolly.balanceOf(liquidator.address);
        assert.ok(bDollyBal4.gt(bDollyBal3)); // liquidator receive reward.

        const bDevBal = await dolly.balanceOf(developer.address);
        assert.ok(bDevBal.gt(aDevBal)); // developer receive liquidation fee.
    });

    // current price 3236.592499999, collateral 4,854.8887499985, liquidate at 4,045.7406249988
    // we put collateral 10000, remove 65% of collateral = 3500 => liquidation ratio is 1.0815822002
    it('Can liquidate $dAMZN', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const doppleAMZN = await ethers.getContract('DoppleAMZN');

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('10000');
        const aDollyBal = await dolly.balanceOf(deployer.address);
        const aAMZNBal = await doppleAMZN.balanceOf(deployer.address);
        const aDevBal = await dolly.balanceOf(developer.address);

        actual = await dolly.connect(deployer).approve(synthetic.address, dollyAmount);
        assert.ok(actual.hash);

        actual = await synthetic.connect(deployer).mintSynthetic(doppleAMZN.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal1 = await dolly.balanceOf(deployer.address);
        const bAMZNBal1 = await doppleAMZN.balanceOf(deployer.address);

        assert.ok(bDollyBal1.eq(aDollyBal.sub(dollyAmount)));
        assert.ok(bAMZNBal1.eq(aAMZNBal.add(syntheticAmount)));

        // ========================================================
        // REMOVE COLLATERAL
        // ========================================================
        actual = await synthetic.connect(deployer).removeLowerCollateral(doppleAMZN.address, dollyAmount.mul(65).div(100));
        const bDollyBal2 = await dolly.balanceOf(deployer.address);
        assert.ok(bDollyBal2.gt(bDollyBal1));

        // ========================================================
        // LIQUIDATE
        // ========================================================
        actual = await synthetic.connect(liquidator).getRewardFromLiquidate(doppleAMZN.address, deployer.address);
        const [assetBackedAtRateAmount,
            remainingGapAmount,
            minterReceiveAmount,
            liquidatorReceiveAmount,
            platformReceiveAmount] = actual;

        assert.ok(liquidatorReceiveAmount.gt(0)); // ensure liquidator will receive the money.

        actual = await dolly.connect(liquidator).approve(synthetic.address, assetBackedAtRateAmount);
        assert.ok(actual.hash);

        const bDollyBal3 = await dolly.balanceOf(liquidator.address);
        actual = await synthetic.connect(liquidator).liquidate(doppleAMZN.address, deployer.address);
        assert.ok(actual.hash);

        const bDollyBal4 = await dolly.balanceOf(liquidator.address);
        assert.ok(bDollyBal4.gt(bDollyBal3)); // liquidator receive reward.

        const bDevBal = await dolly.balanceOf(developer.address);
        assert.ok(bDevBal.gt(aDevBal)); // developer receive liquidation fee.
    });

    // current price 1890.94916, collateral 2,836.42374, liquidate at 2,363.68645
    // we put collateral 10000, remove 80% of collateral = 2000 => liquidation ratio is 1.0582010582
    it('Can liquidate $dXAU', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const doppleXAU = await ethers.getContract('DoppleXAU');

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('10000');
        const aDollyBal = await dolly.balanceOf(deployer.address);
        const aXAUBal = await doppleXAU.balanceOf(deployer.address);
        const aDevBal = await dolly.balanceOf(developer.address);

        actual = await dolly.connect(deployer).approve(synthetic.address, dollyAmount);
        assert.ok(actual.hash);

        actual = await synthetic.connect(deployer).mintSynthetic(doppleXAU.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal1 = await dolly.balanceOf(deployer.address);
        const bXAUBal1 = await doppleXAU.balanceOf(deployer.address);

        assert.ok(bDollyBal1.eq(aDollyBal.sub(dollyAmount)));
        assert.ok(bXAUBal1.eq(aXAUBal.add(syntheticAmount)));

        // ========================================================
        // REMOVE COLLATERAL
        // ========================================================
        actual = await synthetic.connect(deployer).removeLowerCollateral(doppleXAU.address, dollyAmount.mul(80).div(100));
        const bDollyBal2 = await dolly.balanceOf(deployer.address);
        assert.ok(bDollyBal2.gt(bDollyBal1));

        // ========================================================
        // LIQUIDATE
        // ========================================================
        actual = await synthetic.connect(liquidator).getRewardFromLiquidate(doppleXAU.address, deployer.address);
        const [assetBackedAtRateAmount,
            remainingGapAmount,
            minterReceiveAmount,
            liquidatorReceiveAmount,
            platformReceiveAmount] = actual;

        assert.ok(liquidatorReceiveAmount.gt(0)); // ensure liquidator will receive the money.

        actual = await dolly.connect(liquidator).approve(synthetic.address, assetBackedAtRateAmount);
        assert.ok(actual.hash);

        const bDollyBal3 = await dolly.balanceOf(liquidator.address);
        actual = await synthetic.connect(liquidator).liquidate(doppleXAU.address, deployer.address);
        assert.ok(actual.hash);

        const bDollyBal4 = await dolly.balanceOf(liquidator.address);
        assert.ok(bDollyBal4.gt(bDollyBal3)); // liquidator receive reward.

        const bDevBal = await dolly.balanceOf(developer.address);
        assert.ok(bDevBal.gt(aDevBal)); // developer receive liquidation fee.
    });
});
