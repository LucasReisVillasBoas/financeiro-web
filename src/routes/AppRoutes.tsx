import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { PublicRoute } from './PublicRoute';
import { ProtectedRoute } from './ProtectedRoute';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import { MainWorkspace } from '../pages/dashboard/MainWorkspace';
import NotFoundPage from '../pages/NotFoundPage';
import { OnboardingEmpresa } from '../pages/onboarding/OnboardingEmpresa';

export const AppRoutes: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Onboarding */}
          <Route
            path="/onboarding/empresa"
            element={
              <ProtectedRoute>
                <OnboardingEmpresa />
              </ProtectedRoute>
            }
          />

          {/* Protected Workspace */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainWorkspace />
              </ProtectedRoute>
            }
          />

          {/* Redirecionamento raiz */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404 global */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};
