import Web3 from "web3";

import BasicERC20 from "./contracts/BasicERC20.json";
import USDC from "./contracts/USDC.json";
import TUSD from "./contracts/TUSD.json";
import PAX from "./contracts/PAX.json";
import Reserve from "./contracts/Reserve.json";
import Manager from "./contracts/Manager.json";


var web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');
var drizzleOptions;

if (web3.givenProvider) { 
  console.log(web3.givenProvider.networkVersion);
}

if (web3.givenProvider && web3.givenProvider.networkVersion === "1") {
  console.log('live');
  console.log(web3);
  drizzleOptions = {
    web3: {
      block: false,
      customProvider: web3,
    },
    contracts: [
      {
        contractName: "USDC",
        web3Contract: new web3.eth.Contract(BasicERC20.abi, "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48")
      },
      {
        contractName: "TUSD",
        web3Contract: new web3.eth.Contract(BasicERC20.abi, "0x0000000000085d4780B73119b644AE5ecd22b376")
      },
      {
        contractName: "PAX",
        web3Contract: new web3.eth.Contract(BasicERC20.abi, "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48")
      },
      {
        contractName: "Manager",
        web3Contract: new web3.eth.Contract(Manager.abi, "0x5BA9d812f5533F7Cf2854963f7A9d212f8f28673")
      },
      {
        contractName: "Reserve",
        web3Contract: new web3.eth.Contract(BasicERC20.abi, "0x1C5857e110CD8411054660F60B5De6a6958CfAE2")
      }
    ],
    polls: {
      accounts: 1500,
    },
    syncAlways: true
  };
} else { 
  console.log('develop');
  console.log(web3);
  drizzleOptions = {
    web3: {
      block: false,
      customProvider: web3,
    },
    contracts: [USDC, TUSD, PAX, Reserve, Manager],
    polls: {
      accounts: 1500,
    },
    syncAlways: true
  };
}

export default drizzleOptions;
