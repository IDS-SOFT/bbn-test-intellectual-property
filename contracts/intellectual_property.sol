// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

// Define the IP licensing contract
contract IPLicensing is Ownable {
    string public ipName;
    string public ipDescription;
    address public licensee;
    uint256 public royaltyPercentage; // Royalty percentage to be paid to IP owner
    bool public isRevoked;

    event CheckBalance(string text, uint amount);

    constructor(
        string memory _ipName,
        string memory _ipDescription,
        address _licensee,
        uint256 _royaltyPercentage
    ) {
        ipName = _ipName;
        ipDescription = _ipDescription;
        licensee = _licensee;
        royaltyPercentage = _royaltyPercentage;
    }

    // Event for recording IP usage
    event IPUsage(address indexed user, uint256 usageAmount);

    // Event for recording royalty payments
    event RoyaltyPayment(address indexed payer, uint256 amount);

    // Function to grant usage rights and record usage
    function grantUsage() external payable {
        require(!isRevoked, "IP license is revoked");
        require(msg.sender == licensee, "Only licensee can use the IP");

        // Record IP usage
        emit IPUsage(msg.sender, msg.value);

        // Calculate and pay royalties to the IP owner
        uint256 royaltyAmount = (msg.value * royaltyPercentage) / 100;
        address owner = owner();
        payable(owner).transfer(royaltyAmount);

        // Transfer the remaining amount to the licensee
        uint256 remainingAmount = msg.value - royaltyAmount;
        payable(licensee).transfer(remainingAmount);
    }

    // Function to revoke the IP license
    function revokeLicense() external onlyOwner {
        isRevoked = true;
    }

    // Function to withdraw royalties earned by the IP owner
    function withdrawRoyalties() external onlyOwner {
        require(!isRevoked, "IP license is revoked");
        uint256 contractBalance = address(this).balance;
        address owner = owner();
        payable(owner).transfer(contractBalance);
    }
    
    function getBalance(address user_account) external returns (uint){
    
       string memory data = "User Balance is : ";
       uint user_bal = user_account.balance;
       emit CheckBalance(data, user_bal );
       return (user_bal);

    }
}
