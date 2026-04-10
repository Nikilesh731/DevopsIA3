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

  if (loading) return <div className="card">Loading service statuses...</div>;
  if (error) return <div className="card">Error: {error}</div>;

  return (
    <DataTable 
      columns={columns} 
      data={services}
      emptyMessage="No service status available"
    />
  );
};

export default ServiceStatusList;
