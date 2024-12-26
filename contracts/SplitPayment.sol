// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract SplitPayment {
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    function send(address payable [] memory to, uint256[] memory amounts) public payable onlyOwner {
        require(to.length == amounts.length, "Recipients and amounts length mismatch");

        for (uint256 i = 0; i < to.length; i++) {
            to[i].transfer(amounts[i]);
        }
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can send a Tx!");
        _;
    }
}
