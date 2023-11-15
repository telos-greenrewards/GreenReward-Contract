import { ethers } from "hardhat";

async function main() {
// const [deployer, member1, member2, member3, member4, member5] = await ethers.getSigners();


//   //deploy green token
//   const GreenToken = await ethers.deployContract("GreenToken");

//   await GreenToken.waitForDeployment();
//   console.log(`GreenToken  deployed to ${GreenToken.target}`);


//     //deploy green reward
//     const GreenReward = await ethers.deployContract("GreenReward", [GreenToken.target, deployer]);

//     await GreenReward.waitForDeployment();
  
//     console.log(`GreenReward  deployed to ${GreenReward.target}`);

//   //deploy green minting
//   const GreenMinting = await ethers.deployContract("GreenMinting", [GreenToken.target]);

//   await GreenMinting.waitForDeployment();

//   console.log(`GreenMinting  deployed to ${GreenMinting.target}`);

//get signer
const [deployer, member1, member2] = await ethers.getSigners();

console.log(deployer.address, member1.address, member2.address)





  //Interact
  const GreenTokenContract = await ethers.getContractAt("GreenToken", "0x3D98a2f7dFdAB3c09A28e95f5e49f26be87f7f95");
  const GreenRewardContract = await ethers.getContractAt("GreenReward", "0x25d3195984A693886103312eA3FA53D738c951B7");
  const GreenMintingContract = await ethers.getContractAt("GreenMinting", "0x951fAa8B5E040DdC3f0489D00CF1E66be2355b25");


  // Green Token Contract
  // transferownership
    const transferOwnership = await GreenTokenContract.transferOwnership("0x25d3195984A693886103312eA3FA53D738c951B7");
        await transferOwnership.wait();
        console.log("Ownership transferred", transferOwnership.hash);


  ////////
  // create Profile
  const profile = await GreenRewardContract.connect(member1).createProfile("Isaac", "Dubai", "isaaac@mail.com");
                  await GreenRewardContract.connect(deployer).createProfile("philip", "Nigeria", "philip@mail.com");
    await profile.wait();
    console.log("Profile created", profile.hash);

 //list Product
 const price = ethers.parseEther("2")
 const price2 = ethers.parseEther("4")
 const listProduct = await GreenRewardContract.connect(member1).listProduct("Glass", "QmVhwmF7aHuwN5ghmPsSzR2pXGgPYuy6YqX6ebBMQX4fKB", "Product of different glasses of differnt sizes", price, 100);
                     await GreenRewardContract.connect(member1).listProduct("plastic bottle", "QmUSiYHYbMXaJYJ2viFAGUiNMPufunpe67EUFBVss9X5wX", "plastic bottles compressed together of different sizes, sold per stack", 4, 50);
    await listProduct.wait();
    console.log("Product listed", listProduct.hash);

//get ProductDetails
const getProductDetails1 = await GreenRewardContract.connect(member1).getProductDetails(1);
    console.log("ProductDetails found", getProductDetails1);

const productprice = getProductDetails1[5]
const quantity = 1
//buy Product
const buymount = productprice * BigInt(quantity) 
const buyProduct = await GreenRewardContract.connect(member2).buyProduct(1, quantity, { value: buymount });
                   //await GreenRewardContract.connect(member3).buyProduct(1, 200); // revert with not eniught product
                   //await GreenRewardContract.connect(member2).buyProduct(1, 40); // revert with not enough balance
    await buyProduct.wait();
    console.log("Product bought", buyProduct.hash);

//find Id
const findId = await GreenRewardContract.connect(member1).findId(member1.address);
    console.log("Id found", findId);

//get Seller
const getSeller = await GreenRewardContract.connect(member1).getSeller(member1.address);
    console.log("Seller found", getSeller);

//get ProductDetails
const getProductDetails = await GreenRewardContract.connect(member1).getProductDetails(1);
    console.log("ProductDetails found", getProductDetails);

// get Allproduct
const getAllproduct = await GreenRewardContract.connect(member1).getAllproduct();
    console.log("Allproduct found", getAllproduct);

//get allSeller
const getAllSeller = await GreenRewardContract.connect(member1).getallSeller();
    console.log("AllSeller found", getAllSeller);

//locate LocationDetails
const locationDetails = await GreenRewardContract.connect(member1).locationDetails("Dubai");
    console.log("locationDetails found", locationDetails);

// approve Payment
const approvePayment = await GreenRewardContract.connect(member2).approvePayment(1);
                    //    await GreenRewardContract.connect(member1).approvePayment(1); //revert with not bought
    await approvePayment.wait();
    console.log("Payment approved", approvePayment.hash);

//balance check
//grreenreward balance
const listerbalance = await GreenTokenContract.balanceOf(member1.address);
    console.log("Lister Balance found", listerbalance);
const buyerBalalnce = await GreenTokenContract.balanceOf(member2.address);
    console.log("Buyer Balance found", buyerBalalnce);

//usdc balance

const listerNativeBalance = await ethers.provider.getBalance(member1.address);
    console.log("Lister Balance found", listerNativeBalance);

const buyerNativeBalance = await ethers.provider.getBalance(member2.address);
    console.log("Buyer Balance found", buyerNativeBalance);

const platformFeeRecipientBalance = await ethers.provider.getBalance(deployer.address);
    console.log("platformFeeRecipient Balance found", platformFeeRecipientBalance);


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});