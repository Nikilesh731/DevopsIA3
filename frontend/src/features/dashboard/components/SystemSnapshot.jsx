import React from 'react';
import DataTable from '../../../components/common/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';

const SystemSnapshot = ({ services }) => {
  const columns = [
    { key: 'name', label: 'Service' },
    { 
      key: 'status', 
      label: 'Status',
      render: (status) => <StatusBadge status={status} />
    }
  ];

  return (
    <div className="card">
      <h3 style={{ marginBottom: '1rem' }}>System Services</h3>
      <DataTable 
        columns={columns} 
        data={services || []}
        emptyMessage="No service status available"
      />
    </div>
  );
};

export default SystemSnapshot;
