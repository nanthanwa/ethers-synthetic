module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const bandRef = '0xDA7a001b254CD22e46d3eAB04d937489c93174C3';
    const dolly = await ethers.getContract('Dolly', deployer);
    const result = await deploy('Synthetic', {
        from: deployer,
        args: [dolly.address, bandRef],
        log: true,
    });

    // console.log('verify Synthetic');
    // await run('verify:verify', {
    //     address: result.address,
    //     constructorArguments: [
    //         dolly.address,
    //         bandRef,
    //     ],
    // });
};

module.exports.tags = ['Synthetic'];