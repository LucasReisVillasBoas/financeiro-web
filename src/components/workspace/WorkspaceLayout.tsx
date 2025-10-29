import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Outlet, useLocation } from "react-router-dom";

interface WorkspaceLayoutProps {
  title?: string;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({ title }) => {
  const location = useLocation();

  let headerTitle = title || "Dashboard";
  if (location.pathname.includes("receivable"))
    headerTitle = "Contas a Receber";
  if (location.pathname.includes("payable")) headerTitle = "Contas a Pagar";

  return (
    <div className="flex h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={headerTitle} />
        <main className="flex-1 p-6 overflow-auto">
          {/* Renderiza o conteúdo das rotas filhas */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};
