// Import ethers library
const { ethers } = require("ethers");

// Connect to an Ethereum provider (adjust the URL as needed)
async function connectToContract() {
  // Provider setup (using local Ganache)
  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:8545"
  );

  // Contract information
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const contractABI = [
    // ABI generated from the SimplifiedSpendingRegistry contract
    "function registerEntity(address entityAddress, string memory name) public",
    "function deactivateEntity(address entityAddress) public",
    "function issueFunds(address entityAddress, uint256 amount) public payable",
    "function recordSpending(string memory purpose, uint256 amount, string memory documentHash) public returns (uint256)",
    "function getSpendingRecord(uint256 recordId) public view returns (tuple(uint256 id, address entity, string purpose, uint256 amount, string documentHash, uint256 timestamp))",
    "function getSpendingRecords(uint256 offset, uint256 limit) public view returns (tuple(uint256 id, address entity, string purpose, uint256 amount, string documentHash, uint256 timestamp)[] memory)",
    "function getEntitySpendingRecords(address entityAddress, uint256 offset, uint256 limit) public view returns (tuple(uint256 id, address entity, string purpose, uint256 amount, string documentHash, uint256 timestamp)[] memory)",
    "function getEntityDetails(address entityAddress) public view returns (string memory name, bool isActive, uint256 balance)",
    "function getAllEntityAddresses() public view returns (address[] memory)",
    "function getEntityCount() public view returns (uint256)",
    "function getContractBalance() public view returns (uint256)",
    "function governmentEntities(address) public view returns (string name, bool isActive, uint256 balance)",
    "function spendingRecords(uint256) public view returns (uint256 id, address entity, string purpose, uint256 amount, string documentHash, uint256 timestamp)",
    "function entityAddresses(uint256) public view returns (address)",
    "function recordCount() public view returns (uint256)",
    "function centralGovernment() public view returns (address)",
  ];

  // Connect with wallet (using the first account from Ganache which is the deployer/central government)
  const privateKey =
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Private key for the central government account
  const wallet = new ethers.Wallet(privateKey, provider);

  // Connect to the contract
  const contract = new ethers.Contract(contractAddress, contractABI, wallet);

  return { provider, wallet, contract };
}

// Central Government Functions
async function centralGovernmentOperations() {
  const { provider, wallet, contract } = await connectToContract();

  console.log("Starting Central Government Operations...");

  // 1. Register a new government entity
  async function registerEntity(entityAddress, name) {
    try {
      const tx = await contract.registerEntity(entityAddress, name);
      const receipt = await tx.wait();
      console.log(`Entity registered: ${name} at address ${entityAddress}`);
      console.log(`Transaction hash: ${receipt.transactionHash}`);
      return receipt;
    } catch (error) {
      console.error("Error registering entity:", error.message);
    }
  }

  // 2. Deactivate a government entity
  async function deactivateEntity(entityAddress) {
    try {
      const tx = await contract.deactivateEntity(entityAddress);
      const receipt = await tx.wait();
      console.log(`Entity deactivated: ${entityAddress}`);
      console.log(`Transaction hash: ${receipt.transactionHash}`);
      return receipt;
    } catch (error) {
      console.error("Error deactivating entity:", error.message);
    }
  }

  // 3. Issue funds to an entity
  async function issueFunds(entityAddress, amount) {
    try {
      // Convert amount to wei (if amount is in ether)
      const amountWei = ethers.utils.parseEther(amount.toString());

      const tx = await contract.issueFunds(entityAddress, amountWei, {
        value: amountWei, // Send the actual ETH with the transaction
      });
      const receipt = await tx.wait();
      console.log(`Funds issued: ${amount} ETH to entity ${entityAddress}`);
      console.log(`Transaction hash: ${receipt.transactionHash}`);
      return receipt;
    } catch (error) {
      console.error("Error issuing funds:", error.message);
    }
  }

  // 4. Get contract balance
  async function getContractBalance() {
    try {
      const balance = await contract.getContractBalance();
      console.log(`Contract balance: ${ethers.utils.formatEther(balance)} ETH`);
      return balance;
    } catch (error) {
      console.error("Error getting contract balance:", error.message);
    }
  }

  // Test central government functions (uncomment to use)
  // await registerEntity("0xNewEntityAddress", "Department of Education");
  // await issueFunds("0xNewEntityAddress", 10); // 10 ETH
  // await getContractBalance();
  // await deactivateEntity("0xNewEntityAddress");
}

