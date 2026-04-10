import React, { useState, useEffect } from 'react';
import DataTable from '../../../components/common/DataTable';
import apiClient from '../../../services/apiClient';
import { API_BASE_URLS } from '../../../constants/serviceConfig';
import { formatNumber } from '../../../utils/formatters';

const InventoryTable = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`${API_BASE_URLS.resource}/api/resources/inventory`);
        const data = response.data.data || [];
        setResources(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const columns = [
    { key: 'type', label: 'Resource Type' },
    { key: 'total', label: 'Total', render: (value) => formatNumber(value) },
    { key: 'available', label: 'Available', render: (value) => formatNumber(value) }
  ];

  if (loading) return <div className="card">Loading resources...</div>;
  if (error) return <div className="card">Error: {error}</div>;

  return (
    <DataTable 
      columns={columns} 
      data={resources}
      emptyMessage="No resources available"
    />
  );
};

export default InventoryTable;
