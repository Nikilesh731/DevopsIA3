import React, { useState, useEffect } from 'react';
import OverviewCards from '../features/dashboard/components/OverviewCards';
import { getDashboardStats } from '../features/dashboard/services/dashboardApi';
import SectionHeader from '../components/common/SectionHeader';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <p style={{ color: '#666', fontSize: '16px' }}>Loading dashboard...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="page-container">
        <p style={{ color: '#d32f2f', fontSize: '16px' }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <SectionHeader title="Dashboard Overview" />
      
      <OverviewCards stats={stats} />
    </div>
  );
};

export default DashboardPage;
