module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const DoppleSyntheticToken = await ethers.getContract('DoppleSyntheticToken', deployer);
    await deploy('DoppleSyntheticTokenFactory', {
        from: deployer,
        args: [DoppleSyntheticToken.address],
        log: true,
    });


};

module.exports.tags = ['DoppleSyntheticTokenFactory', 'Factory'];