import React from 'react';
import { Navigate } from 'react-router-dom';

export default function RequireRole({ roles, children }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check JWT exp client-side and auto-logout on expiry
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.clear();
      return <Navigate to="/login" replace />;
    }
  } catch (e) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
