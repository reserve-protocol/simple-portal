import USDC from "./contracts/USDC.json";
import TUSD from "./contracts/TUSD.json";
import PAX from "./contracts/PAX.json";
import Reserve from "./contracts/Reserve.json";
import Manager from "./contracts/Manager.json";

var contracts = [USDC, TUSD, PAX, Reserve, Manager];

const drizzleOptions = {
  contracts: contracts,
  polls: {
    accounts: 1500,
  },
  syncAlways: true
};

export default drizzleOptions;
