import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './AuthPage';
import DashboardPage from './DashboardPage';
import AppointmentsPage from './AppointmentsPage';
import ProfilePage from './ProfilePage';
import AccountDetailsPage from './AccountDetailsPage';

// A helper component to protect routes
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/auth" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        
        {/* --- PROTECTED ROUTES --- */}
        <Route 
          path="/" 
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} 
        />
        <Route 
          path="/appointments" 
          element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} 
        />
        <Route 
          path="/profile" 
          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} 
        />
        <Route 
          path="/account/:id" 
          element={<ProtectedRoute><AccountDetailsPage /></ProtectedRoute>} 
        />

        {/* Redirect any unknown route to login */}
        <Route path="*" element={<Navigate to="/auth" />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;