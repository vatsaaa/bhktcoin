var BhktToken = artifacts.require("./BhktToken.sol");

contract('BhktToken', function(accounts) {
    var tokenInstance;

    it('Initializes the contract with the correct values', function() {
        return BhktToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function(name) {
            assert.equal(name, 'BHKT Token', 'has the correct name');
            return tokenInstance.symbol();
        }).then(function(symbol) {
            assert.equal(symbol, 'BHKT', 'has the correct symbol');
            return tokenInstance.standard();
        }).then(function(standard) {
            return assert.equal(standard, "BHKT Token v1.0", 'has the correct standard');
        });
    });

    it('Allocates initial supply upon deployment', function() {
        return BhktToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply) {
            assert.equal(totalSupply.toNumber(), 1000000, "Sets the total supply to 1,000,000");
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(adminBalance) {
            assert.equal(adminBalance.toNumber(), 1000000, "It allocates initial supply to the admin account");
        });
    });

    it('transfers token ownership', function() {
        return BhktToken.deployed().then(function(instance) {
            tokenInstance = instance;
            // We use transfer.call() as we don't want a transaction to be created, but only to inspect
            return tokenInstance.transfer.call(accounts[1], 9000000000, {from: accounts[0]});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            // Again, use transfer.call() as we don't want a transaction to be created
            // we only want to inspect the return from the function, is true of false
            return tokenInstance.transfer.call(accounts[1], 250000, {from: accounts[0]});
        }).then(function(success) {
            assert.equal(success, true, "it returns true");
            // Without .call() transfer() creates a transaction, unlike transfer.call()
            return tokenInstance.transfer(accounts[1], 250000, {from: accounts[0]});
        }).then(function(receipt) {
            // We can test for events by looking at transaction receipt
            // Event information is in receipt.logs[n]
            assert.equal(receipt.logs.length, 1, "triggers one event");
            // As there is only 1 event, we use the first index - hardcoded
            assert.equal(receipt.logs[0].event, "Transfer", "should be the transfer event");
            assert.equal(receipt.logs[0].args._from, accounts[0], "logs the account the tokens are transferred from");
            assert.equal(receipt.logs[0].args._to, accounts[1], "logs the account the tokens are transferred to");
            assert.equal(receipt.logs[0].args._value, 250000, "logs the transfer amount");
            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 250000, "adds the amount to the receiving account");
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 750000, "deducts the amount from the sending account");
        });
    });

    it('approves tokens for delegated transfer', function() {
        return BhktToken.deployed().then(function(instance) {
            tokenInstance = instance;
            // Simply calls approve without writing to the blockchain
            return tokenInstance.approve.call(accounts[1], 100);
        }).then(function(success) {
            assert(success, true, 'it returns true');
            // Here we do want to create the transaction
            return tokenInstance.approve(accounts[1], 100, { from: accounts[0] });
        }).then(function(receipt) {
            // We can test for events by looking at transaction receipt
            // Event information is in receipt.logs[n]
            assert.equal(receipt.logs.length, 1, "triggers one event");
            // As there is only 1 event, we use the first index - hardcoded
            assert.equal(receipt.logs[0].event, "Approval", "should be the transfer event");
            assert.equal(receipt.logs[0].args._owner, accounts[0], "logs the account the tokens are authorised by");
            assert.equal(receipt.logs[0].args._spender, accounts[1], "logs the account the tokens are authorised to");
            assert.equal(receipt.logs[0].args._value.toNumber(), 100, "logs the transfer amount");
            return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then(function(allowance) {
            assert.equal(allowance.toNumber(), 100, "stores the allowance for delegated transfer");
        });
    });

    it('handles delegated token transfers', function() {
        let fromAccount = accounts[2];
        let toAccount = accounts[3];
        let spendingAccount = accounts[4];

        return BhktToken.deployed().then(function(instance) {
            tokenInstance = instance;
            // Transfer some tokens to fromAccount
            return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
        }).then(function(receipt) {
            // Approve spendingAccount to spend 10 tokens from fromAccount);
            return tokenInstance.approve(spendingAccount, 10, { from: fromAccount });
        }).then(function(receipt) {
            // Try transferring something larger than the sender's balance
            return tokenInstance.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount });
        }).then(assert.fail).catch(function(error) {
            // check for error to contain string 'revert'
            assert(error.message.indexOf('revert') >= 0, "cannot transfer value larger than balance");
            // Try transferring something larger than the approved amount
            return tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, "cannot transfer value larger than approved amount");
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
        }).then(function(success) {
            assert.equal(success, true, "it returns true");
            return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, "triggers one event");
            assert.equal(receipt.logs[0].event, "Transfer", "should be the transfer event");
            assert.equal(receipt.logs[0].args._from, fromAccount, "logs the account the tokens are transferred from");
            assert.equal(receipt.logs[0].args._to, toAccount, "logs the account the tokens are transferred to");
            assert.equal(receipt.logs[0].args._value, 10, "logs the transfer amount");
            return tokenInstance.balanceOf(fromAccount);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 90, "deducts the amount from the sending account");
            return tokenInstance.balanceOf(toAccount);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 10, "adds the amount to the receiving account");
            // spendingAccount is allowed to spend some amount from fromAccount
            return tokenInstance.allowance(fromAccount, spendingAccount);
        }).then(function(allowance) {
            // since the allowance was 10 tokens, we would not be left with anymore tokens to spend
            assert.equal(allowance.toNumber(), 0, "deducts the amount from the allowance");
        });
    });
});