import React, { useState, useEffect } from 'react';
import DataTable from '../../../components/common/DataTable';
import { getAllocations } from '../services/resourceApi';
import { formatNumber } from '../../../utils/formatters';

const AllocationTable = () => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllocations = async () => {
    try {
      setLoading(true);
      const data = await getAllocations();
      setAllocations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'regionName', label: 'Region Name' },
    { key: 'type', label: 'Resource Type' },
    { key: 'quantity', label: 'Quantity', render: (value) => formatNumber(value) }
  ];

  if (loading) {
    return <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading allocations...</div>;
  }

  if (error) {
    return (
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ 
          color: '#b45309', 
          padding: '1rem', 
          backgroundColor: '#fef3c7', 
          borderRadius: '4px',
          border: '1px solid #f59e0b',
          marginBottom: '1rem'
        }}>
          <strong>⚠️ Note:</strong> {error}
        </div>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          The allocation data could not be loaded from the backend.
        </p>
        <button
          onClick={fetchAllocations}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <DataTable 
      columns={columns} 
      data={allocations}
      emptyMessage="No allocations found"
    />
  );
};

export default AllocationTable;
