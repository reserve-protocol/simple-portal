import Web3 from "web3";

import BasicERC20 from "./contracts/BasicERC20.json";
import USDC from "./contracts/USDC.json";
import TUSD from "./contracts/TUSD.json";
import PAX from "./contracts/PAX.json";
import Reserve from "./contracts/Reserve.json";
import Manager from "./contracts/Manager.json";

var web3 = new Web3(Web3.givenProvider);

var contracts = [USDC, TUSD, PAX, Reserve, Manager];

const drizzleOptions = {
  web3: {
    block: false,
    customProvider: web3,
  },
  contracts: contracts,
  polls: {
    accounts: 1500,
  },
  syncAlways: true
};

export default drizzleOptions;
