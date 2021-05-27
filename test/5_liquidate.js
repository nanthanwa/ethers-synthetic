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
    let actual, synthetic, networkName, dolly, doppleTSLA;
    let deployer, minter, liquidator, devAddress;
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
            devAddress = namedAccounts.devAddress;
            // console.log('deployer', deployer);
            // console.log('minter', minter);
            // console.log('liquidator', liquidator);
            const Dolly = await deployments.get('Dolly');
            dolly = await ethers.getContractAt('Dolly', Dolly.address, deployer);
            assert.ok(dolly.address);
        }
    });

    it('Can liquidate $dTSLA', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const Synthetic = await deployments.get('Synthetic');
        synthetic = await ethers.getContractAt('Synthetic', Synthetic.address, deployer);
        assert.ok(synthetic.address);

        const DoppleTSLA = await deployments.get('DoppleTSLA');
        doppleTSLA = await ethers.getContractAt('DoppleTSLA', DoppleTSLA.address);
        // console.log('DoppleTSLA.address', DoppleTSLA.address);
        assert.ok(doppleTSLA.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const aDollyBal = await dolly.balanceOf(deployer);
        const aTSLABal = await doppleTSLA.balanceOf(deployer);
        // console.log('dollyAmount', dollyAmount.toString());
        // console.log('aDollyBal', aDollyBal.toString());
        // console.log('aTSLABal', aTSLABal.toString());

        dolly = await ethers.getContractAt('Dolly', dolly.address, deployer);
        actual = await dolly.approve(synthetic.address, dollyAmount);
        assert.ok(actual.hash);

        actual = await synthetic.mintSynthetic(doppleTSLA.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal1 = await dolly.balanceOf(deployer);
        const bTSLABal1 = await doppleTSLA.balanceOf(deployer);
        // console.log('bDollyBal1', bDollyBal1.toString());
        // console.log('bTSLABal1', bTSLABal1.toString());

        assert.ok(bDollyBal1.eq(aDollyBal.sub(dollyAmount)));
        assert.ok(bTSLABal1.eq(aTSLABal.add(syntheticAmount)));

        // ========================================================
        // REMOVE COLLATERAL
        // ========================================================
        actual = await synthetic.removeLowerCollateral(doppleTSLA.address, dollyAmount.div(4));
        const bDollyBal2 = await dolly.balanceOf(deployer);
        assert.ok(bDollyBal2.gt(bDollyBal1));

        // ========================================================
        // LIQUIDATE
        // ========================================================
        synthetic = await ethers.getContractAt('Synthetic', synthetic.address, liquidator);
        assert.ok(synthetic.address);

        actual = await synthetic.viewRewardFromLiquidate(doppleTSLA.address, deployer);
        const [assetBackedAtRateAmount,
            remainingGapAmount,
            minterReceiveAmount,
            liquidatorReceiveAmount,
            platformReceiveAmount] = actual;
        // console.log('assetBackedAtRateAmount', assetBackedAtRateAmount);
        // console.log('remainingGapAmount', remainingGapAmount);
        // console.log('minterReceiveAmount', minterReceiveAmount);
        // console.log('liquidatorReceiveAmount', liquidatorReceiveAmount);
        // console.log('platformReceiveAmount', platformReceiveAmount);

        actual = await synthetic.contracts(deployer, doppleTSLA.address);
        const [
            _minter,
            _asset,
            _assetBacked,
            _assetAmount,
            _assetBackedAmount,
            _currentRatio,
            _willLiquidateAtPrice,
            _canMintRemainning,
            _canWithdrawRemainning,
            _updatedAt,
            _updatedBlock,
            _exchangeRateAtMinted,
            _currentExchangeRate,
        ] = actual;
        // console.log('_currentRatio', _currentRatio);
        // console.log('_willLiquidateAtPrice', _willLiquidateAtPrice);
        // console.log('_currentExchangeRate', _currentExchangeRate);

        assert.ok(_currentExchangeRate.gt(_willLiquidateAtPrice));
        assert.ok(liquidatorReceiveAmount.gt(0));

        dolly = await ethers.getContractAt('Dolly', dolly.address, liquidator);
        actual = await dolly.approve(synthetic.address, assetBackedAtRateAmount);
        assert.ok(actual.hash);

        const bDollyBal3 = await dolly.balanceOf(liquidator);
        actual = await synthetic.liquidate(doppleTSLA.address, deployer);
        assert.ok(actual.hash);

        const bDollyBal4 = await dolly.balanceOf(liquidator);
        assert.ok(bDollyBal4.gt(bDollyBal3));
    });

    // 126.9125
    it('Can liquidate $dAAPL', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const Synthetic = await deployments.get('Synthetic');
        synthetic = await ethers.getContractAt('Synthetic', Synthetic.address, deployer);
        assert.ok(synthetic.address);

        const DoppleAAPL = await deployments.get('DoppleAAPL');
        doppleAAPL = await ethers.getContractAt('DoppleAAPL', DoppleAAPL.address);
        // console.log('DoppleAAPL.address', DoppleAAPL.address);
        assert.ok(doppleAAPL.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('200');
        const aDollyBal = await dolly.balanceOf(deployer);
        const aAAPLBal = await doppleAAPL.balanceOf(deployer);
        // console.log('dollyAmount', dollyAmount.toString());
        // console.log('aDollyBal', aDollyBal.toString());
        // console.log('aAAPLBal', aAAPLBal.toString());

        dolly = await ethers.getContractAt('Dolly', dolly.address, deployer);
        actual = await dolly.approve(synthetic.address, dollyAmount);
        assert.ok(actual.hash);

        actual = await synthetic.mintSynthetic(doppleAAPL.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal1 = await dolly.balanceOf(deployer);
        const bAAPLBal1 = await doppleAAPL.balanceOf(deployer);
        // console.log('bDollyBal1', bDollyBal1.toString());
        // console.log('bAAPLBal1', bAAPLBal1.toString());

        assert.ok(bDollyBal1.eq(aDollyBal.sub(dollyAmount)));
        assert.ok(bAAPLBal1.eq(aAAPLBal.add(syntheticAmount)));

        // ========================================================
        // REMOVE COLLATERAL
        // ========================================================
        actual = await synthetic.removeLowerCollateral(doppleAAPL.address, dollyAmount.div(4));
        const bDollyBal2 = await dolly.balanceOf(deployer);
        assert.ok(bDollyBal2.gt(bDollyBal1));

        // ========================================================
        // LIQUIDATE
        // ========================================================
        synthetic = await ethers.getContractAt('Synthetic', synthetic.address, liquidator);
        assert.ok(synthetic.address);

        actual = await synthetic.viewRewardFromLiquidate(doppleAAPL.address, deployer);
        const [assetBackedAtRateAmount,
            remainingGapAmount,
            minterReceiveAmount,
            liquidatorReceiveAmount,
            platformReceiveAmount] = actual;
        // console.log('assetBackedAtRateAmount', assetBackedAtRateAmount);
        // console.log('remainingGapAmount', remainingGapAmount);
        // console.log('minterReceiveAmount', minterReceiveAmount);
        // console.log('liquidatorReceiveAmount', liquidatorReceiveAmount);
        // console.log('platformReceiveAmount', platformReceiveAmount);

        actual = await synthetic.contracts(deployer, doppleAAPL.address);
        const [
            _minter,
            _asset,
            _assetBacked,
            _assetAmount,
            _assetBackedAmount,
            _currentRatio,
            _willLiquidateAtPrice,
            _canMintRemainning,
            _canWithdrawRemainning,
            _updatedAt,
            _updatedBlock,
            _exchangeRateAtMinted,
            _currentExchangeRate,
        ] = actual;
        // console.log('_currentRatio', _currentRatio);
        // console.log('_willLiquidateAtPrice', _willLiquidateAtPrice);
        // console.log('_currentExchangeRate', _currentExchangeRate);

        assert.ok(_currentExchangeRate.gt(_willLiquidateAtPrice));
        assert.ok(liquidatorReceiveAmount.gt(0));

        dolly = await ethers.getContractAt('Dolly', dolly.address, liquidator);
        actual = await dolly.approve(synthetic.address, assetBackedAtRateAmount);
        assert.ok(actual.hash);

        const bDollyBal3 = await dolly.balanceOf(liquidator);
        actual = await synthetic.liquidate(doppleAAPL.address, deployer);
        assert.ok(actual.hash);
        // console.log('bDollyBal3', bDollyBal3);

        const bDollyBal4 = await dolly.balanceOf(liquidator);
        assert.ok(bDollyBal4.gt(bDollyBal3));
        // console.log('bDollyBal4', bDollyBal4);
    });

    // 243.48
    it('Can liquidate $dCOIN', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const Synthetic = await deployments.get('Synthetic');
        synthetic = await ethers.getContractAt('Synthetic', Synthetic.address, deployer);
        assert.ok(synthetic.address);

        const DoppleCOIN = await deployments.get('DoppleCOIN');
        doppleCOIN = await ethers.getContractAt('DoppleCOIN', DoppleCOIN.address);
        // console.log('DoppleCOIN.address', DoppleCOIN.address);
        assert.ok(doppleCOIN.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('400');
        const aDollyBal = await dolly.balanceOf(deployer);
        const aCOINBal = await doppleCOIN.balanceOf(deployer);
        // console.log('dollyAmount', dollyAmount.toString());
        // console.log('aDollyBal', aDollyBal.toString());
        // console.log('aCOINBal', aCOINBal.toString());

        dolly = await ethers.getContractAt('Dolly', dolly.address, deployer);
        actual = await dolly.approve(synthetic.address, dollyAmount);
        assert.ok(actual.hash);

        actual = await synthetic.mintSynthetic(doppleCOIN.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal1 = await dolly.balanceOf(deployer);
        const bCOINBal1 = await doppleCOIN.balanceOf(deployer);
        // console.log('bDollyBal1', bDollyBal1.toString());
        // console.log('bCOINBal1', bCOINBal1.toString());

        assert.ok(bDollyBal1.eq(aDollyBal.sub(dollyAmount)));
        assert.ok(bCOINBal1.eq(aCOINBal.add(syntheticAmount)));

        // ========================================================
        // REMOVE COLLATERAL
        // ========================================================
        actual = await synthetic.removeLowerCollateral(doppleCOIN.address, dollyAmount.div(4));
        const bDollyBal2 = await dolly.balanceOf(deployer);
        assert.ok(bDollyBal2.gt(bDollyBal1));

        // ========================================================
        // LIQUIDATE
        // ========================================================
        synthetic = await ethers.getContractAt('Synthetic', synthetic.address, liquidator);
        assert.ok(synthetic.address);

        actual = await synthetic.viewRewardFromLiquidate(doppleCOIN.address, deployer);
        const [assetBackedAtRateAmount,
            remainingGapAmount,
            minterReceiveAmount,
            liquidatorReceiveAmount,
            platformReceiveAmount] = actual;
        // console.log('assetBackedAtRateAmount', assetBackedAtRateAmount);
        // console.log('remainingGapAmount', remainingGapAmount);
        // console.log('minterReceiveAmount', minterReceiveAmount);
        // console.log('liquidatorReceiveAmount', liquidatorReceiveAmount);
        // console.log('platformReceiveAmount', platformReceiveAmount);

        actual = await synthetic.contracts(deployer, doppleCOIN.address);
        const [
            _minter,
            _asset,
            _assetBacked,
            _assetAmount,
            _assetBackedAmount,
            _currentRatio,
            _willLiquidateAtPrice,
            _canMintRemainning,
            _canWithdrawRemainning,
            _updatedAt,
            _updatedBlock,
            _exchangeRateAtMinted,
            _currentExchangeRate,
        ] = actual;
        // console.log('_currentRatio', _currentRatio);
        // console.log('_willLiquidateAtPrice', _willLiquidateAtPrice);
        // console.log('_currentExchangeRate', _currentExchangeRate);

        assert.ok(_currentExchangeRate.gt(_willLiquidateAtPrice));
        assert.ok(liquidatorReceiveAmount.gt(0));

        dolly = await ethers.getContractAt('Dolly', dolly.address, liquidator);
        actual = await dolly.approve(synthetic.address, assetBackedAtRateAmount);
        assert.ok(actual.hash);

        const bDollyBal3 = await dolly.balanceOf(liquidator);
        actual = await synthetic.liquidate(doppleCOIN.address, deployer);
        assert.ok(actual.hash);
        // console.log('bDollyBal3', bDollyBal3);

        const bDollyBal4 = await dolly.balanceOf(liquidator);
        assert.ok(bDollyBal4.gt(bDollyBal3));
        // console.log('bDollyBal4', bDollyBal4);
    });

    // 3288
    it('Can liquidate $dAMZN', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const Synthetic = await deployments.get('Synthetic');
        synthetic = await ethers.getContractAt('Synthetic', Synthetic.address, deployer);
        assert.ok(synthetic.address);

        const DoppleAMZN = await deployments.get('DoppleAMZN');
        doppleAMZN = await ethers.getContractAt('DoppleAMZN', DoppleAMZN.address);
        // console.log('DoppleAMZN.address', DoppleAMZN.address);
        assert.ok(doppleAMZN.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('5500');
        const aDollyBal = await dolly.balanceOf(deployer);
        const aAMZNBal = await doppleAMZN.balanceOf(deployer);
        // console.log('dollyAmount', dollyAmount.toString());
        // console.log('aDollyBal', aDollyBal.toString());
        // console.log('aAMZNBal', aAMZNBal.toString());

        dolly = await ethers.getContractAt('Dolly', dolly.address, deployer);
        actual = await dolly.approve(synthetic.address, dollyAmount);
        assert.ok(actual.hash);

        actual = await synthetic.mintSynthetic(doppleAMZN.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal1 = await dolly.balanceOf(deployer);
        const bAMZNBal1 = await doppleAMZN.balanceOf(deployer);
        // console.log('bDollyBal1', bDollyBal1.toString());
        // console.log('bAMZNBal1', bAMZNBal1.toString());

        assert.ok(bDollyBal1.eq(aDollyBal.sub(dollyAmount)));
        assert.ok(bAMZNBal1.eq(aAMZNBal.add(syntheticAmount)));

        // ========================================================
        // REMOVE COLLATERAL
        // ========================================================
        console.log('dollyAmount.div(2)', dollyAmount.div(2).toString());
        actual = await synthetic.removeLowerCollateral(doppleAMZN.address, dollyAmount.div(2));
        const bDollyBal2 = await dolly.balanceOf(deployer);
        assert.ok(bDollyBal2.gt(bDollyBal1));

        // ========================================================
        // LIQUIDATE
        // ========================================================
        synthetic = await ethers.getContractAt('Synthetic', synthetic.address, liquidator);
        assert.ok(synthetic.address);

        actual = await synthetic.viewRewardFromLiquidate(doppleAMZN.address, deployer);
        const [assetBackedAtRateAmount,
            remainingGapAmount,
            minterReceiveAmount,
            liquidatorReceiveAmount,
            platformReceiveAmount] = actual;
        // console.log('assetBackedAtRateAmount', assetBackedAtRateAmount);
        // console.log('remainingGapAmount', remainingGapAmount);
        // console.log('minterReceiveAmount', minterReceiveAmount);
        // console.log('liquidatorReceiveAmount', liquidatorReceiveAmount);
        // console.log('platformReceiveAmount', platformReceiveAmount);

        actual = await synthetic.contracts(deployer, doppleAMZN.address);
        const [
            _minter,
            _asset,
            _assetBacked,
            _assetAmount,
            _assetBackedAmount,
            _currentRatio,
            _willLiquidateAtPrice,
            _canMintRemainning,
            _canWithdrawRemainning,
            _updatedAt,
            _updatedBlock,
            _exchangeRateAtMinted,
            _currentExchangeRate,
        ] = actual;
        // console.log('_currentRatio', _currentRatio);
        // console.log('_willLiquidateAtPrice', _willLiquidateAtPrice);
        // console.log('_currentExchangeRate', _currentExchangeRate);

        assert.ok(_currentExchangeRate.gt(_willLiquidateAtPrice));
        assert.ok(liquidatorReceiveAmount.gt(0));

        dolly = await ethers.getContractAt('Dolly', dolly.address, liquidator);
        actual = await dolly.approve(synthetic.address, assetBackedAtRateAmount);
        assert.ok(actual.hash);

        const bDollyBal3 = await dolly.balanceOf(liquidator);
        actual = await synthetic.liquidate(doppleAMZN.address, deployer);
        assert.ok(actual.hash);
        // console.log('bDollyBal3', bDollyBal3);

        const bDollyBal4 = await dolly.balanceOf(liquidator);
        assert.ok(bDollyBal4.gt(bDollyBal3));
        // console.log('bDollyBal4', bDollyBal4);
    });

    // 334.3575
    it('Can liquidate $dQQQ', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const Synthetic = await deployments.get('Synthetic');
        synthetic = await ethers.getContractAt('Synthetic', Synthetic.address, deployer);
        assert.ok(synthetic.address);

        const DoppleQQQ = await deployments.get('DoppleQQQ');
        doppleQQQ = await ethers.getContractAt('DoppleQQQ', DoppleQQQ.address);
        // console.log('DoppleQQQ.address', DoppleQQQ.address);
        assert.ok(doppleQQQ.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('600');
        const aDollyBal = await dolly.balanceOf(deployer);
        const aQQQBal = await doppleQQQ.balanceOf(deployer);
        // console.log('dollyAmount', dollyAmount.toString());
        // console.log('aDollyBal', aDollyBal.toString());
        // console.log('aQQQBal', aQQQBal.toString());

        dolly = await ethers.getContractAt('Dolly', dolly.address, deployer);
        actual = await dolly.approve(synthetic.address, dollyAmount);
        assert.ok(actual.hash);

        actual = await synthetic.mintSynthetic(doppleQQQ.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal1 = await dolly.balanceOf(deployer);
        const bQQQBal1 = await doppleQQQ.balanceOf(deployer);
        // console.log('bDollyBal1', bDollyBal1.toString());
        // console.log('bQQQBal1', bQQQBal1.toString());

        assert.ok(bDollyBal1.eq(aDollyBal.sub(dollyAmount)));
        assert.ok(bQQQBal1.eq(aQQQBal.add(syntheticAmount)));

        // ========================================================
        // REMOVE COLLATERAL
        // ========================================================
        actual = await synthetic.removeLowerCollateral(doppleQQQ.address, dollyAmount.div(2));
        const bDollyBal2 = await dolly.balanceOf(deployer);
        assert.ok(bDollyBal2.gt(bDollyBal1));

        // ========================================================
        // LIQUIDATE
        // ========================================================
        synthetic = await ethers.getContractAt('Synthetic', synthetic.address, liquidator);
        assert.ok(synthetic.address);

        actual = await synthetic.viewRewardFromLiquidate(doppleQQQ.address, deployer);
        const [assetBackedAtRateAmount,
            remainingGapAmount,
            minterReceiveAmount,
            liquidatorReceiveAmount,
            platformReceiveAmount] = actual;
        // console.log('assetBackedAtRateAmount', assetBackedAtRateAmount);
        // console.log('remainingGapAmount', remainingGapAmount);
        // console.log('minterReceiveAmount', minterReceiveAmount);
        // console.log('liquidatorReceiveAmount', liquidatorReceiveAmount);
        // console.log('platformReceiveAmount', platformReceiveAmount);

        actual = await synthetic.contracts(deployer, doppleQQQ.address);
        const [
            _minter,
            _asset,
            _assetBacked,
            _assetAmount,
            _assetBackedAmount,
            _currentRatio,
            _willLiquidateAtPrice,
            _canMintRemainning,
            _canWithdrawRemainning,
            _updatedAt,
            _updatedBlock,
            _exchangeRateAtMinted,
            _currentExchangeRate,
        ] = actual;
        // console.log('_currentRatio', _currentRatio);
        // console.log('_willLiquidateAtPrice', _willLiquidateAtPrice);
        // console.log('_currentExchangeRate', _currentExchangeRate);

        assert.ok(_currentExchangeRate.gt(_willLiquidateAtPrice));
        assert.ok(liquidatorReceiveAmount.gt(0));

        dolly = await ethers.getContractAt('Dolly', dolly.address, liquidator);
        actual = await dolly.approve(synthetic.address, assetBackedAtRateAmount);
        assert.ok(actual.hash);

        const bDollyBal3 = await dolly.balanceOf(liquidator);
        actual = await synthetic.liquidate(doppleQQQ.address, deployer);
        assert.ok(actual.hash);
        // console.log('bDollyBal3', bDollyBal3);

        const bDollyBal4 = await dolly.balanceOf(liquidator);
        assert.ok(bDollyBal4.gt(bDollyBal3));
        // console.log('bDollyBal4', bDollyBal4);
    });

    // 1889.019475
    it('Can liquidate $dXAU', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const Synthetic = await deployments.get('Synthetic');
        synthetic = await ethers.getContractAt('Synthetic', Synthetic.address, deployer);
        assert.ok(synthetic.address);

        const DoppleXAU = await deployments.get('DoppleXAU');
        doppleXAU = await ethers.getContractAt('DoppleXAU', DoppleXAU.address);
        // console.log('DoppleXAU.address', DoppleXAU.address);
        assert.ok(doppleXAU.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('3000');
        const aDollyBal = await dolly.balanceOf(deployer);
        const aXAUBal = await doppleXAU.balanceOf(deployer);
        // console.log('dollyAmount', dollyAmount.toString());
        // console.log('aDollyBal', aDollyBal.toString());
        // console.log('aXAUBal', aXAUBal.toString());

        dolly = await ethers.getContractAt('Dolly', dolly.address, deployer);
        actual = await dolly.approve(synthetic.address, dollyAmount);
        assert.ok(actual.hash);

        actual = await synthetic.mintSynthetic(doppleXAU.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal1 = await dolly.balanceOf(deployer);
        const bXAUBal1 = await doppleXAU.balanceOf(deployer);
        // console.log('bDollyBal1', bDollyBal1.toString());
        // console.log('bXAUBal1', bXAUBal1.toString());

        assert.ok(bDollyBal1.eq(aDollyBal.sub(dollyAmount)));
        assert.ok(bXAUBal1.eq(aXAUBal.add(syntheticAmount)));

        // ========================================================
        // REMOVE COLLATERAL
        // ========================================================
        actual = await synthetic.removeLowerCollateral(doppleXAU.address, dollyAmount.div(4));
        const bDollyBal2 = await dolly.balanceOf(deployer);
        assert.ok(bDollyBal2.gt(bDollyBal1));

        // ========================================================
        // LIQUIDATE
        // ========================================================
        synthetic = await ethers.getContractAt('Synthetic', synthetic.address, liquidator);
        assert.ok(synthetic.address);

        actual = await synthetic.viewRewardFromLiquidate(doppleXAU.address, deployer);
        const [assetBackedAtRateAmount,
            remainingGapAmount,
            minterReceiveAmount,
            liquidatorReceiveAmount,
            platformReceiveAmount] = actual;
        // console.log('assetBackedAtRateAmount', assetBackedAtRateAmount);
        // console.log('remainingGapAmount', remainingGapAmount);
        // console.log('minterReceiveAmount', minterReceiveAmount);
        // console.log('liquidatorReceiveAmount', liquidatorReceiveAmount);
        // console.log('platformReceiveAmount', platformReceiveAmount);

        actual = await synthetic.contracts(deployer, doppleXAU.address);
        const [
            _minter,
            _asset,
            _assetBacked,
            _assetAmount,
            _assetBackedAmount,
            _currentRatio,
            _willLiquidateAtPrice,
            _canMintRemainning,
            _canWithdrawRemainning,
            _updatedAt,
            _updatedBlock,
            _exchangeRateAtMinted,
            _currentExchangeRate,
        ] = actual;
        // console.log('_currentRatio', _currentRatio);
        // console.log('_willLiquidateAtPrice', _willLiquidateAtPrice);
        // console.log('_currentExchangeRate', _currentExchangeRate);

        assert.ok(_currentExchangeRate.gt(_willLiquidateAtPrice));
        assert.ok(liquidatorReceiveAmount.gt(0));

        dolly = await ethers.getContractAt('Dolly', dolly.address, liquidator);
        actual = await dolly.approve(synthetic.address, assetBackedAtRateAmount);
        assert.ok(actual.hash);

        const bDollyBal3 = await dolly.balanceOf(liquidator);
        actual = await synthetic.liquidate(doppleXAU.address, deployer);
        assert.ok(actual.hash);
        // console.log('bDollyBal3', bDollyBal3);

        const bDollyBal4 = await dolly.balanceOf(liquidator);
        assert.ok(bDollyBal4.gt(bDollyBal3));
        // console.log('bDollyBal4', bDollyBal4);
    });
});
