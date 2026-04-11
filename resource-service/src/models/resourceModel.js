const { getClient, query } = require('../../../shared/db/database.cjs');

const mapInventoryRow = (row) => ({
  type: row.resource_type,
  total: Number(row.total_available || 0),
  available: Number(row.total_available || 0) - Number(row.reserved || 0) - Number(row.allocated || 0)
});

const mapAllocationRow = (row) => ({
  id: row.id,
  regionId: row.region_id,
  regionName: row.region_name,
  type: row.resource_type,
  quantity: row.quantity,
  allocatedAt: row.allocated_at,
  reason: row.reason,
  severity: row.severity
});

const getInventory = async () => {
  const result = await query(
    'SELECT resource_type, total_available, reserved, allocated FROM inventory ORDER BY resource_type ASC'
  );

  return result.rows.map(mapInventoryRow);
};

const getAllocations = async () => {
  const result = await query(
    `SELECT
       a.id,
       a.region_id,
       COALESCE(r.name, a.reason) AS region_name,
       a.resource_type,
       a.quantity,
       a.allocated_at,
       a.reason,
       a.severity
     FROM allocations a
     LEFT JOIN regions r ON r.id = a.region_id
     ORDER BY a.allocated_at DESC, a.id DESC`
  );

  return result.rows.map(mapAllocationRow);
};

const allocateResource = async (regionId, regionName, type, quantity) => {
  if (!regionId || !type || !quantity) {
    throw new Error('All fields are required');
  }

  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  const client = await getClient();

  try {
    await client.query('BEGIN');

    const regionResult = await client.query(
      'SELECT id, name FROM regions WHERE id = $1',
      [regionId]
    );

    if (regionResult.rows.length === 0) {
      throw new Error('Region not found');
    }

    const resolvedRegionName = regionName || regionResult.rows[0].name;

    const inventoryResult = await client.query(
      'SELECT resource_type, total_available, reserved, allocated FROM inventory WHERE resource_type = $1 FOR UPDATE',
      [type]
    );

    if (inventoryResult.rows.length === 0) {
      throw new Error('Resource type not found');
    }

    const inventoryItem = inventoryResult.rows[0];
    const available = Number(inventoryItem.total_available || 0) - Number(inventoryItem.reserved || 0) - Number(inventoryItem.allocated || 0);

    if (available < quantity) {
      throw new Error('Insufficient stock available');
    }

    await client.query(
      `UPDATE inventory
       SET allocated = COALESCE(allocated, 0) + $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE resource_type = $2`,
      [quantity, type]
    );

    const allocationResult = await client.query(
      `INSERT INTO allocations (region_id, resource_type, quantity, reason, severity)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [regionId, type, quantity, `Allocated to ${resolvedRegionName}`, 'MEDIUM']
    );

    const updatedInventoryResult = await client.query(
      'SELECT resource_type, total_available, reserved, allocated FROM inventory WHERE resource_type = $1',
      [type]
    );

    await client.query('COMMIT');

    const updatedInventory = mapInventoryRow(updatedInventoryResult.rows[0]);

    return {
      allocation: {
        id: allocationResult.rows[0].id,
        regionId,
        regionName: resolvedRegionName,
        type,
        quantity,
        allocatedAt: allocationResult.rows[0].allocated_at,
        reason: allocationResult.rows[0].reason,
        severity: allocationResult.rows[0].severity,
      },
      updatedInventory,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  getInventory,
  getAllocations,
  allocateResource
};
