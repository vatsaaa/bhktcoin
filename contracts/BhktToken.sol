// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

contract BhktToken {
    // Constructor 
    // Set the total number of tokens in circulation
    // Read the total number of tokens

    uint256 public totalSupply;

    constructor (uint256 _totalSupply) {
        totalSupply = _totalSupply;
    }
}
