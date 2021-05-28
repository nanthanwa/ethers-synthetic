module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer, minter, liquidator } = await getNamedAccounts();
    await deploy('Dolly', {
        from: deployer,
        args: ["Dolly Stable Coin", "DOLLY", "18"],
        log: true,
    });
    // const dolly = await ethers.getContract('Dolly', deployer);
    // const dollyAmount = ethers.utils.parseEther('30000').toString();
    // await dolly.transfer(minter, dollyAmount);
    // await dolly.transfer(liquidator, dollyAmount);
};

module.exports.tags = ['Dolly'];