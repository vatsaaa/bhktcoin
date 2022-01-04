// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

contract BhktToken {
    string public name = "BHKT Token";
    string public symbol = "BHKT";
    string public standard = "BHKT Token v1.0";
    uint256 public totalSupply;

    event Transfer(
        address indexed _from, 
        address indexed _to, 
        uint256 _value
    );

    event Approval(
        address indexed _owner, 
        address indexed _spender, 
        uint256 _value
    );

    mapping(address => uint256) public balanceOf;

    // One account can approve multiple 3rd parties to sell / spend tokens
    // Hence, we need a mapping of "approver" to all the "spenders" and how much are they approved to spend
    mapping(address => mapping(address => uint256)) public allowance;

    constructor (uint256 _totalSupply) {
        balanceOf[msg.sender] = _totalSupply;
        totalSupply = _totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        // raise the event now
        emit Transfer(msg.sender, _to, _value);

        // Return the bool value
        return true;
    }

    // Delegated transfers

    // allows another account to spend the tokens on behalf of the sender
    // used in a scenario where they approve the exchange to sell X tokens 
    // thus the exchane can transfer X tokens on your behalf
    function approve(address _spender, uint256 _value) public returns (bool success) {
        // msg.sender allows _spender to spend _value tokens
        allowance[msg.sender][_spender] = _value;

        // raise the event now
        emit Approval(msg.sender, _spender, _value);

        // Return the bool value
        return true;
    }

    // after approve() of certain amount, transferFrom() actually handles that transfer
    // and from there the exchange (or another approved 3rd party) can execute the transfer
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        // Require that _from has enough tokens to transfer
        require(_value <= balanceOf[_from]);

        // Require allowance is big enough to cover transfer
        require(_value <= allowance[_from][msg.sender]);

        // Balance of _from account is reduced by _value and _to account is increased by _value
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        // Update the allowance
        allowance[_from][msg.sender] -= _value;

        // Transfer event
        emit Transfer(_from, _to, _value);
        return true;
    }
}

