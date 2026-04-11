import React, { useState, useEffect } from 'react';
import DataTable from '../../../components/common/DataTable';
import { getResources } from '../services/resourceApi';
import { formatNumber } from '../../../utils/formatters';

const InventoryTable = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await getResources();
      setResources(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const columns = [
    { key: 'type', label: 'Resource Type' },
    { key: 'total', label: 'Total', render: (value) => formatNumber(value) },
    { key: 'available', label: 'Available', render: (value) => formatNumber(value) }
  ];

  if (loading) {
    return <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading resources...</div>;
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
          The resource data could not be loaded from the backend.
        </p>
        <button
          onClick={fetchResources}
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
      data={resources}
      emptyMessage="No resources available"
    />
  );
};

export default InventoryTable;
