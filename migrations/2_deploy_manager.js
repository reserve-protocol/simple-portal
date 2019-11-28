const USDC = artifacts.require("USDC");
const TUSD = artifacts.require("TUSD");
const PAX = artifacts.require("PAX");
const VAULT = artifacts.require("Vault");
const RESERVE = artifacts.require("Reserve");
const RESERVEETERNALSTORAGE = artifacts.require("ReserveEternalStorage");
const PROPOSALFACTORY = artifacts.require("ProposalFactory");
const BASKET = artifacts.require("Basket");
const MANAGER = artifacts.require("Manager");

module.exports = function(deployer, network, accounts) {

  const DAILY = accounts[0];
  const OWNER = accounts[1];
  const ZERO = "0x0000000000000000000000000000000000000000";
  const THIRTY = web3.utils.toBN(10).pow(web3.utils.toBN(30));
  const EIGHTEEN = web3.utils.toBN(10).pow(web3.utils.toBN(18));

  // Stablecoins
  deployer.deploy(USDC, { from: OWNER });
  deployer.deploy(TUSD, { from: OWNER });
  deployer.deploy(PAX, { from: OWNER }).then(() => {

    // Basket
    return deployer.deploy(
      BASKET, 
      ZERO, 
      [USDC.address, TUSD.address, PAX.address], 
      [
        web3.utils.toBN(333333).mul(THIRTY), 
        web3.utils.toBN(333333).mul(THIRTY), 
        web3.utils.toBN(333334).mul(EIGHTEEN)
      ],
      {from: OWNER}
    );
  });

  // Vault
  deployer.deploy(VAULT, {from: OWNER});

  // RSV
  deployer.deploy(RESERVE, {from: OWNER}).then((result) => {
    return result.getEternalStorageAddress();
  }).then((address) => {
    return RESERVEETERNALSTORAGE.at(address);
  }).then((reserveEternalStorage) => {
    reserveEternalStorage.acceptOwnership({from: OWNER});
  });

  // ProposalFactory
  deployer.deploy(PROPOSALFACTORY, {from: OWNER}).then(() => {

    // Manager
    return deployer.deploy(
      MANAGER,
      VAULT.address,
      RESERVE.address,
      PROPOSALFACTORY.address,
      BASKET.address,
      DAILY,
      0,
      { gas: 10000000, from: OWNER }
    );

  }).then((manager) => {
    VAULT.deployed().then((vault) => {
      vault.changeManager(manager.address, { from: OWNER });
    });
    RESERVE.deployed().then((reserve) => {
      reserve.changeMinter(manager.address, { from: OWNER }).then(() => {
        reserve.unpause({ from: DAILY });
      });
      reserve.changePauser(DAILY, { from: OWNER });
      reserve.changeFeeRecipient(DAILY, { from: OWNER });
    });
    manager.setEmergency(false, { from: DAILY });
  });

};
