import React, { useState, useEffect } from 'react';
import { getRegionAnalytics } from '../services/analyticsApi';
import DataTable from '../../../components/common/DataTable';
import SectionHeader from '../../../components/common/SectionHeader';
import { formatNumber } from '../../../utils/formatters';
import StatusBadge from '../../../components/common/StatusBadge';

const RegionAnalytics = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRegionAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getPriorityColor = (score) => {
    if (score >= 75) return '#dc2626';
    if (score >= 50) return '#f59e0b';
    if (score >= 25) return '#eab308';
    return '#22c55e';
  };

  const getPrioritySeverity = (score) => {
    if (score >= 75) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MEDIUM';
    return 'LOW';
  };

  const columns = [
    { key: 'name', label: 'Region Name' },
    { key: 'population', label: 'Population', render: (value) => formatNumber(value) },
    { key: 'infected', label: 'Infected Cases', render: (value) => formatNumber(value) },
    { 
      key: 'priority_score', 
      label: 'Priority Score',
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '100px',
            height: '20px',
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${value}%`,
              height: '100%',
              backgroundColor: getPriorityColor(value),
              transition: 'width 0.3s'
            }} />
          </div>
          <span>{value.toFixed(1)}</span>
        </div>
      )
    },
    { 
      key: 'resource_demand_level', 
      label: 'Resource Demand',
      render: (value) => <StatusBadge status={value} />
    },
    { 
      key: 'infection_ratio', 
      label: 'Infection Ratio',
      render: (value) => `${(value * 100).toFixed(2)}%`
    },
    { 
      key: 'population_at_risk', 
      label: 'Population at Risk',
      render: (value) => formatNumber(value)
    },
  ];

  if (loading) {
    return <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading analytics...</div>;
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
            The backend did not return region analytics.
        </p>
        <button
          onClick={fetchAnalytics}
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
  
  if (analytics.length === 0) return <div className="card">No analytics data available</div>;

  // Sort by priority score descending
  const sortedAnalytics = [...analytics].sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h3>High Priority Regions (Requiring Immediate Attention)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {sortedAnalytics.slice(0, 3).map((region) => (
            <div key={region.id} style={{
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              borderLeft: `4px solid ${getPriorityColor(region.priority_score || 0)}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>{region.name}</strong>
                <StatusBadge status={getPrioritySeverity(region.priority_score || 0)} />
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                <div>Priority: {(region.priority_score || 0).toFixed(1)}/100</div>
                <div>Infections: {formatNumber(region.infected)} ({(region.infection_ratio * 100).toFixed(2)}%)</div>
                <div>Population at Risk: {formatNumber(region.population_at_risk)}</div>
                <div>Demand: {region.resource_demand_level}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionHeader title="All Regions Analytics" />
        <DataTable 
          columns={columns}
          data={sortedAnalytics}
          emptyMessage="No analytics data"
        />
      </div>
    </div>
  );
};

export default RegionAnalytics;
