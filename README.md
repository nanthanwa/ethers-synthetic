BSC Testnet
DoppleToken: 0x34213C239db7D8366537BdB562D99edF39f260cb
Dolly: 0x0a149b7b99B8C346948033c08734d53b7dA65f85
Oracle: 0x70c8414A73B74f4F3Ddc07162d4e28832F9Ae4Cb
verify dolly: hh verify 0x0a149b7b99B8C346948033c08734d53b7dA65f85 "Dolly Stable Coin" "DOLLY" "18" --network bscTestnet

BSC Mainnet
Oracle: 0x43222216f93B140EEC072c4baCB4017746017644

Kovan
PriceConsumerV3: 0xe14b76C21eB129Db30Db428A6f90d1dE313DBB4b
verify: hh verify 0xe14b76C21eB129Db30Db428A6f90d1dE313DBB4b --network kovan
Dolly: 0xA5c382182951f31A9f8bbfb35AF44d8C8333695E
verify dolly: hh verify 0xA5c382182951f31A9f8bbfb35AF44d8C8333695E "Dolly Stable Coin" "DOLLY" "18" --network kovan


hh run scripts/deploy-math-utils.js --network kovan
MathUtils: 0xeb0c9Ee2fb17c9aCE397eD097F5272769bBdA27c
hh verify 0xeb0c9Ee2fb17c9aCE397eD097F5272769bBdA27c --network kovan

hh run scripts/deploy-swap-utils.js --network kovan
SwapUtils: 0x5059094C47B7a7ee3009E8ef28ADA9c5fFE2E088
hh verify 0x5059094C47B7a7ee3009E8ef28ADA9c5fFE2E088 --network kovan

hh run scripts/deploy-swap.js --network kovan
Swap: 0x31e79b724DFc4133178e2b4660676D2676BB0204
hh verify 0x31e79b724DFc4133178e2b4660676D2676BB0204 --network kovan

hh run scripts/deploy-clones.js --network kovan
hh verify 0xfc8789fD909e840937c3eA75Aa17a740a5e8D75C --network kovan
https://kovan.etherscan.io/address/0xfc8789fD909e840937c3eA75Aa17a740a5e8D75C#code

BandOracle
hh run scripts/deploy-band-oracle.js --network kovan
hh verify 0x421F2f885Fbec45b0154a5483c8837497b12a747 0x9106f09bf08dfb23fca61a9829543f1c80a81a4b --network kovan

DoppleSyntheticToken
hh run scripts/deploy-dopple-synthetic-token.js --network kovan
Network name: kovan
DoppleTSLA deployed to: 0x34213C239db7D8366537BdB562D99edF39f260cb
hh verify --contract contracts/DoppleSyntheticToken.sol:DoppleTSLA 0x34213C239db7D8366537BdB562D99edF39f260cb 0x346d1d67889EeA17547c4Fc7B2a19586e82b6C9d  --network kovan
https://kovan.etherscan.io/address/0x34213C239db7D8366537BdB562D99edF39f260cb#code

DoppleCOIN deployed to: 0xEaD23317987E35FD23296842c09C78813F50d155
DoppleAAPL deployed to: 0x16D28449Da5AfEE7C8a68F05A89CBc2CeFF43f93
DoppleQQQ deployed to: 0xFB5494F2849d8871a06E56EC82cD4FdeA7947Db0
DoppleAMZN deployed to: 0x06bdEfAD45AE21906fB07b6B72612c7CB9D7a7c8
DoppleXAU deployed to: 0x2542792182Ad3C630068178a4E180fC7663E4b2b


hh verify --contract contracts/DoppleSyntheticToken.sol:DoppleCOIN 0xEaD23317987E35FD23296842c09C78813F50d155 --network kovan
hh verify --contract contracts/DoppleSyntheticToken.sol:DoppleAAPL 0x16D28449Da5AfEE7C8a68F05A89CBc2CeFF43f93 --network kovan
hh verify --contract contracts/DoppleSyntheticToken.sol:DoppleQQQ 0xFB5494F2849d8871a06E56EC82cD4FdeA7947Db0 --network kovan
hh verify --contract contracts/DoppleSyntheticToken.sol:DoppleAMZN 0x06bdEfAD45AE21906fB07b6B72612c7CB9D7a7c8 --network kovan
hh verify --contract contracts/DoppleSyntheticToken.sol:DoppleXAU 0x2542792182Ad3C630068178a4E180fC7663E4b2b --network kovan

Dolly
hh run scripts/deploy-dolly.js --network kovan
hh verify 0x172018C14eeA6312BF4243BFa3d07249feA7E542 "Dolly Stable Coin" "DOLLY" "18"  --network kovan

Synthetic
hh run scripts/deploy-synthetic.js --network kovan
Synthetic deployed to: 0x346d1d67889EeA17547c4Fc7B2a19586e82b6C9d
args: dolly, bandRef
hh verify 0x346d1d67889EeA17547c4Fc7B2a19586e82b6C9d "0x172018C14eeA6312BF4243BFa3d07249feA7E542" "0x9106f09bf08dfb23fca61a9829543f1c80a81a4b" --network kovan
https://kovan.etherscan.io/address/0x346d1d67889EeA17547c4Fc7B2a19586e82b6C9d#code



Step to deploy
- deploy Dolly
- deploy DoppleSyntheticAsset
- deploy Synthetic <Dolly> <BandOracleRef> <DoppleSyntheticAsset>
- set owner of DoppleSyntheticAsset to Synthetic
<!-- - set isSupport DoppleSyntheticAsset at Synthetic -->