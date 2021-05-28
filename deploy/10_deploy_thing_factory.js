module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const Thing = await ethers.getContract('Thing', deployer);
    await deploy('ThingFactory', {
        from: deployer,
        args: [Thing.address],
        log: true,
    });
};

module.exports.tags = ['ThingFactory', 'Factory'];