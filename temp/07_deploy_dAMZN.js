module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const synthetic = await ethers.getContract('Synthetic', deployer);
    const result = await deploy('DoppleAMZN', {
        from: deployer,
        args: [synthetic.address],
        log: true,
    });
    await synthetic.setPairsToAddress('AMZN/USD', result.address);
    await synthetic.setAddressToPairs(result.address, 'AMZN/USD');
    await synthetic.setPairsToQuote('AMZN/USD', ['AMZN', 'USD']);
};

module.exports.tags = ['DoppleAMZN', 'Token'];