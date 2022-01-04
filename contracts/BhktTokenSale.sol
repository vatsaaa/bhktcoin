// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "./BhktToken.sol";

contract BhktTokenSale {
    address admin; // we do not want to expose the address of the admin and hence this is not 'public'
    BhktToken public tokenContract;
    uint256 public tokenPrice; // in wei
    uint256 public tokensSold; // in wei

    event Sell(address indexed _buyer, uint256 _amount);

    constructor (BhktToken _tokenContract, uint256 _tokenPrice) {
        // Assign an admin for the token sale
        admin = msg.sender; // The admin is the sender of the transaction or the deployer of the contract

        // Token Contract
        tokenContract = _tokenContract;

        // Token Price
        tokenPrice = _tokenPrice;
    }

    // Use external library for safe math use??? ds-math use
    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    // Buy Tokens
    function buyTokens(uint256 _numberOfTokens) public payable {
        // Require that value is equal to tokens
        require(msg.value == multiply(_numberOfTokens, tokenPrice));

        // Require that the contract has enough tokens
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);

        // Require that a transfer is successful
        require(tokenContract.transfer(msg.sender, _numberOfTokens));

        // Keep track of tokensSold
        tokensSold += _numberOfTokens;

        // Trigger Sell Event
        emit Sell(msg.sender, _numberOfTokens);
    }
}