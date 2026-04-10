import React, { useState } from 'react';
import DataTable from '../../../components/common/DataTable';
import { formatNumber } from '../../../utils/formatters';

const SimulationResult = ({ result }) => {
  const [view, setView] = useState('summary'); // 'summary' | 'timeline' | 'graph'

  if (!result) return null;

  // Support both old format and new format
  const sim = result.simulation;
  const dailyData = result.dailyData || [];

  // New production format
  if (sim) {
    const casesFatalityRate = sim.total_infected > 0 
      ? ((sim.total_deaths / sim.total_infected) * 100).toFixed(2)
      : '0.00';
    const recoveryRate = sim.total_infected > 0
      ? ((sim.total_recovered / sim.total_infected) * 100).toFixed(2)
      : '0.00';

    const renderSummary = () => (
      <div>
        <h4>📈 Simulation Summary</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
          <div className="metric-box" style={{ padding: '1rem', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Peak Infections</div>
            <div style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>
              {sim.peak_infections?.toLocaleString() || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>Day {sim.peak_day || 0}</div>
          </div>

          <div className="metric-box" style={{ padding: '1rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.875rem', color: '#991b1b', marginBottom: '0.5rem' }}>Total Deaths</div>
            <div style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#dc2626' }}>
              {sim.total_deaths?.toLocaleString() || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#7c2d12', marginTop: '0.25rem' }}>CFR: {casesFatalityRate}%</div>
          </div>

          <div className="metric-box" style={{ padding: '1rem', backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.875rem', color: '#166534', marginBottom: '0.5rem' }}>Total Recovered</div>
            <div style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#16a34a' }}>
              {sim.total_recovered?.toLocaleString() || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#4d7c0f', marginTop: '0.25rem' }}>Recovery: {recoveryRate}%</div>
          </div>

          <div className="metric-box" style={{ padding: '1rem', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.875rem', color: '#0c4a6e', marginBottom: '0.5rem' }}>Duration</div>
            <div style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0369a1' }}>
              {sim.total_days} days
            </div>
            <div style={{ fontSize: '0.75rem', color: '#164e63', marginTop: '0.25rem' }}>
              {sim.completed_at ? new Date(sim.completed_at).toLocaleDateString() : 'In progress'}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '4px', borderLeft: '4px solid #0066cc' }}>
          <h5>📊 Epidemic Parameters</h5>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><strong>Infection Rate:</strong> {(sim.infection_rate * 100).toFixed(2)}%</li>
            <li><strong>Recovery Rate:</strong> {(sim.recovery_rate * 100).toFixed(2)}%</li>
            <li><strong>Mortality Rate:</strong> {(sim.mortality_rate * 100).toFixed(2)}%</li>
            <li><strong>Mobility Factor:</strong> {sim.mobility_factor}x</li>
            <li><strong>Status:</strong> {sim.status}</li>
          </ul>
        </div>
      </div>
    );

    const renderTimeline = () => (
      <div>
        <h4>📅 Day-by-Day Progression</h4>
        <div style={{ maxHeight: '400px', overflowY: 'auto', marginTop: '1rem' }}>
          <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db', position: 'sticky', top: 0 }}>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Day</th>
                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Susceptible</th>
                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Infected</th>
                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Recovered</th>
                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Deaths</th>
              </tr>
            </thead>
            <tbody>
              {dailyData.map((day, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.5rem' }}>{day.day}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                    {day.susceptible?.toLocaleString() || 0}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', color: '#dc2626' }}>
                    <strong>{day.infected?.toLocaleString() || 0}</strong>
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', color: '#16a34a' }}>
                    {day.recovered?.toLocaleString() || 0}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', color: '#7c2d12' }}>
                    {day.deaths?.toLocaleString() || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );

    const renderGraph = () => {
      const maxInfected = sim.peak_infections || 1000;
      const scale = 100 / maxInfected;

      return (
        <div>
          <h4>📊 Infection Curve (First 50 Days)</h4>
          <div style={{ marginTop: '1rem' }}>
            {dailyData.slice(0, 50).map((day, idx) => (
              <div key={idx} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}>
                <div style={{ width: '40px', textAlign: 'right', marginRight: '0.5rem' }}>
                  D{day.day}
                </div>
                <div
                  style={{
                    height: '20px',
                    backgroundColor: '#dc2626',
                    width: `${Math.max(1, day.infected * scale)}px`,
                    borderRadius: '2px',
                  }}
                />
                <div style={{ marginLeft: '0.5rem', width: '80px', textAlign: 'right' }}>
                  {day.infected?.toLocaleString() || 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div className="card">
        <h3>📊 Production Simulation Results</h3>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            onClick={() => setView('summary')}
            className={view === 'summary' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ fontSize: '0.9rem' }}
          >
            Summary
          </button>
          <button
            onClick={() => setView('timeline')}
            className={view === 'timeline' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ fontSize: '0.9rem' }}
          >
            Timeline
          </button>
          <button
            onClick={() => setView('graph')}
            className={view === 'graph' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ fontSize: '0.9rem' }}
          >
            Graph
          </button>
        </div>

        <div style={{ marginTop: '1rem' }}>
          {view === 'summary' && renderSummary()}
          {view === 'timeline' && renderTimeline()}
          {view === 'graph' && renderGraph()}
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '4px', borderLeft: '4px solid #f59e0b' }}>
          <strong>💡 Note:</strong> This is a production-level SIR epidemic model simulation. Results reflect mathematical projections based on epidemiological parameters.
        </div>
      </div>
    );
  }

  // Fallback to old format
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
