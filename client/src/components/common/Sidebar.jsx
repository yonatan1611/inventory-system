import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: 'bi-speedometer2', label: 'Dashboard' },
    { path: '/products', icon: 'bi-box-seam', label: 'Products' },
    { path: '/transactions', icon: 'bi-arrow-left-right', label: 'Transactions' },
    { path: '/reports', icon: 'bi-bar-chart', label: 'Reports' },
  ];

  return (
    <div className="bg-primary text-white w-64 h-screen fixed left-0 top-0 pt-16">
      <div className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center p-3 rounded hover:bg-secondary ${
                  location.pathname === item.path ? 'bg-secondary' : ''
                }`}
              >
                <i className={`${item.icon} mr-3`}></i>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;