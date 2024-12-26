const SplitPayment = artifacts.require("SplitPayment");

module.exports = function (deployer, network, accounts) {
  const owner = accounts[0];
  deployer.deploy(SplitPayment, owner);
};
