module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const synthetic = await ethers.getContract('Synthetic', deployer);
    await deploy('DoppleAMZN', {
        from: deployer,
        args: [synthetic.address],
        log: true,
    });
};

module.exports.tags = ['DoppleAMZN'];