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

    const dTSLA = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic TSLA Token', 'dTSLA', synthetic.address);
    const dTSLAAddress = (await dTSLA.wait()).events[2].args[0];
    const dTSLAName = (await dTSLA.wait()).events[2].args[1].substr(1);
    console.log('dTSLA contract address', dTSLAAddress);
    console.log('dTSLA dTSLAName', dTSLAName);

    console.log('setPairsToAddress', (await synthetic.setPairsToAddress(`${dTSLAName}/USD`, dTSLAAddress)).hash);
    console.log('setAddressToPairs', (await synthetic.setAddressToPairs(dTSLAAddress, `${dTSLAName}/USD`)).hash);
    console.log('setPairsToQuote', (await synthetic.setPairsToQuote(`${dTSLAName}/USD`, [dTSLAName, 'USD'])).hash);


    // const dCOIN = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic COIN Token', 'dCOIN', synthetic.address);
    // console.log('dCOIN contract address', (await dCOIN.wait()).events[2].args[0]);
    // const dAAPL = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic AAPL Token', 'dAAPL', synthetic.address);
    // console.log('dAAPL contract address', (await dAAPL.wait()).events[2].args[0]);
    // const dQQQ = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic QQQ Token', 'dQQQ', synthetic.address);
    // console.log('dQQQ contract address', (await dQQQ.wait()).events[2].args[0]);
    // const dAMZN = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic AMZN Token', 'dAMZN', synthetic.address);
    // console.log('dAMZN contract address', (await dAMZN.wait()).events[2].args[0]);
    // const dXAU = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic XAU Token', 'dXAU', synthetic.address);
    // console.log('dXAU contract address', (await dXAU.wait()).events[2].args[0]);

};

module.exports.tags = ['DoppleSyntheticTokenFactory', 'Factory'];
