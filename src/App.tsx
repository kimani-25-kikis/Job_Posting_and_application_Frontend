import React from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import EmployerDashboard from './components/employer/EmployerDashboard';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import Navbar from './components/shared/Navbar';
import { selectCurrentUser, selectIsAuthenticated } from './store/slices/authSlice';
import { type RootState } from './store/store';

const App: React.FC = () => {
  const user = useSelector((state: RootState) => selectCurrentUser(state));
  const isAuthenticated = useSelector((state: RootState) => selectIsAuthenticated(state));

  // Determine theme class based on user type with null check
  const themeClass = user?.user_type === 'employer' ? 'employer-theme' : 'employee-theme';

  // Helper function to get dashboard path with null check
  const getDashboardPath = (): string => {
    if (!user) return '/login';
    return user.user_type === 'employer' ? '/employer/dashboard' : '/employee/dashboard';
  };

  return (
    <Router>
      <div className={`min-h-screen bg-gray-50 ${isAuthenticated ? themeClass : ''}`}>
        {isAuthenticated && <Navbar />}
        
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to={getDashboardPath()} />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register /> : <Navigate to={getDashboardPath()} />} 
          />
          <Route 
            path="/employer/dashboard" 
            element={
              isAuthenticated && user?.user_type === 'employer' ? 
                <EmployerDashboard /> : 
                <Navigate to="/login" />
            } 
          />
          <Route 
            path="/employee/dashboard" 
            element={
              isAuthenticated && user?.user_type === 'employee' ? 
                <EmployeeDashboard /> : 
                <Navigate to="/login" />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
                <Navigate to={getDashboardPath()} /> :
                <Navigate to="/login" />
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? getDashboardPath() : '/login'} />} 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;