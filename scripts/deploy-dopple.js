const { ethers, network } = require("hardhat");

async function main() {

  console.log('Network name:', network.name);

  if (network.name === 'bscTestnet') {
    const DoppleToken = await ethers.getContractFactory("DoppleToken");
    const dopple = await DoppleToken.deploy('6895500', '7095500');
    await dopple.deployed();
    console.log("DoppleToken deployed to:", dopple.address);
  } else {
    console.error('please specify the network!');
    return;
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
