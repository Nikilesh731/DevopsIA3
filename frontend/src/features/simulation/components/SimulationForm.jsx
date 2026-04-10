import React, { useState } from 'react';
import { runSimulation } from '../services/simulationApi';

const SimulationForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    regionId: '',
    spreadFactor: '0.1'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    try {
      const result = await runSimulation(
        parseInt(formData.regionId),
        parseFloat(formData.spreadFactor)
      );
      onSuccess(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Run Epidemic Simulation</h3>
      {error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Source Region ID</label>
          <input
            type="number"
            name="regionId"
            value={formData.regionId}
            onChange={handleChange}
            className="form-input"
            required
            min="1"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Spread Factor (0-1)</label>
          <input
            type="number"
            name="spreadFactor"
            value={formData.spreadFactor}
            onChange={handleChange}
            className="form-input"
            required
            min="0"
            max="1"
            step="0.01"
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Running Simulation...' : 'Run Simulation'}
        </button>
      </form>
    </div>
  );
};

export default SimulationForm;
