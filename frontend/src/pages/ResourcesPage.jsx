import React from 'react';
import InventoryTable from '../features/resources/components/InventoryTable';
import AllocationTable from '../features/resources/components/AllocationTable';
import SectionHeader from '../components/common/SectionHeader';

const ResourcesPage = () => {
  return (
    <div className="page-container">
      <SectionHeader title="Resource Management" />
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>Resource Inventory</h3>
        <InventoryTable />
      </div>
      
      <div>
        <h3>Resource Allocations</h3>
        <AllocationTable />
      </div>
    </div>
  );
};

export default ResourcesPage;
