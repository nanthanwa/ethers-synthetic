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
    console.log('clonedCount', await doppleSyntheticTokenFactory.clonedCount());

    let tx, contractAddress, assetName;
    tx = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic TSLA Token', 'dTSLA', synthetic.address);
    contractAddress = (await tx.wait()).events[2].args[0];
    assetName = (await tx.wait()).events[2].args[1].substr(1);
    console.log('contractAddress', contractAddress);
    console.log('assetName', assetName);

    console.log('setPairsToAddress', (await synthetic.setPairsToAddress(`${assetName}/USD`, contractAddress)).hash);
    console.log('setAddressToPairs', (await synthetic.setAddressToPairs(contractAddress, `${assetName}/USD`)).hash);
    console.log('setPairsToQuote', (await synthetic.setPairsToQuote(`${assetName}/USD`, [assetName, 'USD'])).hash);

    tx = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic COIN Token', 'dCOIN', synthetic.address);
    contractAddress = (await tx.wait()).events[2].args[0];
    assetName = (await tx.wait()).events[2].args[1].substr(1);
    console.log('contractAddress', contractAddress);
    console.log('assetName', assetName);

    console.log('setPairsToAddress', (await synthetic.setPairsToAddress(`${assetName}/USD`, contractAddress)).hash);
    console.log('setAddressToPairs', (await synthetic.setAddressToPairs(contractAddress, `${assetName}/USD`)).hash);
    console.log('setPairsToQuote', (await synthetic.setPairsToQuote(`${assetName}/USD`, [assetName, 'USD'])).hash);

    tx = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic AAPL Token', 'dAAPL', synthetic.address);
    contractAddress = (await tx.wait()).events[2].args[0];
    assetName = (await tx.wait()).events[2].args[1].substr(1);
    console.log('contractAddress', contractAddress);
    console.log('assetName', assetName);

    console.log('setPairsToAddress', (await synthetic.setPairsToAddress(`${assetName}/USD`, contractAddress)).hash);
    console.log('setAddressToPairs', (await synthetic.setAddressToPairs(contractAddress, `${assetName}/USD`)).hash);
    console.log('setPairsToQuote', (await synthetic.setPairsToQuote(`${assetName}/USD`, [assetName, 'USD'])).hash);

    tx = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic QQQ Token', 'dQQQ', synthetic.address);
    contractAddress = (await tx.wait()).events[2].args[0];
    assetName = (await tx.wait()).events[2].args[1].substr(1);
    console.log('contractAddress', contractAddress);
    console.log('assetName', assetName);

    console.log('setPairsToAddress', (await synthetic.setPairsToAddress(`${assetName}/USD`, contractAddress)).hash);
    console.log('setAddressToPairs', (await synthetic.setAddressToPairs(contractAddress, `${assetName}/USD`)).hash);
    console.log('setPairsToQuote', (await synthetic.setPairsToQuote(`${assetName}/USD`, [assetName, 'USD'])).hash);

    tx = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic AMZN Token', 'dAMZN', synthetic.address);
    contractAddress = (await tx.wait()).events[2].args[0];
    assetName = (await tx.wait()).events[2].args[1].substr(1);
    console.log('contractAddress', contractAddress);
    console.log('assetName', assetName);

    console.log('setPairsToAddress', (await synthetic.setPairsToAddress(`${assetName}/USD`, contractAddress)).hash);
    console.log('setAddressToPairs', (await synthetic.setAddressToPairs(contractAddress, `${assetName}/USD`)).hash);
    console.log('setPairsToQuote', (await synthetic.setPairsToQuote(`${assetName}/USD`, [assetName, 'USD'])).hash);

    tx = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic XAU Token', 'dXAU', synthetic.address);
    contractAddress = (await tx.wait()).events[2].args[0];
    assetName = (await tx.wait()).events[2].args[1].substr(1);
    console.log('contractAddress', contractAddress);
    console.log('assetName', assetName);

    console.log('setPairsToAddress', (await synthetic.setPairsToAddress(`${assetName}/USD`, contractAddress)).hash);
    console.log('setAddressToPairs', (await synthetic.setAddressToPairs(contractAddress, `${assetName}/USD`)).hash);
    console.log('setPairsToQuote', (await synthetic.setPairsToQuote(`${assetName}/USD`, [assetName, 'USD'])).hash);

    console.log('clonedCount', await doppleSyntheticTokenFactory.clonedCount());

};

module.exports.tags = ['DoppleSyntheticTokenFactory', 'Factory'];
