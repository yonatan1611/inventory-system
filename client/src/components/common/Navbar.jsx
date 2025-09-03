// src/components/layout/Navbar.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Menu, X, User, LogOut, Settings, Search, BarChart3, Package, CreditCard, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const location = useLocation();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function onDocClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const userName = user?.name || (user?.username ? user.username : 'Admin');
  const initials = (userName || 'A').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();

  // Navigation items
  const navItems = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/products', label: 'Products', icon: Package },
    { path: '/transactions', label: 'Transactions', icon: CreditCard },
    { path: '/reports', label: 'Reports', icon: FileText },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: brand */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="px-5 h-12 rounded-full bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-500 flex items-center shadow-lg border-2 border-white">
                <span className="font-extrabold text-lg text-white tracking-wide drop-shadow-lg">FERE CLOTH</span>
                <svg className="w-6 h-6 ml-2 text-white opacity-80" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 12h8M12 8v8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <div className="text-xl font-extrabold text-gray-900 tracking-tight">FERE CLOTH</div>
                <div className="text-xs text-gray-500">Manage your store</div>
              </div>
            </Link>
          </div>

          {/* Middle: desktop navigation */}
          <nav className="hidden md:flex items-center space-x-1 mx-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: actions */}
          <div className="flex items-center gap-3">
            {/* Search button (mobile) */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>

            {/* Search (desktop) */}
            <div className="hidden md:block relative" ref={searchRef}>
              <div className="relative">
                <input
                  className="w-64 rounded-full border border-gray-200 px-4 py-2 pl-10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                  placeholder="Search products, customers..."
                />
                <Search className="w-4 h-4 left-3 top-1/2 -translate-y-1/2 absolute text-gray-400" />
              </div>
              
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-3"
                  >
                    <div className="text-sm text-gray-500">Recent searches</div>
                    <div className="mt-2 space-y-1">
                      <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">Wireless headphones</div>
                      <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">Smart watches</div>
                      <div className="p-2 hover:bg-gray-50 rounded cursor-pointer">Customer: John Smith</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* notification */}
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition relative"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100 transition"
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium shadow">
                  {initials}
                </div>
                <div className="hidden lg:flex flex-col items-start leading-tight">
                  <span className="text-sm font-medium text-gray-900">{userName}</span>
                  <span className="text-xs text-gray-500">{user?.role || 'Admin'}</span>
                </div>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden"
                  >
                    <div className="p-2 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">{userName}</div>
                      <div className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</div>
                    </div>
                    <div className="py-1">
                      <Link 
                        to="/profile" 
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                        onClick={() => setProfileOpen(false)}
                      >
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link 
                        to="/settings" 
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                        onClick={() => setProfileOpen(false)}
                      >
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      <button
                        onClick={() => { setProfileOpen(false); logout(); }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* mobile menu toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-md hover:bg-gray-100 transition"
                aria-label="Open menu"
              >
                {mobileOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search panel */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 bg-white"
          >
            <div className="px-4 py-3">
              <div className="relative">
                <input
                  autoFocus
                  className="w-full rounded-full border border-gray-200 px-4 py-2 pl-10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Search products, customers..."
                />
                <Search className="w-4 h-4 left-3 top-1/2 -translate-y-1/2 absolute text-gray-400" />
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setSearchOpen(false)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* mobile navigation panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-gray-200 bg-white"
          >
            <div className="px-2 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Link>
                );
              })}
              
              <div className="pt-2 border-t border-gray-200 mt-2">
                <Link 
                  to="/profile" 
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  <User className="w-5 h-5 mr-3" /> Profile
                </Link>
                <Link 
                  to="/settings" 
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  <Settings className="w-5 h-5 mr-3" /> Settings
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); logout(); }}
                  className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  <LogOut className="w-5 h-5 mr-3" /> Logout
                </button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}