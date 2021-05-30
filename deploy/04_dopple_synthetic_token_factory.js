module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const DoppleSyntheticToken = await ethers.getContract('DoppleSyntheticToken', deployer);
    await deploy('DoppleSyntheticTokenFactory', {
        from: deployer,
        args: [DoppleSyntheticToken.address],
        log: true,
    });
    const synthetic = await ethers.getContract('Synthetic');
    const doppleSyntheticTokenFactory = await ethers.getContract('DoppleSyntheticTokenFactory', deployer);
    const clonedCount = await doppleSyntheticTokenFactory.clonedCount();
    console.log('clonedCount', clonedCount);

    if (clonedCount === 0) {
        let tx, contractAddress, assetName;
        tx = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic TSLA Token', 'dTSLA', deployer, synthetic.address);
        contractAddress = (await tx.wait()).events[2].args[0];
        assetName = (await tx.wait()).events[2].args[1].substr(1);
        console.log(`${assetName} contractAddress`, contractAddress);

        console.log('setPairsToAddress', (await synthetic.setPairsToAddress(`${assetName}/USD`, contractAddress)).hash);
        console.log('setAddressToPairs', (await synthetic.setAddressToPairs(contractAddress, `${assetName}/USD`)).hash);
        console.log('setPairsToQuote', (await synthetic.setPairsToQuote(`${assetName}/USD`, [assetName, 'USD'])).hash);

        tx = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic COIN Token', 'dCOIN', deployer, synthetic.address);
        contractAddress = (await tx.wait()).events[2].args[0];
        assetName = (await tx.wait()).events[2].args[1].substr(1);
        console.log(`${assetName} contractAddress`, contractAddress);

        console.log('setPairsToAddress', (await synthetic.setPairsToAddress(`${assetName}/USD`, contractAddress)).hash);
        console.log('setAddressToPairs', (await synthetic.setAddressToPairs(contractAddress, `${assetName}/USD`)).hash);
        console.log('setPairsToQuote', (await synthetic.setPairsToQuote(`${assetName}/USD`, [assetName, 'USD'])).hash);

        tx = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic AAPL Token', 'dAAPL', deployer, synthetic.address);
        contractAddress = (await tx.wait()).events[2].args[0];
        assetName = (await tx.wait()).events[2].args[1].substr(1);
        console.log(`${assetName} contractAddress`, contractAddress);

        console.log('setPairsToAddress', (await synthetic.setPairsToAddress(`${assetName}/USD`, contractAddress)).hash);
        console.log('setAddressToPairs', (await synthetic.setAddressToPairs(contractAddress, `${assetName}/USD`)).hash);
        console.log('setPairsToQuote', (await synthetic.setPairsToQuote(`${assetName}/USD`, [assetName, 'USD'])).hash);

        tx = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic QQQ Token', 'dQQQ', deployer, synthetic.address);
        contractAddress = (await tx.wait()).events[2].args[0];
        assetName = (await tx.wait()).events[2].args[1].substr(1);
        console.log(`${assetName} contractAddress`, contractAddress);

        console.log('setPairsToAddress', (await synthetic.setPairsToAddress(`${assetName}/USD`, contractAddress)).hash);
        console.log('setAddressToPairs', (await synthetic.setAddressToPairs(contractAddress, `${assetName}/USD`)).hash);
        console.log('setPairsToQuote', (await synthetic.setPairsToQuote(`${assetName}/USD`, [assetName, 'USD'])).hash);

        tx = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic AMZN Token', 'dAMZN', deployer, synthetic.address);
        contractAddress = (await tx.wait()).events[2].args[0];
        assetName = (await tx.wait()).events[2].args[1].substr(1);
        console.log(`${assetName} contractAddress`, contractAddress);

        console.log('setPairsToAddress', (await synthetic.setPairsToAddress(`${assetName}/USD`, contractAddress)).hash);
        console.log('setAddressToPairs', (await synthetic.setAddressToPairs(contractAddress, `${assetName}/USD`)).hash);
        console.log('setPairsToQuote', (await synthetic.setPairsToQuote(`${assetName}/USD`, [assetName, 'USD'])).hash);

        tx = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic XAU Token', 'dXAU', deployer, synthetic.address);
        contractAddress = (await tx.wait()).events[2].args[0];
        assetName = (await tx.wait()).events[2].args[1].substr(1);
        console.log(`${assetName} contractAddress`, contractAddress);

        console.log('setPairsToAddress', (await synthetic.setPairsToAddress(`${assetName}/USD`, contractAddress)).hash);
        console.log('setAddressToPairs', (await synthetic.setAddressToPairs(contractAddress, `${assetName}/USD`)).hash);
        console.log('setPairsToQuote', (await synthetic.setPairsToQuote(`${assetName}/USD`, [assetName, 'USD'])).hash);
    } else {
        let contractAddress, assetName, oldSyntheticContract;
        contractAddress = await doppleSyntheticTokenFactory.cloned('dTSLA');
        assetName = 'TSLA';
        const doppleTSLA = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, deployer);
        oldSyntheticContract = await doppleTSLA.synthetic();
        if (oldSyntheticContract !== synthetic.address) {
            console.log(`TSLA: Synthetic contract did not match, setting to ${synthetic.address}`);
            await doppleTSLA.setSyntheticAddress(synthetic.address);
            console.log('setPairsToAddress', (await synthetic.setPairsToAddress(`${assetName}/USD`, contractAddress)).hash);
            console.log('setAddressToPairs', (await synthetic.setAddressToPairs(contractAddress, `${assetName}/USD`)).hash);
            console.log('setPairsToQuote', (await synthetic.setPairsToQuote(`${assetName}/USD`, [assetName, 'USD'])).hash);
        }

        contractAddress = await doppleSyntheticTokenFactory.cloned('dCOIN');
        assetName = 'COIN';
        const doppleCOIN = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, deployer);
        oldSyntheticContract = await doppleCOIN.synthetic();
        if (oldSyntheticContract !== synthetic.address) {
            console.log(`COIN: Synthetic contract did not match, setting to ${synthetic.address}`);
            await doppleCOIN.setSyntheticAddress(synthetic.address);
            console.log('setPairsToAddress', (await synthetic.setPairsToAddress(`${assetName}/USD`, contractAddress)).hash);
            console.log('setAddressToPairs', (await synthetic.setAddressToPairs(contractAddress, `${assetName}/USD`)).hash);
            console.log('setPairsToQuote', (await synthetic.setPairsToQuote(`${assetName}/USD`, [assetName, 'USD'])).hash);
        }

        contractAddress = await doppleSyntheticTokenFactory.cloned('dAAPL');
        assetName = 'AAPL';
        const doppleAAPL = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, deployer);
        oldSyntheticContract = await doppleAAPL.synthetic();
        if (oldSyntheticContract !== synthetic.address) {
            console.log(`AAPL: Synthetic contract did not match, setting to ${synthetic.address}`);
            await doppleAAPL.setSyntheticAddress(synthetic.address);
            console.log('setPairsToAddress', (await synthetic.setPairsToAddress(`${assetName}/USD`, contractAddress)).hash);
            console.log('setAddressToPairs', (await synthetic.setAddressToPairs(contractAddress, `${assetName}/USD`)).hash);
            console.log('setPairsToQuote', (await synthetic.setPairsToQuote(`${assetName}/USD`, [assetName, 'USD'])).hash);
        }

        contractAddress = await doppleSyntheticTokenFactory.cloned('dQQQ');
        assetName = 'QQQ';
        const doppleQQQ = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, deployer);
        oldSyntheticContract = await doppleQQQ.synthetic();
        if (oldSyntheticContract !== synthetic.address) {
            console.log(`QQQ: Synthetic contract did not match, setting to ${synthetic.address}`);
            await doppleQQQ.setSyntheticAddress(synthetic.address);
            console.log('setPairsToAddress', (await synthetic.setPairsToAddress(`${assetName}/USD`, contractAddress)).hash);
            console.log('setAddressToPairs', (await synthetic.setAddressToPairs(contractAddress, `${assetName}/USD`)).hash);
            console.log('setPairsToQuote', (await synthetic.setPairsToQuote(`${assetName}/USD`, [assetName, 'USD'])).hash);
        }

        contractAddress = await doppleSyntheticTokenFactory.cloned('dAMZN');
        assetName = 'AMZN';
        const doppleAMZN = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, deployer);
        oldSyntheticContract = await doppleAMZN.synthetic();
        if (oldSyntheticContract !== synthetic.address) {
            console.log(`AMZN: Synthetic contract did not match, setting to ${synthetic.address}`);
            await doppleAMZN.setSyntheticAddress(synthetic.address);
            console.log('setPairsToAddress', (await synthetic.setPairsToAddress(`${assetName}/USD`, contractAddress)).hash);
            console.log('setAddressToPairs', (await synthetic.setAddressToPairs(contractAddress, `${assetName}/USD`)).hash);
            console.log('setPairsToQuote', (await synthetic.setPairsToQuote(`${assetName}/USD`, [assetName, 'USD'])).hash);
        }

        contractAddress = await doppleSyntheticTokenFactory.cloned('dXAU');
        assetName = 'XAU';
        const doppleXAU = await ethers.getContractAt('DoppleSyntheticToken', contractAddress, deployer);
        oldSyntheticContract = await doppleXAU.synthetic();
        if (oldSyntheticContract !== synthetic.address) {
            console.log(`XAU: Synthetic contract did not match, setting to ${synthetic.address}`);
            await doppleXAU.setSyntheticAddress(synthetic.address);
            console.log('setPairsToAddress', (await synthetic.setPairsToAddress(`${assetName}/USD`, contractAddress)).hash);
            console.log('setAddressToPairs', (await synthetic.setAddressToPairs(contractAddress, `${assetName}/USD`)).hash);
            console.log('setPairsToQuote', (await synthetic.setPairsToQuote(`${assetName}/USD`, [assetName, 'USD'])).hash);
        }
    }
    console.log('All contracts ready to use!');
};

module.exports.tags = ['DoppleSyntheticTokenFactory', 'Factory'];
