import React from 'react';

const SectionHeader = ({ title, children }) => {
  return (
    <div className="section-header">
      <h2 className="section-title">{title}</h2>
      {children}
    </div>
  );
};

export default SectionHeader;
