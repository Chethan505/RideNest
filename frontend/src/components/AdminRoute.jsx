import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // If not logged in or not an ADMIN, redirect to admin-login
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

export default AdminRoute;
