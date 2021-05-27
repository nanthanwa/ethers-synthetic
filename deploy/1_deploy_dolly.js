module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    await deploy('contracts/Dolly.sol:Dolly', {
        from: deployer,
        args: ["Dolly Stable Coin", "DOLLY", "18"],
        log: true,
    });
};

module.exports.tags = ['Dolly'];