// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// @title Minting contract for GreenToken

/// @dev This is an ERC20 interface 
import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract GreenMinting{
    /// address of the deployer
    address public owner;

    //adddress of the GreenToken
    address GreenTokenAddress;

    /// track if an address has minted or not
    mapping(address => bool) public minted;

  
    /// constructor
    ///@dev is sets the owner of the contract to msg.sender
    ///@param _greenTokenAddress is the address of the GreenToken
    constructor(address _greenTokenAddress) {
        owner = msg.sender;
        GreenTokenAddress = _greenTokenAddress;
      }
    

    /// Modifier
    modifier alreadyMinted(){
        require(minted[msg.sender] == false, "MINTED!");
        _;
    }

    modifier onlyOwner(){
        require(msg.sender == owner, "NOT OWNER!");
        _;
    }
    
    /// Event
    event Minted(address indexed minter, uint indexed amount, uint timeOfminting);


    ///@dev A function to mint both GreenToken
    function mint() external alreadyMinted{
        IERC20(GreenTokenAddress).transfer(msg.sender, 2e18);
        minted[msg.sender] = true;

        emit Minted(msg.sender, 2e18, block.timestamp);
    }

    /// Function for the admin to mint any amount
    function specialMint(uint256 _amount) public onlyOwner{
        IERC20(GreenTokenAddress).transfer(msg.sender, _amount);
    }


    ///@dev A function to return the balance of the contract
    function contractBal() public view returns(uint){
        uint TokenBalance = IERC20(GreenTokenAddress).balanceOf(address(this));
        return TokenBalance;
    }

}