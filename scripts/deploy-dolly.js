const { ethers, network } = require("hardhat");

async function main() {

  console.log('Network name:', network.name);

  if (network.name === 'bscTestnet') {
    const Dolly = await ethers.getContractFactory("Dolly");
    const dolly = await Dolly.deploy("Dolly Stable Coin", "DOLLY", "18");
    await dolly.deployed();
    console.log("Dolly deployed to:", dolly.address);
  } else if (network.name === 'hardhat') {
    const Dolly = await ethers.getContractFactory("Dolly");
    const dolly = await Dolly.deploy("Dolly Stable Coin", "DOLLY", "18");
    await dolly.deployed();
    console.log("Dolly deployed to:", dolly.address);
  } else if (network.name === 'kovan') {
    const Dolly = await ethers.getContractFactory("Dolly");
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
