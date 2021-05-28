module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const synthetic = await ethers.getContract('Synthetic', deployer);
    const result = await deploy('DoppleAAPL', {
        from: deployer,
        args: [synthetic.address],
        log: true,
    });
    await synthetic.setPairsToAddress('AAPL/USD', result.address);
    await synthetic.setAddressToPairs(result.address, 'AAPL/USD');
    await synthetic.setPairsToQuote('AAPL/USD', ['AAPL', 'USD']);
};

module.exports.tags = ['DoppleAAPL'];