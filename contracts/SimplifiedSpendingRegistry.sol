// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract SimplifiedSpendingRegistry {
    struct GovernmentEntity {
        string name;
        bool isActive;
        uint256 balance;
    }

    struct SpendingRecord {
        uint256 id;
        address entity;
        string purpose;
        uint256 amount;
        string documentHash; 
        uint256 timestamp;
    }

    mapping(address => GovernmentEntity) public governmentEntities;
    mapping(uint256 => SpendingRecord) public spendingRecords;
    address[] public entityAddresses;
    uint256 public recordCount;

    address public centralGovernment;

    // Events
    event EntityRegistered(address indexed entityAddress, string name);
    event EntityDeactivated(address indexed entityAddress);
    event FundsIssued(address indexed to, uint256 amount);
    event SpendingRecorded(uint256 indexed id, address indexed entity, uint256 amount, string documentHash);

    constructor() {
        centralGovernment = msg.sender;
    }

    modifier onlyCentralGovernment() {
        require(msg.sender == centralGovernment, "Only central government can perform this action");
        _;
    }

    modifier onlyRegisteredEntity() {
        require(governmentEntities[msg.sender].isActive, "Only active registered entities can perform this action");
        _;
    }

    // Register a new government entity
    function registerEntity(address entityAddress, string memory name) public onlyCentralGovernment {
        require(entityAddress != address(0), "Entity address cannot be zero");
        require(bytes(name).length > 0, "Entity name cannot be empty");
        require(!governmentEntities[entityAddress].isActive, "Entity already registered and active");
        
        governmentEntities[entityAddress] = GovernmentEntity({
            name: name,
            isActive: true,
            balance: 0
        });
        
        entityAddresses.push(entityAddress);
        emit EntityRegistered(entityAddress, name);
    }

    // Deactivate a government entity
    function deactivateEntity(address entityAddress) public onlyCentralGovernment {
        require(governmentEntities[entityAddress].isActive, "Entity not active");
        governmentEntities[entityAddress].isActive = false;
        emit EntityDeactivated(entityAddress);
    }

    // Issue funds to a registered entity
    function issueFunds(address entityAddress, uint256 amount) public payable onlyCentralGovernment {
        require(governmentEntities[entityAddress].isActive, "Entity not active");
        require(msg.value == amount, "Sent value must match the amount");
        
        governmentEntities[entityAddress].balance += amount;
        emit FundsIssued(entityAddress, amount);
    }

    // Record spending with documentation
    function recordSpending(
        string memory purpose,
        uint256 amount,
        string memory documentHash
    ) public onlyRegisteredEntity returns (uint256) {
        require(bytes(purpose).length > 0, "Purpose cannot be empty");
        require(amount > 0, "Amount must be greater than zero");
        require(bytes(documentHash).length > 0, "Document hash cannot be empty");
        require(governmentEntities[msg.sender].balance >= amount, "Insufficient balance");
        
        // Reduce the entity's balance
        governmentEntities[msg.sender].balance -= amount;
        
        // Record the spending
        recordCount++;
        spendingRecords[recordCount] = SpendingRecord({
            id: recordCount,
            entity: msg.sender,
            purpose: purpose,
            amount: amount,
            documentHash: documentHash,
            timestamp: block.timestamp
        });
        
        emit SpendingRecorded(recordCount, msg.sender, amount, documentHash);
        return recordCount;
    }

    // Get spending record by ID
    function getSpendingRecord(uint256 recordId) public view returns (SpendingRecord memory) {
        require(recordId > 0 && recordId <= recordCount, "Invalid record ID");
        return spendingRecords[recordId];
    }

    // Get all spending records (paginated)
    function getSpendingRecords(uint256 offset, uint256 limit) public view returns (SpendingRecord[] memory) {
        require(offset < recordCount, "Offset exceeds record count");
        require(limit > 0, "Limit must be greater than zero");
        
        uint256 resultCount = limit;
        if (offset + limit > recordCount) {
            resultCount = recordCount - offset;
        }
        
        SpendingRecord[] memory result = new SpendingRecord[](resultCount);
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = spendingRecords[offset + i + 1];
        }
        
        return result;
    }

    // Get spending records for a specific entity (paginated)
    function getEntitySpendingRecords(address entityAddress, uint256 offset, uint256 limit) public view returns (SpendingRecord[] memory) {
        require(governmentEntities[entityAddress].isActive || !governmentEntities[entityAddress].isActive, "Not a registered entity");
        
        // First, count how many records belong to this entity
        uint256 entityRecordCount = 0;
        for (uint256 i = 1; i <= recordCount; i++) {
            if (spendingRecords[i].entity == entityAddress) {
                entityRecordCount++;
            }
        }
        
        require(offset < entityRecordCount, "Offset exceeds entity record count");
        require(limit > 0, "Limit must be greater than zero");
        
        uint256 resultCount = limit;
        if (offset + limit > entityRecordCount) {
            resultCount = entityRecordCount - offset;
        }
        
        SpendingRecord[] memory result = new SpendingRecord[](resultCount);
        uint256 currentOffset = 0;
        uint256 resultIndex = 0;
        
        for (uint256 i = 1; i <= recordCount && resultIndex < resultCount; i++) {
            if (spendingRecords[i].entity == entityAddress) {
                if (currentOffset >= offset) {
                    result[resultIndex] = spendingRecords[i];
                    resultIndex++;
                }
                currentOffset++;
            }
        }
        
        return result;
    }

    // Get entity details
    function getEntityDetails(address entityAddress) public view returns (
        string memory name,
        bool isActive,
        uint256 balance
    ) {
        require(governmentEntities[entityAddress].isActive || !governmentEntities[entityAddress].isActive, "Not a registered entity");
        
        GovernmentEntity memory entity = governmentEntities[entityAddress];
        return (entity.name, entity.isActive, entity.balance);
    }

    // Get all entity addresses
    function getAllEntityAddresses() public view returns (address[] memory) {
        return entityAddresses;
    }

    // Get entity count
    function getEntityCount() public view returns (uint256) {
        return entityAddresses.length;
    }

    // Get balance of contract
    function getContractBalance() public view onlyCentralGovernment returns (uint256) {
        return address(this).balance;
    }
}