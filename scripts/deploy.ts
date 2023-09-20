
import { ethers } from "hardhat";

const ipName = "IPName";
const ipDescription = "IPDesc";
const licensee = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";
const royaltyPercentage = 25; //Percent



async function main() {

  const deploy_contract = await ethers.deployContract("IPLicensing", [ipName, ipDescription, licensee, royaltyPercentage]);

  await deploy_contract.waitForDeployment();

  console.log("IPLicensing is deployed to : ",await deploy_contract.getAddress());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
