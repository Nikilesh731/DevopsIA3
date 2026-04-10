import React from 'react';
import { getStatusColor } from '../../utils/formatters';

const StatusBadge = ({ status }) => {
  const color = getStatusColor(status);
  
  return (
    <span 
      className="status-badge"
      style={{ 
        backgroundColor: `${color}20`,
        color: color 
      }}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
