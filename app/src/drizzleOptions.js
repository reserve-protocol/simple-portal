import Web3 from "web3";

import USDC from "./contracts/USDC.json";
import TUSD from "./contracts/TUSD.json";
import PAX from "./contracts/PAX.json";
import Reserve from "./contracts/Reserve.json";
import Manager from "./contracts/Manager.json";

const drizzleOptions = {
  web3: {
    block: false,
    customProvider: new Web3("ws://localhost:8545"),
  },
  contracts: [USDC, TUSD, PAX, Reserve, Manager],
  events: {
    // SimpleStorage: ["StorageSet"],
  },
  polls: {
    accounts: 1500,
  },
};

export default drizzleOptions;
