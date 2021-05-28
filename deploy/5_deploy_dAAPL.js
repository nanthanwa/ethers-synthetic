module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const synthetic = await ethers.getContract('Synthetic', deployer);
    const result = await deploy('DoppleAAPL', {
        from: deployer,
        args: [synthetic.address],
        log: true,
    });
    let tx;
    tx = await synthetic.setPairsToAddress('AAPL/USD', result.address);
    // console.log('setPairsToAddress: hash', tx.hash);
    tx = await synthetic.setAddressToPairs(result.address, 'AAPL/USD');
    // console.log('setAddressToPairs: hash', tx.hash);
    tx = await synthetic.setPairsToQuote('AAPL/USD', ['AAPL', 'USD']);
    // console.log('setPairsToQuote: hash', tx.hash);
};

module.exports.tags = ['DoppleAAPL'];