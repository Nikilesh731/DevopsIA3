import React from 'react';
import DataTable from '../../../components/common/DataTable';
import { formatNumber } from '../../../utils/formatters';

const SimulationResult = ({ result }) => {
  if (!result) return null;

  const columns = [
    { key: 'id', label: 'Region ID' },
    { key: 'name', label: 'Region Name' },
    { key: 'added_infections', label: 'New Infections', render: (value) => formatNumber(value) },
    { key: 'new_risk_level', label: 'New Risk Level' }
  ];

  return (
    <div className="card">
      <h3>Simulation Results</h3>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <h4>Source Region</h4>
        <div><strong>Name:</strong> {result.sourceRegion?.name}</div>
        <div><strong>Spread Factor:</strong> {result.spreadFactor}</div>
        <div><strong>Spread per Region:</strong> {formatNumber(result.spreadCountPerRegion)}</div>
      </div>

      <h4>Affected Regions ({result.affectedRegions?.length || 0})</h4>
      <DataTable 
        columns={columns} 
        data={result.affectedRegions || []}
        emptyMessage="No regions affected"
      />
    </div>
  );
};

export default SimulationResult;