// Government Entity Functions
async function governmentEntityOperations(entityAddress, entityPrivateKey) {
  // Create a provider and connect with the entity's wallet
  const provider = new ethers.providers.JsonRpcProvider(
    "http://localhost:8545"
  );
  const entityWallet = new ethers.Wallet(entityPrivateKey, provider);

  // Contract information
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with actual contract address
  const contractABI = [
    "function registerEntity(address entityAddress, string memory name) public",
    "function deactivateEntity(address entityAddress) public",
    "function issueFunds(address entityAddress, uint256 amount) public payable",
    "function recordSpending(string memory purpose, uint256 amount, string memory documentHash) public returns (uint256)",
    "function getSpendingRecord(uint256 recordId) public view returns (tuple(uint256 id, address entity, string purpose, uint256 amount, string documentHash, uint256 timestamp))",
    "function getSpendingRecords(uint256 offset, uint256 limit) public view returns (tuple(uint256 id, address entity, string purpose, uint256 amount, string documentHash, uint256 timestamp)[] memory)",
    "function getEntitySpendingRecords(address entityAddress, uint256 offset, uint256 limit) public view returns (tuple(uint256 id, address entity, string purpose, uint256 amount, string documentHash, uint256 timestamp)[] memory)",
    "function getEntityDetails(address entityAddress) public view returns (string memory name, bool isActive, uint256 balance)",
    "function getAllEntityAddresses() public view returns (address[] memory)",
    "function getEntityCount() public view returns (uint256)",
    "function getContractBalance() public view returns (uint256)",
    "function governmentEntities(address) public view returns (string name, bool isActive, uint256 balance)",
    "function spendingRecords(uint256) public view returns (uint256 id, address entity, string purpose, uint256 amount, string documentHash, uint256 timestamp)",
    "function entityAddresses(uint256) public view returns (address)",
    "function recordCount() public view returns (uint256)",
    "function centralGovernment() public view returns (address)",
  ];

  // Connect to contract with entity wallet
  const contract = new ethers.Contract(
    contractAddress,
    contractABI,
    entityWallet
  );

  console.log(`Starting Entity Operations for ${entityAddress}...`);

  // 1. Record spending
  async function recordSpending(purpose, amount, documentHash) {
    try {
      // Convert amount to wei if needed
      const amountWei = ethers.utils.parseEther(amount.toString());

      const tx = await contract.recordSpending(
        purpose,
        amountWei,
        documentHash
      );
      const receipt = await tx.wait();

      // Get the spending record ID from the event
      const spendingRecordedEvent = receipt.events.find(
        (event) => event.event === "SpendingRecorded"
      );
      const recordId = spendingRecordedEvent.args.id.toNumber();

      console.log(
        `Spending recorded: ID=${recordId}, Purpose=${purpose}, Amount=${amount} ETH`
      );
      console.log(`Transaction hash: ${receipt.transactionHash}`);
      return recordId;
    } catch (error) {
      console.error("Error recording spending:", error.message);
    }
  }

  // Test entity functions (uncomment to use)
  // await recordSpending("School renovation", 2, "QmHash123456789");
}

// Query Functions (can be called by anyone)
async function queryContractData() {
  const { provider, contract } = await connectToContract();

  console.log("Starting Query Operations...");

  // 1. Get spending record by ID
  async function getSpendingRecord(recordId) {
    try {
      const record = await contract.getSpendingRecord(recordId);
      console.log("Spending Record:");
      console.log(`ID: ${record.id.toString()}`);
      console.log(`Entity: ${record.entity}`);
      console.log(`Purpose: ${record.purpose}`);
      console.log(`Amount: ${ethers.utils.formatEther(record.amount)} ETH`);
      console.log(`Document Hash: ${record.documentHash}`);
      console.log(`Timestamp: ${new Date(record.timestamp.toNumber() * 1000)}`);
      return record;
    } catch (error) {
      console.error("Error getting spending record:", error.message);
    }
  }

  // 2. Get spending records (paginated)
  async function getSpendingRecords(offset, limit) {
    try {
      const records = await contract.getSpendingRecords(offset, limit);
      console.log(`Retrieved ${records.length} spending records:`);

      records.forEach((record, index) => {
        console.log(`\n--- Record ${index + offset + 1} ---`);
        console.log(`ID: ${record.id.toString()}`);
        console.log(`Entity: ${record.entity}`);
        console.log(`Purpose: ${record.purpose}`);
        console.log(`Amount: ${ethers.utils.formatEther(record.amount)} ETH`);
        console.log(`Document Hash: ${record.documentHash}`);
        console.log(
          `Timestamp: ${new Date(record.timestamp.toNumber() * 1000)}`
        );
      });

      return records;
    } catch (error) {
      console.error("Error getting spending records:", error.message);
    }
  }

  // 3. Get entity spending records (paginated)
  async function getEntitySpendingRecords(entityAddress, offset, limit) {
    try {
      const records = await contract.getEntitySpendingRecords(
        entityAddress,
        offset,
        limit
      );
      console.log(
        `Retrieved ${records.length} spending records for entity ${entityAddress}:`
      );

      records.forEach((record, index) => {
        console.log(`\n--- Record ${index + 1} ---`);
        console.log(`ID: ${record.id.toString()}`);
        console.log(`Purpose: ${record.purpose}`);
        console.log(`Amount: ${ethers.utils.formatEther(record.amount)} ETH`);
        console.log(`Document Hash: ${record.documentHash}`);
        console.log(
          `Timestamp: ${new Date(record.timestamp.toNumber() * 1000)}`
        );
      });

      return records;
    } catch (error) {
      console.error("Error getting entity spending records:", error.message);
    }
  }

  // 4. Get entity details
  async function getEntityDetails(entityAddress) {
    try {
      const [name, isActive, balance] = await contract.getEntityDetails(
        entityAddress
      );
      console.log("Entity Details:");
      console.log(`Address: ${entityAddress}`);
      console.log(`Name: ${name}`);
      console.log(`Active: ${isActive}`);
      console.log(`Balance: ${ethers.utils.formatEther(balance)} ETH`);
      return { name, isActive, balance };
    } catch (error) {
      console.error("Error getting entity details:", error.message);
    }
  }

  // 5. Get all entity addresses
  async function getAllEntityAddresses() {
    try {
      const addresses = await contract.getAllEntityAddresses();
      console.log(`Retrieved ${addresses.length} entity addresses:`);
      addresses.forEach((address, index) => {
        console.log(`${index + 1}. ${address}`);
      });
      return addresses;
    } catch (error) {
      console.error("Error getting entity addresses:", error.message);
    }
  }

  // 6. Get entity count
  async function getEntityCount() {
    try {
      const count = await contract.getEntityCount();
      console.log(`Total number of entities registered: ${count.toString()}`);
      return count;
    } catch (error) {
      console.error("Error getting entity count:", error.message);
    }
  }

  // 7. Get record count
  async function getRecordCount() {
    try {
      const count = await contract.recordCount();
      console.log(`Total number of spending records: ${count.toString()}`);
      return count;
    } catch (error) {
      console.error("Error getting record count:", error.message);
    }
  }

  // Test query functions (uncomment to use)
  // await getEntityCount();
  // await getAllEntityAddresses();
  // await getEntityDetails("0xSomeEntityAddress");
  // await getRecordCount();
  // await getSpendingRecord(1);
  // await getSpendingRecords(0, 10);
  // await getEntitySpendingRecords("0xSomeEntityAddress", 0, 5);
}

