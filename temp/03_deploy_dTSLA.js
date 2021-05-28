module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const synthetic = await ethers.getContract('Synthetic', deployer);
    const result = await deploy('DoppleTSLA', {
        from: deployer,
        args: [synthetic.address],
        log: true,
    });
    await synthetic.setPairsToAddress('TSLA/USD', result.address);
    await synthetic.setAddressToPairs(result.address, 'TSLA/USD');
    await synthetic.setPairsToQuote('TSLA/USD', ['TSLA', 'USD']);
};

module.exports.tags = ['DoppleTSLA', 'Token'];