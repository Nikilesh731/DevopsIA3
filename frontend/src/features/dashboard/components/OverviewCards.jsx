import React from 'react';
import StatCard from '../../../components/common/StatCard';
import StatusBadge from '../../../components/common/StatusBadge';
import { formatNumber } from '../../../utils/formatters';

const OverviewCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-4">
      <StatCard 
        value={formatNumber(stats.totalRegions)} 
        label="Total Regions" 
        color="#3b82f6"
      />
      <StatCard 
        value={formatNumber(stats.totalInfections)} 
        label="Total Infections" 
        color="#ef4444"
      />
      <StatCard 
        value={formatNumber(stats.totalAllocations)} 
        label="Resource Allocations" 
        color="#10b981"
      />
      <StatCard 
        value={formatNumber(stats.servicesUp)} 
        label="Services Up" 
        color="#10b981"
      />
    </div>
  );
};

export default OverviewCards;
