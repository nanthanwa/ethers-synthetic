module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer, minter, liquidator } = await getNamedAccounts();
    console.log('deployer', deployer);
    await deploy('Dolly', {
        from: deployer,
        args: ['Dolly Stable Coin', 'DOLLY', '18'],
        log: true,
    });
    const dolly = await ethers.getContract('Dolly', deployer);
    const minterBalance = await dolly.balanceOf(minter);
    // console.log('minterBalance', minterBalance);
    if (minterBalance.eq(0)) {
        const dollyAmount = ethers.utils.parseEther('30000').toString();
        await dolly.transfer(minter, dollyAmount);
        await dolly.transfer(liquidator, dollyAmount);
    }
};

module.exports.tags = ['Dolly'];