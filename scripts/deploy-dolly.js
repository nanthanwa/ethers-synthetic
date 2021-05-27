const { ethers, network } = require("hardhat");

async function main() {

  console.log('Network name:', network.name);

  if (network.name === 'kovan') {
    const Dolly = await ethers.getContractFactory("Dolly.sol");
    const dolly = await Dolly.deploy("Dolly Stable Coin", "DOLLY", "18");
    await dolly.deployed();
    console.log("Dolly deployed to:", dolly.address);
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
