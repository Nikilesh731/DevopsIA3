import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import DashboardPage from '../pages/DashboardPage';
import RegionsPage from '../pages/RegionsPage';
import SimulationPage from '../pages/SimulationPage';
import ResourcesPage from '../pages/ResourcesPage';
import FaultsPage from '../pages/FaultsPage';

const AppRouter = () => {
  return (
    <div className="app">
      <Sidebar />
      <div className="main-layout">
        <Topbar />
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/regions" element={<RegionsPage />} />
          <Route path="/simulation" element={<SimulationPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/faults" element={<FaultsPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default AppRouter;
