module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const synthetic = await ethers.getContract('Synthetic', deployer);
    const result = await deploy('DoppleXAU', {
        from: deployer,
        args: [synthetic.address],
        log: true,
    });
    await synthetic.setPairsToAddress('XAU/USD', result.address);
    await synthetic.setAddressToPairs(result.address, 'XAU/USD');
    await synthetic.setPairsToQuote('XAU/USD', ['XAU', 'USD']);
};

module.exports.tags = ['DoppleXAU', 'Token'];