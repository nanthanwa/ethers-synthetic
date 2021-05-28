module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer, developer } = await getNamedAccounts();
    const bandRef = '0xDA7a001b254CD22e46d3eAB04d937489c93174C3';
    const dolly = await ethers.getContract('Dolly');
    await deploy('Synthetic', {
        from: deployer,
        args: [dolly.address, bandRef],
        log: true,
    });
    const synthetic = await ethers.getContract('Synthetic');
    await synthetic.setDevAddress(developer);
};

module.exports.tags = ['Synthetic'];