const { expect, assert } = require('chai');
const { deployments } = require('hardhat');
const { ethers } = require('hardhat');

describe('Add and remove collateral Testing', async () => {
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

    it('Can add collateral for $dTSLA', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dTSLA');
        const doppleTSLA = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleTSLA.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const addCollateralAmount = ethers.utils.parseEther('500');
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
        expect(bDollyBal1).to.eq(aDollyBal.sub(dollyAmount));

        const bTSLABal1 = await doppleTSLA.balanceOf(minter.address);
        assert.ok(bTSLABal1.eq(aTSLABal.add(syntheticAmount)));

        // ========================================================
        // ADD MORE COLLATERAL
        // ========================================================
        actual = await synthetic.connect(minter).addCollateral(doppleTSLA.address, addCollateralAmount);
        const bRatio = (await synthetic.contracts(minter.address, doppleTSLA.address)).currentRatio;
        expect(bRatio).to.gt(aRatio);

        const bDollyBal2 = await dolly.balanceOf(minter.address);
        expect(bDollyBal2).to.lt(bDollyBal1);
    });

    it('Can add collateral for $dCOIN', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dCOIN');
        const doppleCOIN = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleCOIN.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const addCollateralAmount = ethers.utils.parseEther('500');
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
        expect(bDollyBal1).to.eq(aDollyBal.sub(dollyAmount));

        const bCOINBal1 = await doppleCOIN.balanceOf(minter.address);
        expect(bCOINBal1).to.eq(aCOINBal.add(syntheticAmount));

        // ========================================================
        // ADD MORE COLLATERAL
        // ========================================================
        actual = await synthetic.connect(minter).addCollateral(doppleCOIN.address, addCollateralAmount);
        const bRatio = (await synthetic.contracts(minter.address, doppleCOIN.address)).currentRatio;
        expect(bRatio).to.gt(aRatio);

        const bDollyBal2 = await dolly.balanceOf(minter.address);
        expect(bDollyBal2).to.lt(bDollyBal1);
    });

    it('Can add collateral for $dAAPL', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dAAPL');
        const doppleAAPL = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleAAPL.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const addCollateralAmount = ethers.utils.parseEther('500');
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
        expect(bDollyBal1).to.eq(aDollyBal.sub(dollyAmount));

        const bAAPLBal1 = await doppleAAPL.balanceOf(minter.address);
        expect(bAAPLBal1).to.eq(aAAPLBal.add(syntheticAmount));

        // ========================================================
        // ADD MORE COLLATERAL
        // ========================================================
        actual = await synthetic.connect(minter).addCollateral(doppleAAPL.address, addCollateralAmount);
        const bRatio = (await synthetic.contracts(minter.address, doppleAAPL.address)).currentRatio;
        expect(bRatio).to.gt(aRatio);

        const bDollyBal2 = await dolly.balanceOf(minter.address);
        expect(bDollyBal2).to.lt(bDollyBal1);
    });

    it('Can add collateral for $dQQQ', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dQQQ');
        const doppleQQQ = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleQQQ.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const addCollateralAmount = ethers.utils.parseEther('500');
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
        expect(bDollyBal1).to.eq(aDollyBal.sub(dollyAmount));

        const bQQQBal1 = await doppleQQQ.balanceOf(minter.address);
        expect(bQQQBal1).to.eq(aQQQBal.add(syntheticAmount));

        // ========================================================
        // ADD MORE COLLATERAL
        // ========================================================
        actual = await synthetic.connect(minter).addCollateral(doppleQQQ.address, addCollateralAmount);
        const bRatio = (await synthetic.contracts(minter.address, doppleQQQ.address)).currentRatio;
        expect(bRatio).to.gt(aRatio);

        const bDollyBal2 = await dolly.balanceOf(minter.address);
        expect(bDollyBal2).to.lt(bDollyBal1);
    });

    it('Can add collateral for $dAMZN', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dAMZN');
        const doppleAMZN = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleAMZN.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('5200');
        const addCollateralAmount = ethers.utils.parseEther('500');
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
        expect(bDollyBal1).to.eq(aDollyBal.sub(dollyAmount));

        const bAMZNBal1 = await doppleAMZN.balanceOf(minter.address);
        expect(bAMZNBal1).to.eq(aAMZNBal.add(syntheticAmount));

        // ========================================================
        // ADD MORE COLLATERAL
        // ========================================================
        actual = await synthetic.connect(minter).addCollateral(doppleAMZN.address, addCollateralAmount);
        const bRatio = (await synthetic.contracts(minter.address, doppleAMZN.address)).currentRatio;
        expect(bRatio).to.gt(aRatio);

        const bDollyBal2 = await dolly.balanceOf(minter.address);
        expect(bDollyBal2).to.lt(bDollyBal1);
    });

    it('Can add collateral for $dXAU', async () => {
        // ========================================================
        // MINTING
        // ========================================================
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dXAU');
        const doppleXAU = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleXAU.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('3200');
        const addCollateralAmount = ethers.utils.parseEther('500');
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
        expect(bDollyBal1).to.eq(aDollyBal.sub(dollyAmount));

        const bXAUBal1 = await doppleXAU.balanceOf(minter.address);
        expect(bXAUBal1).to.eq(aXAUBal.add(syntheticAmount));

        // ========================================================
        // ADD MORE COLLATERAL
        // ========================================================
        actual = await synthetic.connect(minter).addCollateral(doppleXAU.address, addCollateralAmount);
        const bRatio = (await synthetic.contracts(minter.address, doppleXAU.address)).currentRatio;
        expect(bRatio).to.gt(aRatio);

        const bDollyBal2 = await dolly.balanceOf(minter.address);
        expect(bDollyBal2).to.lt(bDollyBal1);
    });

    it('Can remove collateral for $dTSLA', async () => {
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
        expect(bDollyBal1).to.eq(aDollyBal.sub(dollyAmount));

        const bTSLABal1 = await doppleTSLA.balanceOf(minter.address);
        expect(bTSLABal1).to.eq(aTSLABal.add(syntheticAmount));

        // ========================================================
        // REMOVE COLLATERAL
        // ========================================================
        const mintingNote = await synthetic.contracts(minter.address, doppleTSLA.address);
        actual = await synthetic.connect(minter).removeCollateral(doppleTSLA.address, mintingNote.canWithdrawRemainning.div(2));
        const bRatio = (await synthetic.contracts(minter.address, doppleTSLA.address)).currentRatio;
        expect(bRatio).to.lt(aRatio);

        const bDollyBal2 = await dolly.balanceOf(minter.address);
        expect(bDollyBal2).to.gt(bDollyBal1);
    });

    it('Can remove collateral for $dCOIN', async () => {
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
        expect(bDollyBal1).to.eq(aDollyBal.sub(dollyAmount));

        const bCOINBal1 = await doppleCOIN.balanceOf(minter.address);
        expect(bCOINBal1).to.eq(aCOINBal.add(syntheticAmount));

        // ========================================================
        // REMOVE COLLATERAL
        // ========================================================
        const mintingNote = await synthetic.contracts(minter.address, doppleCOIN.address);
        actual = await synthetic.connect(minter).removeCollateral(doppleCOIN.address, mintingNote.canWithdrawRemainning.div(2));
        const bRatio = (await synthetic.contracts(minter.address, doppleCOIN.address)).currentRatio;
        expect(bRatio).to.lt(aRatio);

        const bDollyBal2 = await dolly.balanceOf(minter.address);
        expect(bDollyBal2).to.gt(bDollyBal1);
    });

    it('Can remove collateral for $dAAPL', async () => {
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
        expect(bDollyBal1).to.eq(aDollyBal.sub(dollyAmount));

        const bAAPLBal1 = await doppleAAPL.balanceOf(minter.address);
        expect(bAAPLBal1).to.eq(aAAPLBal.add(syntheticAmount));

        // ========================================================
        // REMOVE COLLATERAL
        // ========================================================
        const mintingNote = await synthetic.contracts(minter.address, doppleAAPL.address);
        actual = await synthetic.connect(minter).removeCollateral(doppleAAPL.address, mintingNote.canWithdrawRemainning.div(2));
        const bRatio = (await synthetic.contracts(minter.address, doppleAAPL.address)).currentRatio;
        expect(bRatio).to.lt(aRatio);

        const bDollyBal2 = await dolly.balanceOf(minter.address);
        expect(bDollyBal2).to.gt(bDollyBal1);
    });

    it('Can remove collateral for $dQQQ', async () => {
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
        expect(bDollyBal1).to.eq(aDollyBal.sub(dollyAmount));

        const bQQQBal1 = await doppleQQQ.balanceOf(minter.address);
        expect(bQQQBal1).to.eq(aQQQBal.add(syntheticAmount));

        // ========================================================
        // REMOVE COLLATERAL
        // ========================================================
        const mintingNote = await synthetic.contracts(minter.address, doppleQQQ.address);
        actual = await synthetic.connect(minter).removeCollateral(doppleQQQ.address, mintingNote.canWithdrawRemainning.div(2));
        const bRatio = (await synthetic.contracts(minter.address, doppleQQQ.address)).currentRatio;
        expect(bRatio).to.lt(aRatio);

        const bDollyBal2 = await dolly.balanceOf(minter.address);
        expect(bDollyBal2).to.gt(bDollyBal1);
    });

    it('Can remove collateral for $dAMZN', async () => {
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
        expect(bDollyBal1).to.eq(aDollyBal.sub(dollyAmount));

        const bAMZNBal1 = await doppleAMZN.balanceOf(minter.address);
        expect(bAMZNBal1).to.eq(aAMZNBal.add(syntheticAmount));

        // ========================================================
        // REMOVE COLLATERAL
        // ========================================================
        const mintingNote = await synthetic.contracts(minter.address, doppleAMZN.address);
        actual = await synthetic.connect(minter).removeCollateral(doppleAMZN.address, mintingNote.canWithdrawRemainning.div(2));
        const bRatio = (await synthetic.contracts(minter.address, doppleAMZN.address)).currentRatio;
        expect(bRatio).to.lt(aRatio);

        const bDollyBal2 = await dolly.balanceOf(minter.address);
        expect(bDollyBal2).to.gt(bDollyBal1);
    });

    it('Can remove collateral for $dXAU', async () => {
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
        expect(bDollyBal1).to.eq(aDollyBal.sub(dollyAmount));

        const bXAUBal1 = await doppleXAU.balanceOf(minter.address);
        expect(bXAUBal1).to.eq(aXAUBal.add(syntheticAmount));

        // ========================================================
        // REMOVE COLLATERAL
        // ========================================================
        const mintingNote = await synthetic.contracts(minter.address, doppleXAU.address);
        actual = await synthetic.connect(minter).removeCollateral(doppleXAU.address, mintingNote.canWithdrawRemainning.div(2));
        const bRatio = (await synthetic.contracts(minter.address, doppleXAU.address)).currentRatio;
        expect(bRatio).to.lt(aRatio);

        const bDollyBal2 = await dolly.balanceOf(minter.address);
        expect(bDollyBal2).to.gt(bDollyBal1);
    });
});
