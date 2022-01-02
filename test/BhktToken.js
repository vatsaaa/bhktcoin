var BhktToken = artifacts.require("./BhktToken.sol");

contract('BhktToken', function(accounts) {
    it('Sets totalSupply upon deployment', function() {
        return BhktToken.deployed().then(function(instance) {
            return instance.totalSupply();
        }).then(function(totalSupply) {
            assert.equal(totalSupply.toNumber(), 1000000, "Total supply is not 1,000,000");
        });
    })
})