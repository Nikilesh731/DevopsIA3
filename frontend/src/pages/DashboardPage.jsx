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

  if (loading) return <div className="page-container">Loading dashboard...</div>;
  if (error) return <div className="page-container">Error: {error}</div>;

  return (
    <div className="page-container">
      <SectionHeader title="Dashboard Overview" />
      
      <OverviewCards stats={stats} />
    </div>
  );
};

export default DashboardPage;
