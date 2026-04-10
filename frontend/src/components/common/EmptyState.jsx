import React from 'react';

const EmptyState = ({ title, message, children }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-title">{title}</div>
      <div className="empty-state-message">{message}</div>
      {children}
    </div>
  );
};

export default EmptyState;
