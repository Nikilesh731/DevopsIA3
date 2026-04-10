import React from 'react';

const StatCard = ({ value, label, color }) => {
  return (
    <div className="card stat-card">
      <div className="stat-card-value" style={{ color }}>
        {value}
      </div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
};

export default StatCard;
