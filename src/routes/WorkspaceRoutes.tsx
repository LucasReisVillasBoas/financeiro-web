import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { WorkspaceLayout } from '../components/workspace/WorkspaceLayout';

import DashboardHome from '../pages/dashboard/DashboardHome';
import AccountsReceivable from '../pages/dashboard/AccountsReceivable';
import AccountsPayable from '../pages/dashboard/AccountsPayable';
import NotFoundPage from '../pages/NotFoundPage';

export const WorkspaceRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<WorkspaceLayoutWithOutlet />}>
        <Route index element={<DashboardHome />} />
        <Route path="receivable" element={<AccountsReceivable />} />
        <Route path="payable" element={<AccountsPayable />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Redirecionamento raiz */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const WorkspaceLayoutWithOutlet: React.FC = () => {
  return (
    <WorkspaceLayout title="Dashboard">
      <Outlet />
    </WorkspaceLayout>
  );
};
