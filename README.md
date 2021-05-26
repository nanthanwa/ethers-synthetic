# Dopple Synthetic

## Installation
- `git clone https://github.com/nanmcpe/dopple-synthetic.git`
- `cd dopple-synthetic`
- `yarn install`

## Requirements
- Dolly address (to deploy, run `hh run scripts/deploy-dolly.js  --network kovan`)
- Synthetic asset address (to deploy, run `hh run scripts/deploy-dopple-synthetic-token.js  --network kovan`)
- Band oracle reference address [click here for more details](https://docs.bandchain.org/band-standard-dataset/supported-blockchains.html)
- Create `.secret` file and provide credential following

```
{
    "infuraProjectId": "",
    "privateKey": [
        "",
        "",
        "",
        ""
        ],
    "etherApiKey": "",
    "bscApiKey": ""
}

```

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
- ⏰ Add unit test!!
- ⏰ Gathering and monitor liquidation of minted asset (for liquidate bot).
- ⏰ Add function `mintMoreSynthetic()` and `redeemSomeSynthetic()` corresponding of user's collateral ratio.
- ⏰ Make simple UI.
- ⏰ Recheck over, underflow.
- ⏰ Use [Chainlink oracle](https://docs.chain.link/docs/binance-smart-chain-addresses) for standby (or combine) mode.

## Deployment
- Run `hh run scripts/deploy-initialized.js --network kovan`

## Step by step explanation
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
- Dolly: 0x172018C14eeA6312BF4243BFa3d07249feA7E542
- Band protocol: 0x9106f09bf08dfb23fca61a9829543f1c80a81a4b (bypass proxy)
- Synthetic: 0xAdde342E77525862Bf435fb85004Af9F40403BAe
- dTSLA: 0xdC47e2C0b6046cD58d3B21583DA19B45Ebf679ad (synthetic asset)
- dCOIN: 0x6B4Bf2BEa14A000445e9f0bd59883AE5d3398651 (synthetic asset)
- dAAPL: 0x93cb5A0806f8e682b03FCbA4633eEEd65c5a107E (synthetic asset)
- dQQQ: 0xf18b915D65E7139cc5F04FaF49ae2a3465eA5E04 (synthetic asset)
- dAMZN: 0xd305b6bC1Bb5E12EF7751B82a0342A12CbfaEc90 (synthetic asset)
- dXAU: 0x78126a97618c67694F553b8769a8591cA3114F41 (synthetic asset)

## Miscellaneous
- Deployer: 0xad1F66Acea98733D63cd8FC522118e4014Cb3F79

## Diagrams
![](https://raw.githubusercontent.com/nanmcpe/dopple-synthetic/main/diagrams/Minting.png)
![](https://raw.githubusercontent.com/nanmcpe/dopple-synthetic/main/diagrams/Redeeming.png)
![](https://raw.githubusercontent.com/nanmcpe/dopple-synthetic/main/diagrams/Liquidating.png)
