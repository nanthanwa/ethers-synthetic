module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const synthetic = await ethers.getContract('Synthetic', deployer);
    const result = await deploy('DoppleXAU', {
        from: deployer,
        args: [synthetic.address],
        log: true,
    });
    let tx;
    tx = await synthetic.setPairsToAddress('XAU/USD', result.address, { from: deployer });
    // console.log('setPairsToAddress: hash', tx.hash);
    tx = await synthetic.setAddressToPairs(result.address, 'XAU/USD', { from: deployer });
    // console.log('setAddressToPairs: hash', tx.hash);
    tx = await synthetic.setPairsToQuote('XAU/USD', ['XAU', 'USD'], { from: deployer });
    // console.log('setPairsToQuote: hash', tx.hash);
};

module.exports.tags = ['DoppleXAU'];