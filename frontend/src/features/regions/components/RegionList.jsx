import React, { useState, useEffect } from 'react';
import DataTable from '../../../components/common/DataTable';
import SectionHeader from '../../../components/common/SectionHeader';
import { getRegions } from '../services/regionApi';
import StatusBadge from '../../../components/common/StatusBadge';
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
    { key: 'infection_count', label: 'Infections', render: (value) => formatNumber(value) },
    { key: 'risk_level', label: 'Risk Level' }
  ];

  if (loading) return <div className="card">Loading regions...</div>;
  if (error) return <div className="card">Error: {error}</div>;

  return (
    <DataTable 
      columns={columns} 
      data={regions}
      emptyMessage="No regions found"
    />
  );
};

export default RegionList;
