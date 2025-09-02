import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Login from './pages/Login';
import Products from './pages/Products';
import ErrorBoundary from './components/error/ErrorBoundary';


function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto ml-64 mt-16 p-6">
          <Routes>
            {/* <Route path="/" element={<Dashboard />} /> */}

            <Route path="/products" element={<Products />} />
            {/* <Route path="/transactions" element={<Transactions />} /> */}
            {/* <Route path="/reports" element={<Reports />} /> */}
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <ErrorBoundary>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={
                <ProtectedRoute>
                  <AppContent />
                </ProtectedRoute>
              } />
            </Routes>
          </ErrorBoundary>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;