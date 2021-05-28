module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const synthetic = await ethers.getContract('Synthetic', deployer);
    const result = await deploy('DoppleQQQ', {
        from: deployer,
        args: [synthetic.address],
        log: true,
    });
    await synthetic.setPairsToAddress('QQQ/USD', result.address);
    await synthetic.setAddressToPairs(result.address, 'QQQ/USD');
    await synthetic.setPairsToQuote('QQQ/USD', ['QQQ', 'USD']);
};

module.exports.tags = ['DoppleQQQ'];