// Main function to demonstrate usage
async function main() {
  try {
    console.log("SimplifiedSpendingRegistry Interaction Demo");

    // Get contract connection
    const { provider, wallet, contract } = await connectToContract();

    // Query operations
    console.log("\n=== Querying Contract Data ===");

    // Get entity count
    const entityCount = await contract.getEntityCount();
    console.log(`Total number of entities: ${entityCount.toString()}`);

    // Get contract balance
    const balance = await contract.getContractBalance();
    console.log(`Contract balance: ${ethers.utils.formatEther(balance)} ETH`);

    // Get all entity addresses
    const addresses = await contract.getAllEntityAddresses();
    console.log("\nRegistered Entity Addresses:");
    if (addresses.length === 0) {
      console.log("No entities registered yet");
    } else {
      addresses.forEach((address, index) => {
        console.log(`${index + 1}. ${address}`);
      });
    }

    // If there are entities, get details of the first one
    if (addresses.length > 0) {
      const firstEntity = addresses[0];
      const entityDetails = await contract.getEntityDetails(firstEntity);
      console.log("\nFirst Entity Details:");
      console.log(`Name: ${entityDetails.name}`);
      console.log(`Active: ${entityDetails.isActive}`);
      console.log(
        `Balance: ${ethers.utils.formatEther(entityDetails.balance)} ETH`
      );
    }

    // Try to get spending records only if there are any
    const recordCount = await contract.recordCount();
    console.log(`\nTotal spending records: ${recordCount}`);

    if (recordCount > 0) {
      // Get spending records
      const records = await contract.getSpendingRecords(
        0,
        Math.min(5, recordCount)
      );
      console.log("\nRecent Spending Records:");
      records.forEach((record, index) => {
        console.log(`\nRecord ${index + 1}:`);
        console.log(`Purpose: ${record.purpose}`);
        console.log(`Amount: ${ethers.utils.formatEther(record.amount)} ETH`);
        console.log(`Entity: ${record.entity}`);
        console.log(
          `Timestamp: ${new Date(record.timestamp.toNumber() * 1000)}`
        );
      });
    } else {
      console.log("No spending records yet");
    }

    // Let's try to register a new entity as a demo
    console.log("\n=== Attempting to Register a New Entity ===");
    const newEntityAddress = "0x8a3b1f02db052ffad60a068ba76a2ab68d1fa643a2"; // Using the third Ganache account

    // First check if the entity exists and is active
    try {
      const [name, isActive, balance] = await contract.getEntityDetails(
        newEntityAddress
      );
      console.log(`Entity already exists at ${newEntityAddress}`);
      console.log(`Name: ${name}`);
      console.log(`Active: ${isActive}`);
      console.log(`Balance: ${ethers.utils.formatEther(balance)} ETH`);

      if (isActive) {
        console.log(
          "Entity is already active. To register a new entity, please use a different address."
        );
      }
    } catch (error) {
      // If entity doesn't exist, try to register it
      console.log("Entity does not exist, attempting to register...");
      const tx = await contract.registerEntity(
        newEntityAddress,
        "Department of Education"
      );
      await tx.wait();
      console.log(
        `Entity registered: Department of Education at ${newEntityAddress}`
      );
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Execute the demo
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
