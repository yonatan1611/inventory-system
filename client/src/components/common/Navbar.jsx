import React from 'react';
import { useAuth } from '../../contexts/authContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-primary">Inventory System</h1>
      <div className="flex items-center space-x-4">
        <span className="text-secondary">
          <i className="bi bi-person-circle mr-2"></i>
          {user ? 'Admin' : 'Guest'}
        </span>
        {user && (
          <button
            onClick={logout}
            className="bg-danger text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;