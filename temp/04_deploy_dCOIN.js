module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const synthetic = await ethers.getContract('Synthetic', deployer);
    const result = await deploy('DoppleCOIN', {
        from: deployer,
        args: [synthetic.address],
        log: true,
    });
    await synthetic.setPairsToAddress('COIN/USD', result.address);
    await synthetic.setAddressToPairs(result.address, 'COIN/USD');
    await synthetic.setPairsToQuote('COIN/USD', ['COIN', 'USD']);
};

module.exports.tags = ['DoppleCOIN', 'Token'];