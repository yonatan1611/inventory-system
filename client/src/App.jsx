import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Login from './pages/Login';
import Products from './pages/Products';
import TransactionHistory from './pages/TransactionHistory';
import Reports from './pages/Reports';
import ErrorBoundary from './components/error/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import Layout from './components/common/Layout';


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
    <div className="">
      
      <div className="">
        <Navbar />
        <main className="">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/transactions" element={<TransactionHistory />} />
            <Route path="/reports" element={<Reports />} />
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
                    <Layout>
                      <AppContent />
                    </Layout>
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