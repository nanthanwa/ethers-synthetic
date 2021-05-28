module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const synthetic = await ethers.getContract('Synthetic', deployer);
    const result = await deploy('DoppleTSLA', {
        from: deployer,
        args: [synthetic.address],
        log: true,
    });
    let tx;
    tx = await synthetic.setPairsToAddress('TSLA/USD', result.address);
    // console.log('setPairsToAddress: hash', tx.hash);
    tx = await synthetic.setAddressToPairs(result.address, 'TSLA/USD');
    // console.log('setAddressToPairs: hash', tx.hash);
    tx = await synthetic.setPairsToQuote('TSLA/USD', ['TSLA', 'USD']);
    // console.log('setPairsToQuote: hash', tx.hash);
};

module.exports.tags = ['DoppleTSLA'];