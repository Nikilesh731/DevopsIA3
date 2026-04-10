import React, { useState } from 'react';
import RegionList from '../features/regions/components/RegionList';
import RegionAnalytics from '../features/regions/components/RegionAnalytics';
import RegionForm from '../features/regions/components/RegionForm';
import SectionHeader from '../components/common/SectionHeader';

const RegionsPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' or 'list'

  const handleRegionCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="page-container">
      <SectionHeader title="Regions Management" />
      
      <div style={{ marginBottom: '2rem' }}>
        <RegionForm onSuccess={handleRegionCreated} />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <button 
          onClick={() => setActiveTab('analytics')}
          style={{
            marginRight: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: activeTab === 'analytics' ? '#3b82f6' : '#e5e7eb',
            color: activeTab === 'analytics' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📊 Priority Analytics
        </button>
        <button 
          onClick={() => setActiveTab('list')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: activeTab === 'list' ? '#3b82f6' : '#e5e7eb',
            color: activeTab === 'list' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📋 All Regions
        </button>
      </div>

      {activeTab === 'analytics' && (
        <RegionAnalytics refreshTrigger={refreshTrigger} />
      )}
      
      {activeTab === 'list' && (
        <RegionList refreshTrigger={refreshTrigger} />
      )}
    </div>
  );
};

export default RegionsPage;
