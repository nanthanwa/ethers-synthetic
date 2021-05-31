# Dopple Synthetic

## Installation
- `git clone https://github.com/nanmcpe/dopple-synthetic.git`
- `cd dopple-synthetic`
- `yarn install`

## Requirements
- Dolly address (to deploy, run `hh deploy --tags Dolly`)
- Synthetic asset address (to deploy, run `hh deploy --tags DoppleSyntheticTokenFactory`)
- Band oracle reference address [click here for more details](https://docs.bandchain.org/band-standard-dataset/supported-blockchains.html)
- Create `.secret` file and provide credential following

```
{
    "infuraProjectId": "",
    "alchemyProjectId": "",
    "privateKey": [
        DEPLOYER_PRIVATE_KEY,
        MINTER_PRIVATE_KEY,
        LIQUIDATOR_PRIVATE_KEY,
        DEVELOPER_PRIVATE_KEY
        ],
    "etherApiKey": "",
    "bscApiKey": ""
}

```

# Deployment
- Run `hh deploy`

# Runing the unit tests
- Run `hh test` (some tests are required "Kovan network forked" to get Oracle price).

## Features
- Can mint synthetic asset by provide 150% of collateral (adjustable). (e.g. provide $DOLLY -> receive $dTSLA)
- Can redeem (fully or partial) of synthetic asset to get collateral back. (e.g. repay $DOLLY -> burn $dTSLA)
- Can add more collateral by provide backed asset ($DOLLY) for extend liquidation ratio.
- Can remove some collateral whereas the collateral ratio still satisfy.
- Can liquidate open contract that hit the liquidation ratio.
- Liquidation fee will be transfered to dev address (optional).
- Can adjust some parameters e.g. `collateralRatio`, `liquidationRatio`, `liquidatorRewardRatio`, `platfromFeeRatio`, `remainingToMinterRatio`.

## TODO
- ✅ Add reentrancy guard.
- ✅ Use factory pattern for synthetic asset contracts. [From this issue](https://github.com/nanmcpe/dopple-synthetic/issues/2).
- ✅ Fix [this issue](https://github.com/nanmcpe/dopple-synthetic/issues/2).
- ✅ Add function `addSynthetic()` and `removeSynthetic()` corresponding of user's collateral ratio.
- ⏰ Add more unit test!!
- ⏰ Gathering and monitor liquidation of minted asset (for liquidate bot).
- ⏰ Make simple UI.
- ⏰ Use [Chainlink oracle](https://docs.chain.link/docs/binance-smart-chain-addresses) for standby (or combine) mode.

## Breakdown the deployments
1. Get deploayed `Dolly` instance 
2. Deploy `Synthetic` contract by giving `Dolly address` and `Band oracle reference`
3. Verify `Synthetic` contract
4. Get deploayed `Synthetic Token` instance 
5. call function `setPairsToAddress(string <Pairs>, address syntheticAsset)` to `Synthetic` contract.
6. call function `setAddressToPairs(address syntheticAsset, string <Pairs>)` to `Synthetic` contract.
7. call function `setPairsToQuote(string pairs, string[2] pairs)` to `Synthetic` contract. _TSLA/USD', ['TSLA', 'USD']_
8. call function `approve(address synthetic, uint256 amount)` to `Dolly` contract. _for minting purpose._
9. call function `approve(address synthetic, uint256 amount)` to `Synthetic Asset` contract. _for redeeming purpose (burned by synthetic contract)._
10. call function `setSyntheticAddress(address synthetic)` to `Synthetic Asset` contract. _for only Synthetic contract can mint synthetic asset._

## Deployed contract (Kovan Testnet)
- Dolly: [0x2a49FF95c52Abb5d0302Bd59877B7CF32134f4E8](https://kovan.etherscan.io/address/0x2a49FF95c52Abb5d0302Bd59877B7CF32134f4E8#code)
- Synthetic: [0x8cC72F02B4e0547a811b3c828E7d535C6B304Cf1](https://kovan.etherscan.io/address/0x8cC72F02B4e0547a811b3c828E7d535C6B304Cf1#code)
- DoppleSyntheticToken: [0xe973CBf1b49d1A6c0939291C77F6423FF2426d84](https://kovan.etherscan.io/address/0xe973CBf1b49d1A6c0939291C77F6423FF2426d84#code)
- DoppleSyntheticTokenFactory: [0xD2f944c3Cc22072565acB5cB2f7aA8212908003C](https://kovan.etherscan.io/address/0xD2f944c3Cc22072565acB5cB2f7aA8212908003C#code)
- dTSLA: [0x89996f43332693396693D6aDC76094487E9FD26C](https://kovan.etherscan.io/address/0x89996f43332693396693D6aDC76094487E9FD26C#code)
- dCOIN: [0xc7FCae6C7D442F0DAf1EB32b974d0a88Ef70d484](https://kovan.etherscan.io/address/0xc7FCae6C7D442F0DAf1EB32b974d0a88Ef70d484#code)
- dAAPL: [0xF21079fA8DE27bb19eEc08267Cec183784a6250E](https://kovan.etherscan.io/address/0xF21079fA8DE27bb19eEc08267Cec183784a6250E#code)
- dQQQ: [0x0f674993EA085ce9ba8746cCc713f2042801b834](https://kovan.etherscan.io/address/0x0f674993EA085ce9ba8746cCc713f2042801b834#code)
- dAMZN: [0xC65DB0723b409639b1F1031a6AD4879b0294c2e6](https://kovan.etherscan.io/address/0xC65DB0723b409639b1F1031a6AD4879b0294c2e6#code)
- dXAU: [0x755f7503E3BbFCCC1b8877fFeB8b00c25B3e5592](https://kovan.etherscan.io/address/0x755f7503E3BbFCCC1b8877fFeB8b00c25B3e5592#code)

## Miscellaneous
- Deployer: [0xad1F66Acea98733D63cd8FC522118e4014Cb3F79](https://kovan.etherscan.io/address/0xad1F66Acea98733D63cd8FC522118e4014Cb3F79)
- Minter: [0xa11cec4fF714C34775318544e97842344A9F3aDc](https://kovan.etherscan.io/address/0xa11cec4fF714C34775318544e97842344A9F3aDc)
- Liquidator: [0xb0b38D35775d93eC72928d2Cf9619fb3291aD8D6](https://kovan.etherscan.io/address/0xb0b38D35775d93eC72928d2Cf9619fb3291aD8D6)
- Developer: [0xca101e15B0A9b091624122eEa12FC981Fee77523](https://kovan.etherscan.io/address/0xca101e15B0A9b091624122eEa12FC981Fee77523)

## Diagrams
![](https://raw.githubusercontent.com/nanmcpe/dopple-synthetic/main/diagrams/Minting.png)
![](https://raw.githubusercontent.com/nanmcpe/dopple-synthetic/main/diagrams/Redeeming.png)
![](https://raw.githubusercontent.com/nanmcpe/dopple-synthetic/main/diagrams/Liquidating.png)
