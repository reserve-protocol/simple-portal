const path = require("path");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "app/src/contracts"),
  networks: {
    develop: {
      host: "localhost",
      port: 8545,
      network_id: "*",
      gasPrice:   0x1,
      gas:        0x1fffffffffffff
    },
  },
  compilers: {
    solc: {
      version: "0.5.7",
      settings: {
        optimizer: { 
            enabled: true,
            runs: 200
        },
        evmVersion: "constantinople"
      },
    }
  }
};
