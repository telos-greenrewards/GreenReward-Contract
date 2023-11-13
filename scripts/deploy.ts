import { ethers } from "hardhat";

async function main() {
const [deployer, member1, member2, member3, member4, member5] = await ethers.getSigners();


  //deploy green token
  const GreenToken = await ethers.deployContract("GreenToken");

  await GreenToken.waitForDeployment();

  console.log(`GreenToken  deployed to ${GreenToken.target}`);

    //deploy green reward
    const GreenReward = await ethers.deployContract("GreenReward", [GreenToken.target, deployer.address]);

    await GreenReward.waitForDeployment();
  
    console.log(`GreenReward  deployed to ${GreenReward.target}`);

  //deploy green minting
  const GreenMinting = await ethers.deployContract("GreenMinting", [GreenToken.target]);

  await GreenMinting.waitForDeployment();

  console.log(`GreenMinting  deployed to ${GreenMinting.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});