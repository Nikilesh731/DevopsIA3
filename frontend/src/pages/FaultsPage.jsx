import React, { useState } from 'react';
import ServiceStatusList from '../features/faults/components/ServiceStatusList';
import FaultActionPanel from '../features/faults/components/FaultActionPanel';
import SectionHeader from '../components/common/SectionHeader';

const FaultsPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleActionComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="page-container">
      <SectionHeader title="Fault Management" />
      
      <div style={{ marginBottom: '2rem' }}>
        <FaultActionPanel onSuccess={handleActionComplete} />
      </div>
      
      <div>
        <h3>Service Status</h3>
        <ServiceStatusList refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
};

export default FaultsPage;
