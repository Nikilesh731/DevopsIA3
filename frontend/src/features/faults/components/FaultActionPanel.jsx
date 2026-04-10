import React, { useState } from 'react';
import { failService, recoverService } from '../services/faultApi';

const FaultActionPanel = ({ onSuccess }) => {
  const [selectedService, setSelectedService] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const services = [
    'region-service',
    'simulation-service', 
    'resource-service'
  ];

  const handleFail = async () => {
    if (!selectedService) {
      setError('Please select a service');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await failService(selectedService);
      onSuccess();
      setSelectedService('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async () => {
    if (!selectedService) {
      setError('Please select a service');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await recoverService(selectedService);
      onSuccess();
      setSelectedService('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Service Fault Actions</h3>
      {error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}
      
      <div className="form-group">
        <label className="form-label">Select Service</label>
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="form-select"
        >
          <option value="">Choose a service...</option>
          {services.map(service => (
            <option key={service} value={service}>{service}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          onClick={handleFail} 
          className="btn btn-danger" 
          disabled={loading || !selectedService}
        >
          {loading ? 'Processing...' : 'Fail Service'}
        </button>
        
        <button 
          onClick={handleRecover} 
          className="btn btn-success" 
          disabled={loading || !selectedService}
        >
          {loading ? 'Processing...' : 'Recover Service'}
        </button>
      </div>
    </div>
  );
};

export default FaultActionPanel;
