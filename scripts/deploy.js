const hre = require("hardhat");

async function main() {
  console.log("Deploying SimplifiedSpendingRegistry...");

  const SimplifiedSpendingRegistry = await hre.ethers.getContractFactory(
    "SimplifiedSpendingRegistry"
  );
  const registry = await SimplifiedSpendingRegistry.deploy();

  await registry.deployed();

  console.log("SimplifiedSpendingRegistry deployed to:", registry.address);
  console.log(
    "Central Government address:",
    await registry.centralGovernment()
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
