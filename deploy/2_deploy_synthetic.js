module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const bandRef = '0xDA7a001b254CD22e46d3eAB04d937489c93174C3';
    const dolly = await ethers.getContract('contracts/Dolly.sol:Dolly', deployer);
    await deploy('Synthetic', {
        from: deployer,
        args: [dolly.address, bandRef],
        log: true,
    });
};

module.exports.tags = ['Synthetic'];