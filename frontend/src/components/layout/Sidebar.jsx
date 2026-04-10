import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const Sidebar = () => {
  const navItems = [
    { path: ROUTES.DASHBOARD, label: 'Dashboard' },
    { path: ROUTES.REGIONS, label: 'Regions' },
    { path: ROUTES.SIMULATION, label: 'Simulation' },
    { path: ROUTES.RESOURCES, label: 'Resources' },
    { path: ROUTES.FAULTS, label: 'Faults' },
  ];

  return (
    <aside className="sidebar">
      <nav>
        <ul className="sidebar-nav">
          {navItems.map((item) => (
            <li key={item.path} className="sidebar-nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-nav-link ${isActive ? 'active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
