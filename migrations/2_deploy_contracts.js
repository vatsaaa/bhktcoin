const BhktToken = artifacts.require("./BhktToken.sol");

module.exports = function (deployer) {
  deployer.deploy(BhktToken, 1000000);
};
