const { ethers, network } = require("hardhat");

async function main() {

  console.log('Network name:', network.name);

  if (network.name === 'hardhat') {
    const Oracle = await ethers.getContractFactory("Oracle");
    const oracle = await Oracle.deploy("0xDA7a001b254CD22e46d3eAB04d937489c93174C3");
    await oracle.deployed();
    console.log("Oracle deployed to:", oracle.address);
  } else if (network.name === 'bscTestnet') {
    const Oracle = await ethers.getContractFactory("Oracle");
    const oracle = await Oracle.deploy("0xDA7a001b254CD22e46d3eAB04d937489c93174C3"); // same as Kovan
    await oracle.deployed();
    console.log("Oracle deployed to:", oracle.address);

  } else if (network.name === 'kovan') {
    const Oracle = await ethers.getContractFactory("Oracle");
    const oracle = await Oracle.deploy("0xDA7a001b254CD22e46d3eAB04d937489c93174C3");
    await oracle.deployed();
    console.log("Oracle deployed to:", oracle.address);
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
