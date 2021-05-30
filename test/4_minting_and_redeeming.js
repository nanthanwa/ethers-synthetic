const { expect, assert } = require('chai');
const { deployments } = require('hardhat');
const { ethers, getNamedAccounts } = require('hardhat');

describe('Minting and Redeeming Testing', async () => {
    let actual, synthetic, dolly, doppleSyntheticTokenFactory, networkName;
    let minter;
    before(async () => {
        networkName = (await ethers.provider.getNetwork()).name;
        console.log('network', networkName);
        if (networkName !== 'kovan') {
            await deployments.fixture(); // ensure you start from a fresh deployments
        }
        const namedAccounts = await getNamedAccounts();
        minter = namedAccounts.minter;
        synthetic = await ethers.getContract('Synthetic', minter);
        assert.ok(synthetic.address);
        dolly = await ethers.getContract('Dolly', minter);
        assert.ok(dolly.address);
        doppleSyntheticTokenFactory = await ethers.getContract('DoppleSyntheticTokenFactory', minter);
        assert.ok(doppleSyntheticTokenFactory.address);
    });

    it('Can mint $dTSLA', async () => {
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dTSLA');
        // console.log('contract address', contractAddress);
        const doppleTSLA = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleTSLA.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const aDollyBal = await dolly.balanceOf(minter);
        const aTSLABal = await doppleTSLA.balanceOf(minter);

        const allowance = await dolly.allowance(minter, synthetic.address);
        if (allowance.lte(dollyAmount)) {
            actual = await dolly.approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }
        actual = await synthetic.mintSynthetic(doppleTSLA.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bTSLABal = await doppleTSLA.balanceOf(minter);

        expect(bDollyBal).to.eq(aDollyBal.sub(dollyAmount));
        expect(bTSLABal).to.eq(aTSLABal.add(syntheticAmount));
    });

    it('Can mint $dCOIN', async () => {
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dCOIN');
        // console.log('contract address', contractAddress);
        const doppleCOIN = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleCOIN.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const aDollyBal = await dolly.balanceOf(minter);
        const aCOINBal = await doppleCOIN.balanceOf(minter);

        const allowance = await dolly.allowance(minter, synthetic.address);
        if (allowance.lte(dollyAmount)) {
            actual = await dolly.approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }

        actual = await synthetic.mintSynthetic(doppleCOIN.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bCOINBal = await doppleCOIN.balanceOf(minter);
        expect(bDollyBal).to.eq(aDollyBal.sub(dollyAmount));
        expect(bCOINBal).to.eq(aCOINBal.add(syntheticAmount));
    });

    it('Can mint $dAAPL', async () => {
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dAAPL');
        // console.log('contract address', contractAddress);
        const doppleAAPL = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleAAPL.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const aDollyBal = await dolly.balanceOf(minter);
        const aAAPLBal = await doppleAAPL.balanceOf(minter);

        const allowance = await dolly.allowance(minter, synthetic.address);
        if (allowance.lte(dollyAmount)) {
            actual = await dolly.approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }

        actual = await synthetic.mintSynthetic(doppleAAPL.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bAAPLBal = await doppleAAPL.balanceOf(minter);
        expect(bDollyBal).to.eq(aDollyBal.sub(dollyAmount));
        expect(bAAPLBal).to.eq(aAAPLBal.add(syntheticAmount));
    });

    it('Can mint $dQQQ', async () => {
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dQQQ');
        // console.log('contract address', contractAddress);
        const doppleQQQ = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleQQQ.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('1000');
        const aDollyBal = await dolly.balanceOf(minter);
        const aQQQBal = await doppleQQQ.balanceOf(minter);

        const allowance = await dolly.allowance(minter, synthetic.address);
        if (allowance.lte(dollyAmount)) {
            actual = await dolly.approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }

        actual = await synthetic.mintSynthetic(doppleQQQ.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bQQQBal = await doppleQQQ.balanceOf(minter);
        expect(bDollyBal).to.eq(aDollyBal.sub(dollyAmount));
        expect(bQQQBal).to.eq(aQQQBal.add(syntheticAmount));
    });

    // 3288.069999999
    // @notice do not foget to give 150% of collateral
    it('Can mint $dAMZN', async () => {
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dAMZN');
        // console.log('contract address', contractAddress);
        const doppleAMZN = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleAMZN.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('5200');
        const aDollyBal = await dolly.balanceOf(minter);
        const aAMZNBal = await doppleAMZN.balanceOf(minter);

        const allowance = await dolly.allowance(minter, synthetic.address);
        if (allowance.lte(dollyAmount)) {
            actual = await dolly.approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }

        actual = await synthetic.mintSynthetic(doppleAMZN.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bAMZNBal = await doppleAMZN.balanceOf(minter);
        expect(bDollyBal).to.eq(aDollyBal.sub(dollyAmount));
        expect(bAMZNBal).to.eq(aAMZNBal.add(syntheticAmount));
    });

    // 1889.019475
    it('Can mint $dXAU', async () => {
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dXAU');
        // console.log('contract address', contractAddress);
        const doppleXAU = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleXAU.address);

        const syntheticAmount = ethers.utils.parseEther('1');
        const dollyAmount = ethers.utils.parseEther('3200');
        const aDollyBal = await dolly.balanceOf(minter);
        const aXAUBal = await doppleXAU.balanceOf(minter);

        const allowance = await dolly.allowance(minter, synthetic.address);
        if (allowance.lte(dollyAmount)) {
            actual = await dolly.approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }

        actual = await synthetic.mintSynthetic(doppleXAU.address, syntheticAmount, dollyAmount);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bXAUBal = await doppleXAU.balanceOf(minter);
        expect(bDollyBal).to.eq(aDollyBal.sub(dollyAmount));
        expect(bXAUBal).to.eq(aXAUBal.add(syntheticAmount));
    });

    it('Can fully redeem $dTSLA', async () => {
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dTSLA');
        // console.log('contract address', contractAddress);
        const doppleTSLA = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleTSLA.address);

        const aDollyBal = await dolly.balanceOf(minter);
        const aTSLABal = await doppleTSLA.balanceOf(minter);

        const allowance = await doppleTSLA.allowance(minter, synthetic.address);
        if (allowance.lte(aTSLABal)) {
            actual = await doppleTSLA.approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }

        actual = await synthetic.redeemSynthetic(doppleTSLA.address, aTSLABal);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bTSLABal = await doppleTSLA.balanceOf(minter);

        expect(bDollyBal).to.gt(aDollyBal);
        expect(bTSLABal).to.lt(aTSLABal);
    });

    it('Can fully redeem $dCOIN', async () => {
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dCOIN');
        // console.log('contract address', contractAddress);
        const doppleCOIN = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleCOIN.address);

        const aDollyBal = await dolly.balanceOf(minter);
        const aCOINBal = await doppleCOIN.balanceOf(minter);

        const allowance = await doppleCOIN.allowance(minter, synthetic.address);
        if (allowance.lte(aCOINBal)) {
            actual = await doppleCOIN.approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }

        actual = await synthetic.redeemSynthetic(doppleCOIN.address, aCOINBal);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bCOINBal = await doppleCOIN.balanceOf(minter);

        expect(bDollyBal).to.gt(aDollyBal);
        expect(bCOINBal).to.lt(aCOINBal);
    });

    it('Can fully redeem $dAAPL', async () => {
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dAAPL');
        // console.log('contract address', contractAddress);
        const doppleAAPL = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleAAPL.address);

        const aDollyBal = await dolly.balanceOf(minter);
        const aAAPLBal = await doppleAAPL.balanceOf(minter);

        const allowance = await doppleAAPL.allowance(minter, synthetic.address);
        if (allowance.lte(aAAPLBal)) {
            actual = await doppleAAPL.approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }

        actual = await synthetic.redeemSynthetic(doppleAAPL.address, aAAPLBal);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bAAPLBal = await doppleAAPL.balanceOf(minter);

        expect(bDollyBal).to.gt(aDollyBal);
        expect(bAAPLBal).to.lt(aAAPLBal);
    });

    it('Can fully redeem $dQQQ', async () => {
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dQQQ');
        // console.log('contract address', contractAddress);
        const doppleQQQ = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleQQQ.address);

        const aDollyBal = await dolly.balanceOf(minter);
        const aQQQBal = await doppleQQQ.balanceOf(minter);

        const allowance = await doppleQQQ.allowance(minter, synthetic.address);
        if (allowance.lte(aQQQBal)) {
            actual = await doppleQQQ.approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }

        actual = await synthetic.redeemSynthetic(doppleQQQ.address, aQQQBal);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bQQQBal = await doppleQQQ.balanceOf(minter);

        expect(bDollyBal).to.gt(aDollyBal);
        expect(bQQQBal).to.lt(aQQQBal);
    });

    it('Can fully redeem $dAMZN', async () => {
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dAMZN');
        // console.log('contract address', contractAddress);
        const doppleAMZN = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleAMZN.address);

        const aDollyBal = await dolly.balanceOf(minter);
        const aAMZNBal = await doppleAMZN.balanceOf(minter);

        const allowance = await doppleAMZN.allowance(minter, synthetic.address);
        if (allowance.lte(aAMZNBal)) {
            actual = await doppleAMZN.approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }

        actual = await synthetic.redeemSynthetic(doppleAMZN.address, aAMZNBal);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bAMZNBal = await doppleAMZN.balanceOf(minter);

        expect(bDollyBal).to.gt(aDollyBal);
        expect(bAMZNBal).to.lt(aAMZNBal);
    });

    it('Can fully redeem $dXAU', async () => {
        const contractAddress = await doppleSyntheticTokenFactory.cloned('dXAU');
        // console.log('contract address', contractAddress);
        const doppleXAU = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, minter);
        assert.ok(doppleXAU.address);

        const aDollyBal = await dolly.balanceOf(minter);
        const aXAUBal = await doppleXAU.balanceOf(minter);

        const allowance = await doppleXAU.allowance(minter, synthetic.address);
        if (allowance.lte(aXAUBal)) {
            actual = await doppleXAU.approve(synthetic.address, ethers.constants.MaxUint256);
            assert.ok(actual.hash);
        }

        actual = await synthetic.redeemSynthetic(doppleXAU.address, aXAUBal);
        assert.ok(actual.hash);

        const bDollyBal = await dolly.balanceOf(minter);
        const bXAUBal = await doppleXAU.balanceOf(minter);

        expect(bDollyBal).to.gt(aDollyBal);
        expect(bXAUBal).to.lt(aXAUBal);
    });
});
