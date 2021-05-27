module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const synthetic = await ethers.getContract('Synthetic', deployer);
    const result = await deploy('DoppleCOIN', {
        from: deployer,
        args: [synthetic.address],
        log: true,
    });
    let tx;
    tx = await synthetic.setPairsToAddress('COIN/USD', result.address, { from: deployer });
    // console.log('setPairsToAddress: hash', tx.hash);
    tx = await synthetic.setAddressToPairs(result.address, 'COIN/USD', { from: deployer });
    // console.log('setAddressToPairs: hash', tx.hash);
    tx = await synthetic.setPairsToQuote('COIN/USD', ['COIN', 'USD'], { from: deployer });
    // console.log('setPairsToQuote: hash', tx.hash);
};

module.exports.tags = ['DoppleCOIN'];