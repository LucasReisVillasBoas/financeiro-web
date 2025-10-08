import React from "react";

export const DashboardSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="p-4 bg-[var(--color-surface)] dark:bg-[var(--color-bg)] rounded-md shadow flex flex-col">
        <span className="text-[var(--color-text-secondary)]">
          Total Recebível
        </span>
        <span className="mt-2 text-[var(--color-receivable)] font-bold text-xl">
          R$ 50.000
        </span>
      </div>

      <div className="p-4 bg-[var(--color-surface)] dark:bg-[var(--color-bg)] rounded-md shadow flex flex-col">
        <span className="text-[var(--color-text-secondary)]">
          Total a Pagar
        </span>
        <span className="mt-2 text-[var(--color-payable)] font-bold text-xl">
          R$ 20.000
        </span>
      </div>

      <div className="p-4 bg-[var(--color-surface)] dark:bg-[var(--color-bg)] rounded-md shadow flex flex-col">
        <span className="text-[var(--color-text-secondary)]">
          Contas Quitadas
        </span>
        <span className="mt-2 text-[var(--color-settled)] font-bold text-xl">
          R$ 100.000
        </span>
      </div>

      <div className="p-4 bg-[var(--color-surface)] dark:bg-[var(--color-bg)] rounded-md shadow flex flex-col">
        <span className="text-[var(--color-text-secondary)]">Pendências</span>
        <span className="mt-2 text-[var(--color-warning)] font-bold text-xl">
          R$ 5.000
        </span>
      </div>

      <div className="p-4 bg-[var(--color-surface)] dark:bg-[var(--color-bg)] rounded-md shadow flex flex-col">
        <span className="text-[var(--color-text-secondary)]">Informações</span>
        <span className="mt-2 text-[var(--color-info)] font-bold text-xl">
          Tudo em dia
        </span>
      </div>
    </div>
  );
};