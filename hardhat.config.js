require("@nomiclabs/hardhat-ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      allowUnlimitedContractSize: true, // (Optional) To avoid contract size errors
      gas: "auto", // Automatically adjusts gas limit
    },
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: true,
    },
  },
  defaultNetwork: "localhost", // Optional but useful to specify default
};
