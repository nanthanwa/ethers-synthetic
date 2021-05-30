const { assert } = require('chai');
const { deployments } = require('hardhat');
const { ethers } = require('hardhat');
const fs = require('fs');

describe('Add and remove synthetic Testing', async () => {
    let actual, synthetic, doppleSyntheticTokenFactory, dolly;
    let deployer, minter, liquidator, developer;
    before(async () => {
        const networkName = (await ethers.provider.getNetwork()).name;
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

    it('Can add synthetic for $dTSLA', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dTSLA');
        const doppleTSLA = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleTSLA.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const aDollyBal = await dolly.balanceOf(minter.address);
        const aTSLABal = await doppleTSLA.balanceOf(minter.address);

        let allowance = await dolly.allowance(minter.address, synthetic.address);
        if (allowance.lte(dollyAmount)) {
            actual = await dolly.connect(minter).approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }

        actual = await synthetic.connect(minter).mintSynthetic(doppleTSLA.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const aRatio = (await synthetic.contracts(minter.address, doppleTSLA.address)).currentRatio;

        const bDollyBal1 = await dolly.balanceOf(minter.address);
        assert.ok(bDollyBal1.eq(aDollyBal.sub(dollyAmount)));

        const bTSLABal1 = await doppleTSLA.balanceOf(minter.address);
        assert.ok(bTSLABal1.eq(aTSLABal.add(syntheticAmount)));

        // ========================================================
        // ADD MORE SYNTHETIC
        // ========================================================
        const mintingNote = await synthetic.contracts(minter.address, doppleTSLA.address);

        actual = await synthetic.connect(minter).addSynthetic(doppleTSLA.address, mintingNote.canMintRemainning.div(2));
        const bRatio = (await synthetic.contracts(minter.address, doppleTSLA.address)).currentRatio;
        assert.ok(bRatio.lt(aRatio));

        const bSyntheticAmount = await doppleTSLA.balanceOf(minter.address);
        assert.ok(bSyntheticAmount.gt(syntheticAmount));
    });

    it('Can add synthetic for $dCOIN', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dCOIN');
        const doppleCOIN = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleCOIN.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const aDollyBal = await dolly.balanceOf(minter.address);
        const aCOINBal = await doppleCOIN.balanceOf(minter.address);

        let allowance = await dolly.allowance(minter.address, synthetic.address);
        if (allowance.lte(dollyAmount)) {
            actual = await dolly.connect(minter).approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }

        actual = await synthetic.connect(minter).mintSynthetic(doppleCOIN.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const aRatio = (await synthetic.contracts(minter.address, doppleCOIN.address)).currentRatio;

        const bDollyBal1 = await dolly.balanceOf(minter.address);
        assert.ok(bDollyBal1.eq(aDollyBal.sub(dollyAmount)));

        const bCOINBal1 = await doppleCOIN.balanceOf(minter.address);
        assert.ok(bCOINBal1.eq(aCOINBal.add(syntheticAmount)));

        // ========================================================
        // ADD MORE SYNTHETIC
        // ========================================================
        const mintingNote = await synthetic.contracts(minter.address, doppleCOIN.address);

        actual = await synthetic.connect(minter).addSynthetic(doppleCOIN.address, mintingNote.canMintRemainning.div(2));
        const bRatio = (await synthetic.contracts(minter.address, doppleCOIN.address)).currentRatio;
        assert.ok(bRatio.lt(aRatio));

        const bSyntheticAmount = await doppleCOIN.balanceOf(minter.address);
        assert.ok(bSyntheticAmount.gt(syntheticAmount));
    });

    it('Can add synthetic for $dAAPL', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dAAPL');
        const doppleAAPL = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleAAPL.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const aDollyBal = await dolly.balanceOf(minter.address);
        const aAAPLBal = await doppleAAPL.balanceOf(minter.address);

        let allowance = await dolly.allowance(minter.address, synthetic.address);
        if (allowance.lte(dollyAmount)) {
            actual = await dolly.connect(minter).approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }

        actual = await synthetic.connect(minter).mintSynthetic(doppleAAPL.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const aRatio = (await synthetic.contracts(minter.address, doppleAAPL.address)).currentRatio;

        const bDollyBal1 = await dolly.balanceOf(minter.address);
        assert.ok(bDollyBal1.eq(aDollyBal.sub(dollyAmount)));

        const bAAPLBal1 = await doppleAAPL.balanceOf(minter.address);
        assert.ok(bAAPLBal1.eq(aAAPLBal.add(syntheticAmount)));

        // ========================================================
        // ADD MORE SYNTHETIC
        // ========================================================
        const mintingNote = await synthetic.contracts(minter.address, doppleAAPL.address);

        actual = await synthetic.connect(minter).addSynthetic(doppleAAPL.address, mintingNote.canMintRemainning.div(2));
        const bRatio = (await synthetic.contracts(minter.address, doppleAAPL.address)).currentRatio;
        assert.ok(bRatio.lt(aRatio));

        const bSyntheticAmount = await doppleAAPL.balanceOf(minter.address);
        assert.ok(bSyntheticAmount.gt(syntheticAmount));
    });

    it('Can add synthetic for $dQQQ', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dQQQ');
        const doppleQQQ = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleQQQ.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const aDollyBal = await dolly.balanceOf(minter.address);
        const aQQQBal = await doppleQQQ.balanceOf(minter.address);

        let allowance = await dolly.allowance(minter.address, synthetic.address);
        if (allowance.lte(dollyAmount)) {
            actual = await dolly.connect(minter).approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }

        actual = await synthetic.connect(minter).mintSynthetic(doppleQQQ.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const aRatio = (await synthetic.contracts(minter.address, doppleQQQ.address)).currentRatio;

        const bDollyBal1 = await dolly.balanceOf(minter.address);
        assert.ok(bDollyBal1.eq(aDollyBal.sub(dollyAmount)));

        const bQQQBal1 = await doppleQQQ.balanceOf(minter.address);
        assert.ok(bQQQBal1.eq(aQQQBal.add(syntheticAmount)));

        // ========================================================
        // ADD MORE SYNTHETIC
        // ========================================================
        const mintingNote = await synthetic.contracts(minter.address, doppleQQQ.address);

        actual = await synthetic.connect(minter).addSynthetic(doppleQQQ.address, mintingNote.canMintRemainning.div(2));
        const bRatio = (await synthetic.contracts(minter.address, doppleQQQ.address)).currentRatio;
        assert.ok(bRatio.lt(aRatio));

        const bSyntheticAmount = await doppleQQQ.balanceOf(minter.address);
        assert.ok(bSyntheticAmount.gt(syntheticAmount));
    });

    it('Can add synthetic for $dAMZN', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dAMZN');
        const doppleAMZN = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleAMZN.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('5200');
        const aDollyBal = await dolly.balanceOf(minter.address);
        const aAMZNBal = await doppleAMZN.balanceOf(minter.address);

        let allowance = await dolly.allowance(minter.address, synthetic.address);
        if (allowance.lte(dollyAmount)) {
            actual = await dolly.connect(minter).approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }

        actual = await synthetic.connect(minter).mintSynthetic(doppleAMZN.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const aRatio = (await synthetic.contracts(minter.address, doppleAMZN.address)).currentRatio;

        const bDollyBal1 = await dolly.balanceOf(minter.address);
        assert.ok(bDollyBal1.eq(aDollyBal.sub(dollyAmount)));

        const bAMZNBal1 = await doppleAMZN.balanceOf(minter.address);
        assert.ok(bAMZNBal1.eq(aAMZNBal.add(syntheticAmount)));

        // ========================================================
        // ADD MORE SYNTHETIC
        // ========================================================
        const mintingNote = await synthetic.contracts(minter.address, doppleAMZN.address);

        actual = await synthetic.connect(minter).addSynthetic(doppleAMZN.address, mintingNote.canMintRemainning.div(2));
        const bRatio = (await synthetic.contracts(minter.address, doppleAMZN.address)).currentRatio;
        assert.ok(bRatio.lt(aRatio));

        const bSyntheticAmount = await doppleAMZN.balanceOf(minter.address);
        assert.ok(bSyntheticAmount.gt(syntheticAmount));
    });

    it('Can add synthetic for $dXAU', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dXAU');
        const doppleXAU = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleXAU.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('3200');
        const aDollyBal = await dolly.balanceOf(minter.address);
        const aXAUBal = await doppleXAU.balanceOf(minter.address);

        let allowance = await dolly.allowance(minter.address, synthetic.address);
        if (allowance.lte(dollyAmount)) {
            actual = await dolly.connect(minter).approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }

        actual = await synthetic.connect(minter).mintSynthetic(doppleXAU.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const aRatio = (await synthetic.contracts(minter.address, doppleXAU.address)).currentRatio;

        const bDollyBal1 = await dolly.balanceOf(minter.address);
        assert.ok(bDollyBal1.eq(aDollyBal.sub(dollyAmount)));

        const bXAUBal1 = await doppleXAU.balanceOf(minter.address);
        assert.ok(bXAUBal1.eq(aXAUBal.add(syntheticAmount)));

        // ========================================================
        // ADD MORE SYNTHETIC
        // ========================================================
        const mintingNote = await synthetic.contracts(minter.address, doppleXAU.address);

        actual = await synthetic.connect(minter).addSynthetic(doppleXAU.address, mintingNote.canMintRemainning.div(2));
        const bRatio = (await synthetic.contracts(minter.address, doppleXAU.address)).currentRatio;
        assert.ok(bRatio.lt(aRatio));

        const bSyntheticAmount = await doppleXAU.balanceOf(minter.address);
        assert.ok(bSyntheticAmount.gt(syntheticAmount));
    });

    it('Can remove minted synthetic for $dTSLA', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dTSLA');
        const doppleTSLA = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleTSLA.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const aDollyBal = await dolly.balanceOf(minter.address);
        const aTSLABal = await doppleTSLA.balanceOf(minter.address);

        let allowance = await dolly.allowance(minter.address, synthetic.address);
        if (allowance.lte(dollyAmount)) {
            actual = await dolly.connect(minter).approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }

        actual = await synthetic.connect(minter).mintSynthetic(doppleTSLA.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const aRatio = (await synthetic.contracts(minter.address, doppleTSLA.address)).currentRatio;
        const bDollyBal1 = await dolly.balanceOf(minter.address);
        assert.ok(bDollyBal1.eq(aDollyBal.sub(dollyAmount)));

        const bTSLABal1 = await doppleTSLA.balanceOf(minter.address);
        assert.ok(bTSLABal1.eq(aTSLABal.add(syntheticAmount)));

        // ========================================================
        // REMOVE MINTED SYNTHETIC
        // ========================================================
        const mintingNote = await synthetic.contracts(minter.address, doppleTSLA.address);
        allowance = await doppleTSLA.allowance(minter.address, synthetic.address);
        if (allowance.lte(mintingNote.assetAmount.div(2))) {
            actual = await doppleTSLA.connect(minter).approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }
        const aSyntheticAmount = await doppleTSLA.balanceOf(minter.address);
        actual = await synthetic.connect(minter).removeSynthetic(doppleTSLA.address, mintingNote.assetAmount.div(2));
        const bRatio = (await synthetic.contracts(minter.address, doppleTSLA.address)).currentRatio;
        assert.ok(bRatio.gt(aRatio));

        const bSyntheticAmount = await doppleTSLA.balanceOf(minter.address);
        assert.ok(bSyntheticAmount.lt(aSyntheticAmount));
    });

    it('Can remove minted synthetic for $dCOIN', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dCOIN');
        const doppleCOIN = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleCOIN.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const aDollyBal = await dolly.balanceOf(minter.address);
        const aCOINBal = await doppleCOIN.balanceOf(minter.address);

        let allowance = await dolly.allowance(minter.address, synthetic.address);
        if (allowance.lte(dollyAmount)) {
            actual = await dolly.connect(minter).approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }

        actual = await synthetic.connect(minter).mintSynthetic(doppleCOIN.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const aRatio = (await synthetic.contracts(minter.address, doppleCOIN.address)).currentRatio;

        const bDollyBal1 = await dolly.balanceOf(minter.address);
        assert.ok(bDollyBal1.eq(aDollyBal.sub(dollyAmount)));

        const bCOINBal1 = await doppleCOIN.balanceOf(minter.address);
        assert.ok(bCOINBal1.eq(aCOINBal.add(syntheticAmount)));

        // ========================================================
        // REMOVE MINTED SYNTHETIC
        // ========================================================
        const mintingNote = await synthetic.contracts(minter.address, doppleCOIN.address);
        allowance = await doppleCOIN.allowance(minter.address, synthetic.address);
        if (allowance.lte(mintingNote.assetAmount.div(2))) {
            actual = await doppleCOIN.connect(minter).approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }
        const aSyntheticAmount = await doppleCOIN.balanceOf(minter.address);
        actual = await synthetic.connect(minter).removeSynthetic(doppleCOIN.address, mintingNote.assetAmount.div(2));
        assert.ok(actual.hash);

        const bRatio = (await synthetic.contracts(minter.address, doppleCOIN.address)).currentRatio;
        assert.ok(bRatio.gt(aRatio));

        const bSyntheticAmount = await doppleCOIN.balanceOf(minter.address);
        assert.ok(bSyntheticAmount.lt(aSyntheticAmount));
    });

    it('Can remove minted synthetic for $dAAPL', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dAAPL');
        const doppleAAPL = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleAAPL.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const aDollyBal = await dolly.balanceOf(minter.address);
        const aAAPLBal = await doppleAAPL.balanceOf(minter.address);

        let allowance = await dolly.allowance(minter.address, synthetic.address);
        if (allowance.lte(dollyAmount)) {
            actual = await dolly.connect(minter).approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }

        actual = await synthetic.connect(minter).mintSynthetic(doppleAAPL.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const aRatio = (await synthetic.contracts(minter.address, doppleAAPL.address)).currentRatio;

        const bDollyBal1 = await dolly.balanceOf(minter.address);
        assert.ok(bDollyBal1.eq(aDollyBal.sub(dollyAmount)));

        const bAAPLBal1 = await doppleAAPL.balanceOf(minter.address);
        assert.ok(bAAPLBal1.eq(aAAPLBal.add(syntheticAmount)));

        // ========================================================
        // REMOVE MINTED SYNTHETIC
        // ========================================================
        const mintingNote = await synthetic.contracts(minter.address, doppleAAPL.address);
        allowance = await doppleAAPL.allowance(minter.address, synthetic.address);
        if (allowance.lte(mintingNote.assetAmount.div(2))) {
            actual = await doppleAAPL.connect(minter).approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }
        const aSyntheticAmount = await doppleAAPL.balanceOf(minter.address);
        actual = await synthetic.connect(minter).removeSynthetic(doppleAAPL.address, mintingNote.assetAmount.div(2));
        assert.ok(actual.hash);

        const bRatio = (await synthetic.contracts(minter.address, doppleAAPL.address)).currentRatio;
        assert.ok(bRatio.gt(aRatio));

        const bSyntheticAmount = await doppleAAPL.balanceOf(minter.address);
        assert.ok(bSyntheticAmount.lt(aSyntheticAmount));
    });

    it('Can remove minted synthetic for $dQQQ', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dQQQ');
        const doppleQQQ = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleQQQ.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const aDollyBal = await dolly.balanceOf(minter.address);
        const aQQQBal = await doppleQQQ.balanceOf(minter.address);

        let allowance = await dolly.allowance(minter.address, synthetic.address);
        if (allowance.lte(dollyAmount)) {
            actual = await dolly.connect(minter).approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }

        actual = await synthetic.connect(minter).mintSynthetic(doppleQQQ.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const aRatio = (await synthetic.contracts(minter.address, doppleQQQ.address)).currentRatio;

        const bDollyBal1 = await dolly.balanceOf(minter.address);
        assert.ok(bDollyBal1.eq(aDollyBal.sub(dollyAmount)));

        const bQQQBal1 = await doppleQQQ.balanceOf(minter.address);
        assert.ok(bQQQBal1.eq(aQQQBal.add(syntheticAmount)));

        // ========================================================
        // REMOVE MINTED SYNTHETIC
        // ========================================================
        const mintingNote = await synthetic.contracts(minter.address, doppleQQQ.address);
        allowance = await doppleQQQ.allowance(minter.address, synthetic.address);
        if (allowance.lte(mintingNote.assetAmount.div(2))) {
            actual = await doppleQQQ.connect(minter).approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }
        const aSyntheticAmount = await doppleQQQ.balanceOf(minter.address);
        actual = await synthetic.connect(minter).removeSynthetic(doppleQQQ.address, mintingNote.assetAmount.div(2));
        assert.ok(actual.hash);

        const bRatio = (await synthetic.contracts(minter.address, doppleQQQ.address)).currentRatio;
        assert.ok(bRatio.gt(aRatio));

        const bSyntheticAmount = await doppleQQQ.balanceOf(minter.address);
        assert.ok(bSyntheticAmount.lt(aSyntheticAmount));
    });

    it('Can remove minted synthetic for $dAMZN', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dAMZN');
        const doppleAMZN = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleAMZN.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('5200');
        const aDollyBal = await dolly.balanceOf(minter.address);
        const aAMZNBal = await doppleAMZN.balanceOf(minter.address);

        let allowance = await dolly.allowance(minter.address, synthetic.address);
        if (allowance.lte(dollyAmount)) {
            actual = await dolly.connect(minter).approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }

        actual = await synthetic.connect(minter).mintSynthetic(doppleAMZN.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const aRatio = (await synthetic.contracts(minter.address, doppleAMZN.address)).currentRatio;

        const bDollyBal1 = await dolly.balanceOf(minter.address);
        assert.ok(bDollyBal1.eq(aDollyBal.sub(dollyAmount)));

        const bAMZNBal1 = await doppleAMZN.balanceOf(minter.address);
        assert.ok(bAMZNBal1.eq(aAMZNBal.add(syntheticAmount)));

        // ========================================================
        // REMOVE MINTED SYNTHETIC
        // ========================================================
        const mintingNote = await synthetic.contracts(minter.address, doppleAMZN.address);
        allowance = await doppleAMZN.allowance(minter.address, synthetic.address);
        if (allowance.lte(mintingNote.assetAmount.div(2))) {
            actual = await doppleAMZN.connect(minter).approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }
        const aSyntheticAmount = await doppleAMZN.balanceOf(minter.address);
        actual = await synthetic.connect(minter).removeSynthetic(doppleAMZN.address, mintingNote.assetAmount.div(2));
        assert.ok(actual.hash);

        const bRatio = (await synthetic.contracts(minter.address, doppleAMZN.address)).currentRatio;
        assert.ok(bRatio.gt(aRatio));

        const bSyntheticAmount = await doppleAMZN.balanceOf(minter.address);
        assert.ok(bSyntheticAmount.lt(aSyntheticAmount));
    });

    it('Can remove minted synthetic for $dXAU', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dXAU');
        const doppleXAU = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleXAU.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('3200');
        const aDollyBal = await dolly.balanceOf(minter.address);
        const aXAUBal = await doppleXAU.balanceOf(minter.address);

        let allowance = await dolly.allowance(minter.address, synthetic.address);
        if (allowance.lte(dollyAmount)) {
            actual = await dolly.connect(minter).approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }

        actual = await synthetic.connect(minter).mintSynthetic(doppleXAU.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const aRatio = (await synthetic.contracts(minter.address, doppleXAU.address)).currentRatio;

        const bDollyBal1 = await dolly.balanceOf(minter.address);
        assert.ok(bDollyBal1.eq(aDollyBal.sub(dollyAmount)));

        const bXAUBal1 = await doppleXAU.balanceOf(minter.address);
        assert.ok(bXAUBal1.eq(aXAUBal.add(syntheticAmount)));

        // ========================================================
        // REMOVE MINTED SYNTHETIC
        // ========================================================
        const mintingNote = await synthetic.contracts(minter.address, doppleXAU.address);
        allowance = await doppleXAU.allowance(minter.address, synthetic.address);
        if (allowance.lte(mintingNote.assetAmount.div(2))) {
            actual = await doppleXAU.connect(minter).approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }
        const aSyntheticAmount = await doppleXAU.balanceOf(minter.address);
        actual = await synthetic.connect(minter).removeSynthetic(doppleXAU.address, mintingNote.assetAmount.div(2));
        assert.ok(actual.hash);

        const bRatio = (await synthetic.contracts(minter.address, doppleXAU.address)).currentRatio;
        assert.ok(bRatio.gt(aRatio));

        const bSyntheticAmount = await doppleXAU.balanceOf(minter.address);
        assert.ok(bSyntheticAmount.lt(aSyntheticAmount));
    });
});
