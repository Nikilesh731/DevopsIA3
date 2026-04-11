import React, { useState, useEffect } from 'react';
import DataTable from '../../../components/common/DataTable';
import StatusBadge from '../../../components/common/StatusBadge';
import { getServiceStatuses } from '../services/faultApi';

const ServiceStatusList = ({ refreshTrigger }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getServiceStatuses();
      setServices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [refreshTrigger]);

  const columns = [
    { key: 'name', label: 'Service Name' },
    { 
      key: 'status', 
      label: 'Status',
      render: (status) => <StatusBadge status={status} />
    }
  ];

  if (loading) {
    return <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading service statuses...</div>;
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
            The backend did not return service status data.
        </p>
        <button
          onClick={fetchServices}
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
      data={services}
      emptyMessage="No service status available"
    />
  );
};

export default ServiceStatusList;
