import React, { useState, useEffect } from 'react';
import DataTable from '../../../components/common/DataTable';
import { getRegions } from '../services/regionApi';
import { formatNumber } from '../../../utils/formatters';

const RegionList = ({ refreshTrigger }) => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRegions();
      setRegions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, [refreshTrigger]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'infected', label: 'Infections', render: (value) => formatNumber(value) },
    { key: 'risk_level', label: 'Risk Level' }
  ];

  if (loading) return <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading regions...</div>;
  
  if (error) return (
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
        The backend did not return region data.
      </p>
      <button
        onClick={fetchRegions}
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

  return (
    <DataTable 
      columns={columns} 
      data={regions}
      emptyMessage="No regions found"
    />
  );
};

export default RegionList;
