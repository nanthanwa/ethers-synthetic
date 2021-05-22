require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('hardhat-spdx-license-identifier');
const { removeConsoleLog } = require('hardhat-preprocessor');
const fs = require('fs');
const { infuraProjectId, privateKey, privateKeyGanache, etherApiKey, bscApiKey } = JSON.parse(fs.readFileSync('.secret').toString().trim());

// const kovanProvider = new HDWalletProvider({
//   privateKeys: privateKey,
//   providerOrUrl: `https://kovan.infura.io/v3/${infuraProjectId}`
// });

// const kovanProvider = new HDWalletProvider({
//   privateKeys: privateKey,
//   providerOrUrl: `https://kovan.infura.io/v3/${infuraProjectId}`
// });

// const binanceProvider = new HDWalletProvider({
//   privateKeys: privateKey,
//   providerOrUrl: `https://data-seed-prebsc-1-s1.binance.org:8545`
// });

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

module.exports = {
  defaultNetwork: "bscTestnet",
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-kovan.alchemyapi.io/v2/kzTpbwIPy_KjG1bG0omquzJ6tKi5i0XB"
      }
    },
    kovan: {
      url: "https://eth-kovan.alchemyapi.io/v2/kzTpbwIPy_KjG1bG0omquzJ6tKi5i0XB",
      accounts: privateKey
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: privateKey
    }
  },
  solidity: {
    version: "0.6.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 20000
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: bscApiKey
  },
  spdxLicenseIdentifier: {
    overwrite: true,
    runOnCompile: true,
  },
  preprocess: {
    eachLine: removeConsoleLog((hre) => hre.network.name !== 'hardhat' && hre.network.name !== 'localhost'),
  },
};