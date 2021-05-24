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