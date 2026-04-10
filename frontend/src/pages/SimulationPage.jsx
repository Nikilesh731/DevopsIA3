import React, { useState } from 'react';
import SimulationForm from '../features/simulation/components/SimulationForm';
import SimulationResult from '../features/simulation/components/SimulationResult';
import SectionHeader from '../components/common/SectionHeader';

const SimulationPage = () => {
  const [simulationResult, setSimulationResult] = useState(null);

  const handleSimulationComplete = (result) => {
    setSimulationResult(result);
  };

  return (
    <div className="page-container">
      <SectionHeader title="Epidemic Simulation" />
      
      <SimulationForm onSuccess={handleSimulationComplete} />
      
      {simulationResult && (
        <SimulationResult result={simulationResult} />
      )}
    </div>
  );
};

export default SimulationPage;
