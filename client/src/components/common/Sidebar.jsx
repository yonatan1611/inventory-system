// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Box,
  Repeat,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  User,
} from 'lucide-react';

const menuItems = [
  { path: '/', Icon: Home, label: 'Dashboard' },
  { path: '/products', Icon: Box, label: 'Products' },
  { path: '/transactions', Icon: Repeat, label: 'Transactions' },
  { path: '/reports', Icon: BarChart2, label: 'Reports' },
];

export default function Sidebar({ collapsed, onToggleCollapse, onLogout, user }) {
  const location = useLocation();

  const userName = user?.name || (user?.username ? user.username : 'Admin');
  const initials = (userName || 'A').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();

  return (
    <aside
      aria-label="Primary navigation"
      className={`fixed top-0 left-0 h-full z-30 flex flex-col
        bg-white shadow-lg
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Brand / collapse */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className={`flex-shrink-0 rounded-lg flex items-center justify-center text-white font-bold
              ${collapsed ? 'w-10 h-10' : 'w-11 h-11'} bg-gradient-to-br from-indigo-600 to-purple-600 shadow-md`}
          >
            FERE
          </div>

          {!collapsed && (
            <div>
              <div className="text-sm font-bold text-gray-900">FERE CLOTH</div>
              <div className="text-xs text-gray-500">Manage your store</div>
            </div>
          )}
        </div>

        <button
          className="p-1 rounded hover:bg-gray-100 transition"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map(({ path, Icon, label }) => (
            <li key={path}>
              <NavLink
                to={path}
                end={path === '/dashboard'}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-sm
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                }
                aria-current={location.pathname === path ? 'page' : undefined}
                title={label}
              >
                <span className="flex-shrink-0">
                  <Icon className={`w-5 h-5 ${location.pathname === path ? 'text-indigo-600' : 'text-gray-500'}`} />
                </span>

                {/* Label hides when collapsed */}
                <span className={`truncate ${collapsed ? 'hidden' : 'block'}`}>{label}</span>
                
                {/* Active indicator */}
                {location.pathname === path && !collapsed && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-indigo-600"></div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
        
        {/* Additional links */}
        {!collapsed && (
          <div className="mt-8 px-3">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
              Account
            </div>
            <ul className="space-y-1">
              <li>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-sm
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                  }
                >
                  <User className="w-5 h-5 text-gray-500" />
                  <span className="truncate">Profile</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-sm
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                  }
                >
                  <Settings className="w-5 h-5 text-gray-500" />
                  <span className="truncate">Settings</span>
                </NavLink>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* Footer: user info + logout */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium shadow">
            {initials}
          </div>
          
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{userName}</div>
              <div className="text-xs text-gray-500 truncate">{user?.role || 'Admin'}</div>
            </div>
          )}
          
          <button
            onClick={onLogout}
            className="p-2 rounded hover:bg-gray-100 transition"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </aside>
  );
}