import React, { useState, useEffect } from 'react';
import { createSimulation, runSimulation, getSimulationResults } from '../services/simulationApi';
import { getRegions } from '../../regions/services/regionApi';

const SimulationForm = ({ onSuccess }) => {
  const [regions, setRegions] = useState([]);
  const [formData, setFormData] = useState({
    sourceRegion: '',
    infectionRate: '0.15',
    recoveryRate: '0.10',
    mortalityRate: '0.02',
    totalDays: '180',
    mobilityFactor: '1.0',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stage, setStage] = useState('form'); // 'form' | 'running' | 'complete'
  const [currentSimulation, setCurrentSimulation] = useState(null);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const data = await getRegions();
      setRegions(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStage('running');

    try {
      const simData = await createSimulation({
        sourceRegionId: parseInt(formData.sourceRegion),
        infectionRate: parseFloat(formData.infectionRate),
        recoveryRate: parseFloat(formData.recoveryRate),
        mortalityRate: parseFloat(formData.mortalityRate),
        totalDays: parseInt(formData.totalDays),
        mobilityFactor: parseFloat(formData.mobilityFactor),
      });

      const simulationId = simData.id;

      setCurrentSimulation({
        id: simulationId,
        status: 'created',
        progress: 0,
      });

      await runSimulation(simulationId);

      const resultsData = await getSimulationResults(simulationId);
      setStage('complete');
      onSuccess(resultsData);
    } catch (err) {
      setError(err.message);
      setStage('form');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      sourceRegion: '',
      infectionRate: '0.15',
      recoveryRate: '0.10',
      mortalityRate: '0.02',
      totalDays: '180',
      mobilityFactor: '1.0',
    });
    setError('');
    setStage('form');
    setCurrentSimulation(null);
  };

  return (
    <div className="card">
      <h3>📊 Production-Level Epidemic Simulation</h3>
      
      {stage === 'form' && (
        <>
          {error && (
            <div style={{ 
              color: '#b45309', 
              marginBottom: '1rem', 
              padding: '0.75rem', 
              backgroundColor: '#fef3c7', 
              borderRadius: '4px',
              border: '1px solid #f59e0b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>⚠️ {error}</span>
              <button 
                type="button"
                onClick={() => setError('')}
                style={{
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Dismiss
              </button>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Source Region (Patient Zero)</label>
              <select
                name="sourceRegion"
                value={formData.sourceRegion}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">-- Select Region --</option>
                {(regions || []).map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Infection Rate (0-1)</label>
                <input
                  type="number"
                  name="infectionRate"
                  value={formData.infectionRate}
                  onChange={handleChange}
                  className="form-input"
                  required
                  min="0"
                  max="1"
                  step="0.01"
                />
                <small>Daily transmission probability</small>
              </div>

              <div className="form-group">
                <label className="form-label">Recovery Rate (0-1)</label>
                <input
                  type="number"
                  name="recoveryRate"
                  value={formData.recoveryRate}
                  onChange={handleChange}
                  className="form-input"
                  required
                  min="0"
                  max="1"
                  step="0.01"
                />
                <small>1/infectious period</small>
              </div>

              <div className="form-group">
                <label className="form-label">Mortality Rate (0-1)</label>
                <input
                  type="number"
                  name="mortalityRate"
                  value={formData.mortalityRate}
                  onChange={handleChange}
                  className="form-input"
                  required
                  min="0"
                  max="1"
                  step="0.001"
                />
                <small>Case fatality rate</small>
              </div>

              <div className="form-group">
                <label className="form-label">Simulation Days</label>
                <input
                  type="number"
                  name="totalDays"
                  value={formData.totalDays}
                  onChange={handleChange}
                  className="form-input"
                  required
                  min="1"
                  max="365"
                />
                <small>Days to simulate</small>
              </div>

              <div className="form-group">
                <label className="form-label">Mobility Factor (0-2)</label>
                <input
                  type="number"
                  name="mobilityFactor"
                  value={formData.mobilityFactor}
                  onChange={handleChange}
                  className="form-input"
                  required
                  min="0"
                  max="2"
                  step="0.1"
                />
                <small>Travel/movement multiplier</small>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ marginTop: '1rem' }}
            >
              {loading ? '⏳ Running Simulation...' : '▶ Start Simulation'}
            </button>
          </form>
        </>
      )}

      {stage === 'running' && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Simulating epidemic spread across {formData.totalDays} days...</p>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>This may take a moment</p>
          {currentSimulation && (
            <p style={{ marginTop: '1rem', color: '#0066cc' }}>
              Simulation ID: {currentSimulation.id}
            </p>
          )}
        </div>
      )}

      {stage === 'complete' && (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <p>✅ Simulation completed successfully!</p>
          <button 
            onClick={handleReset}
            className="btn btn-secondary"
            style={{ marginTop: '1rem' }}
          >
            Run Another Simulation
          </button>
        </div>
      )}
    </div>
  );
};

export default SimulationForm;
