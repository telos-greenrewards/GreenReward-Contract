import { ethers } from "hardhat";

async function main() {
const [deployer, member1, member2, member3, member4, member5] = await ethers.getSigners();


  //deploy green token
  const GreenToken = await ethers.deployContract("GreenToken");

  await GreenToken.waitForDeployment();
  console.log(`GreenToken  deployed to ${GreenToken.target}`);


    //deploy green reward
    const GreenReward = await ethers.deployContract("GreenReward", [GreenToken.target, deployer]);

    await GreenReward.waitForDeployment();
  
    console.log(`GreenReward  deployed to ${GreenReward.target}`);

  //deploy green minting
  const GreenMinting = await ethers.deployContract("GreenMinting", [GreenToken.target]);

  await GreenMinting.waitForDeployment();

  console.log(`GreenMinting  deployed to ${GreenMinting.target}`);



  ///Interact
  const GreenTokenContract = await ethers.getContractAt("GreenToken", GreenToken.target);
  const GreenRewardContract = await ethers.getContractAt("GreenReward", GreenReward.target);
  const GreenMintingContract = await ethers.getContractAt("GreenMinting", GreenMinting.target);


  //Green Token Contract
  // transferownership
    const transferOwnership = await GreenTokenContract.transferOwnership(GreenRewardContract.target);
        await transferOwnership.wait();
        console.log("Ownership transferred", transferOwnership.hash);






  ////////
  // create Profile
  const profile = await GreenRewardContract.connect(member1).createProfile("Isaac", "Dubai", "isaaac@mail.com");
                  await GreenRewardContract.connect(member4).createProfile("member4", "Uk", "member4@mail.com");
    await profile.wait();
    console.log("Profile created", profile.hash);

 //list Product
 const price = ethers.parseEther("2")
 const listProduct = await GreenRewardContract.connect(member1).listProduct("Product 1", "product image", "Product 1 description", price, 100);
                     await GreenRewardContract.connect(member1).listProduct("Product 2", "product2 image", "Product 2 description", 4, 50);
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