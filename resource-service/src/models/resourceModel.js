let inventory = [
  { type: "beds", total: 500, available: 500 },
  { type: "vaccines", total: 1000, available: 1000 },
  { type: "oxygen", total: 300, available: 300 }
];

let allocations = [];
let nextAllocationId = 1;

const getInventory = () => {
  return inventory;
};

const getAllocations = () => {
  return allocations;
};

const findInventoryItem = (type) => {
  return inventory.find(item => item.type === type);
};

const allocateResource = (regionId, regionName, type, quantity) => {
  const inventoryItem = findInventoryItem(type);
  if (!inventoryItem) {
    throw new Error('Resource type not found');
  }
  
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }
  
  if (inventoryItem.available < quantity) {
    throw new Error('Insufficient stock available');
  }
  
  inventoryItem.available -= quantity;
  
  const allocation = {
    id: nextAllocationId++,
    regionId,
    regionName,
    type,
    quantity
  };
  
  allocations.push(allocation);
  
  return {
    allocation,
    updatedInventory: inventoryItem
  };
};

module.exports = {
  getInventory,
  getAllocations,
  allocateResource
};
