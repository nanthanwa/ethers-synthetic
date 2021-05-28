const { network } = require('hardhat');
const fs = require('fs');

async function main() {

    console.log('Network name:', network.name);

    if (network.name === 'kovan') {
        const bandRef = '0xDA7a001b254CD22e46d3eAB04d937489c93174C3';
        const Dolly = JSON.parse(fs.readFileSync(`./deployments/${network.name}/Dolly.json`).toString().trim());
        await run('verify:verify', {
            address: Dolly.address,
            contract: 'contracts/Dolly.sol:Dolly',
            constructorArguments: ["Dolly Stable Coin", "DOLLY", "18"]
        });

        const Synthetic = JSON.parse(fs.readFileSync(`./deployments/${network.name}/Synthetic.json`).toString().trim());
        await run('verify:verify', {
            address: Synthetic.address,
            contract: 'contracts/Synthetic.sol:Synthetic',
            constructorArguments: [Dolly.address, bandRef],
        });

        const DoppleTSLA = JSON.parse(fs.readFileSync(`./deployments/${network.name}/DoppleTSLA.json`).toString().trim());
        await run('verify:verify', {
            address: DoppleTSLA.address,
            contract: 'contracts/DoppleSyntheticToken.sol:DoppleTSLA',
            constructorArguments: [Synthetic.address],
        });

        const DoppleCOIN = JSON.parse(fs.readFileSync(`./deployments/${network.name}/DoppleCOIN.json`).toString().trim());
        await run('verify:verify', {
            address: DoppleCOIN.address,
            contract: 'contracts/DoppleSyntheticToken.sol:DoppleCOIN',
            constructorArguments: [Synthetic.address],
        });

        const DoppleAAPL = JSON.parse(fs.readFileSync(`./deployments/${network.name}/DoppleAAPL.json`).toString().trim());
        await run('verify:verify', {
            address: DoppleAAPL.address,
            contract: 'contracts/DoppleSyntheticToken.sol:DoppleAAPL',
            constructorArguments: [Synthetic.address],
        });

        const DoppleQQQ = JSON.parse(fs.readFileSync(`./deployments/${network.name}/DoppleQQQ.json`).toString().trim());
        await run('verify:verify', {
            address: DoppleQQQ.address,
            contract: 'contracts/DoppleSyntheticToken.sol:DoppleQQQ',
            constructorArguments: [Synthetic.address],
        });

        const DoppleAMZN = JSON.parse(fs.readFileSync(`./deployments/${network.name}/DoppleAMZN.json`).toString().trim());
        await run('verify:verify', {
            address: DoppleAMZN.address,
            contract: 'contracts/DoppleSyntheticToken.sol:DoppleAMZN',
            constructorArguments: [Synthetic.address],
        });

        const DoppleXAU = JSON.parse(fs.readFileSync(`./deployments/${network.name}/DoppleXAU.json`).toString().trim());
        await run('verify:verify', {
            address: DoppleXAU.address,
            contract: 'contracts/DoppleSyntheticToken.sol:DoppleXAU',
            constructorArguments: [Synthetic.address],
        });
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });