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

    mapping(address => uint256) public balanceOf;

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
}

