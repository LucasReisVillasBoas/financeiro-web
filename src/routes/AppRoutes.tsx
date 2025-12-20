import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { PublicRoute } from './PublicRoute';
import { RequiresEmpresaRoute } from './RequiresEmpresaRoute';
import { OnboardingRoute } from './OnboardingRoute';

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

          {/* Onboarding - Only for users without empresa */}
          <Route
            path="/onboarding/empresa"
            element={
              <OnboardingRoute>
                <OnboardingEmpresa />
              </OnboardingRoute>
            }
          />

          {/* Protected Workspace - Requires Empresa */}
          <Route
            path="/dashboard"
            element={
              <RequiresEmpresaRoute>
                <MainWorkspace />
              </RequiresEmpresaRoute>
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
