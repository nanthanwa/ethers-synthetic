module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const DoppleSyntheticToken = await ethers.getContract('DoppleSyntheticToken', deployer);
    await deploy('DoppleSyntheticTokenFactory', {
        from: deployer,
        args: [DoppleSyntheticToken.address],
        log: true,
    });
    const Synthetic = await ethers.getContract('Synthetic');
    const doppleSyntheticTokenFactory = await ethers.getContract('DoppleSyntheticTokenFactory', deployer);

    const dTSLA = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic TSLA Token', 'dTSLA', Synthetic.address);
    console.log('dTSLA contract address', (await dTSLA.wait()).events[2].args[0]);
    const dCOIN = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic COIN Token', 'dCOIN', Synthetic.address);
    console.log('dCOIN contract address', (await dCOIN.wait()).events[2].args[0]);
    const dAAPL = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic AAPL Token', 'dAAPL', Synthetic.address);
    console.log('dAAPL contract address', (await dAAPL.wait()).events[2].args[0]);
    const dQQQ = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic QQQ Token', 'dQQQ', Synthetic.address);
    console.log('dQQQ contract address', (await dQQQ.wait()).events[2].args[0]);
    const dAMZN = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic AMZN Token', 'dAMZN', Synthetic.address);
    console.log('dAMZN contract address', (await dAMZN.wait()).events[2].args[0]);
    const dXAU = await doppleSyntheticTokenFactory.createSyntheticToken('Dopple Synthetic XAU Token', 'dXAU', Synthetic.address);
    console.log('dXAU contract address', (await dXAU.wait()).events[2].args[0]);

};

module.exports.tags = ['DoppleSyntheticTokenFactory', 'Factory'];
