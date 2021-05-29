const { assert } = require('chai');
const { deployments } = require('hardhat');
const { ethers } = require('hardhat');
const fs = require('fs');

// @dev We will simulate liquidate condition with remove almost entire collateral
// @notice Synthetic's contract owner (deployer) can call special method called removeLowerCollateral()
describe('Liquidation Testing', async () => {
    let actual, synthetic, doppleSyntheticTokenFactory, dolly, networkName;
    let deployer, minter, liquidator, developer;
    before(async () => {
        networkName = (await ethers.provider.getNetwork()).name;
        console.log('network', networkName);
        [deployer, minter, liquidator, developer] = await ethers.getSigners();
        if (networkName !== 'kovan') {
            await deployments.fixture(); // ensure you start from a fresh deployments
        }
        dolly = await ethers.getContract('Dolly');
        assert.ok(dolly.address);
        synthetic = await ethers.getContract('Synthetic');
        assert.ok(synthetic.address);
        doppleSyntheticTokenFactory = await ethers.getContract('DoppleSyntheticTokenFactory', minter);
        assert.ok(doppleSyntheticTokenFactory.address);
    });

    // current price 629.9875, collateral 944.98125, liquidate at 787.484375
    // we put collateral 1000, remove 25% of collateral = 750 => liquidation ratio is 1.19
    it('Can liquidate $dTSLA', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dTSLA');
        const doppleTSLA = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleTSLA.address);

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

    // current price 239.285, collateral 358.9275, liquidate at 299.10625
    // we put collateral 1000, remove 73% of collateral = 270 => liquidation ratio is 1.129707113
    it('Can liquidate $dCOIN', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dCOIN');
        const doppleCOIN = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleCOIN.address);

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
        actual = await synthetic.connect(deployer).removeLowerCollateral(doppleCOIN.address, dollyAmount.mul(73).div(100));
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
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dAAPL');
        const doppleAAPL = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleAAPL.address);

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
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dQQQ');
        const doppleQQQ = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleQQQ.address);

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
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dAMZN');
        const doppleAMZN = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleAMZN.address);

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
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dXAU');
        const doppleXAU = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleXAU.address);

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
