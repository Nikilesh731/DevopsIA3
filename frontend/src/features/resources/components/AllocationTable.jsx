import React, { useState, useEffect } from 'react';
import DataTable from '../../../components/common/DataTable';
import { getAllocations } from '../services/resourceApi';
import { formatNumber, formatDate } from '../../../utils/formatters';

const AllocationTable = () => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    fetchAllocations();
  }, []);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'regionName', label: 'Region Name' },
    { key: 'type', label: 'Resource Type' },
    { key: 'quantity', label: 'Quantity', render: (value) => formatNumber(value) }
  ];

  if (loading) return <div className="card">Loading allocations...</div>;
  if (error) return <div className="card">Error: {error}</div>;

  return (
    <DataTable 
      columns={columns} 
      data={allocations}
      emptyMessage="No allocations found"
    />
  );
};

export default AllocationTable;
