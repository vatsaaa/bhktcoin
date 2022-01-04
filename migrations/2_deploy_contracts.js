const BhktToken = artifacts.require("./BhktToken.sol");
const BhktTokenSale = artifacts.require("./BhktTokenSale.sol");

module.exports = function (deployer) {
  deployer.deploy(BhktToken, 1000000).then(function () {
    var tokenPrice = 1000000000000000; // in wei = 0.001 ETH
    return deployer.deploy(BhktTokenSale, BhktToken.address, tokenPrice);
  });
};
