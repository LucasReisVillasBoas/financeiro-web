import React from 'react';

const DashboardHome: React.FC = () => {
  const formatCurrency = (value: number | null): string => {
    if (value === null || value === undefined) {
      return 'R$ 0,00';
    }
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatInfo = (value: string | null): string => {
    if (!value) {
      return 'Nenhuma informação crítica no momento.';
    }
    return value;
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="p-4 bg-[var(--color-surface)] rounded-md shadow flex flex-col">
        <span className="text-[var(--color-text-secondary)]">Total Recebível</span>
        <span className="mt-2 text-[var(--color-receivable)] font-bold text-xl">
          {formatCurrency(null)}
        </span>
      </div>

      <div className="p-4 bg-[var(--color-surface)] rounded-md shadow flex flex-col">
        <span className="text-[var(--color-text-secondary)]">Total a Pagar</span>
        <span className="mt-2 text-[var(--color-payable)] font-bold text-xl">
          {formatCurrency(null)}
        </span>
      </div>

      <div className="p-4 bg-[var(--color-surface)] rounded-md shadow flex flex-col">
        <span className="text-[var(--color-text-secondary)]">Contas Quitadas</span>
        <span className="mt-2 text-[var(--color-settled)] font-bold text-xl">
          {formatCurrency(null)}
        </span>
      </div>

      {/* Cartão Pendências */}
      <div className="p-4 bg-[var(--color-surface)] rounded-md shadow flex flex-col">
        <span className="text-[var(--color-text-secondary)]">Pendências</span>
        <span className="mt-2 text-[var(--color-warning)] font-bold text-xl">
          {formatCurrency(null)}
        </span>
      </div>

      <div className="p-4 bg-[var(--color-surface)] rounded-md shadow flex flex-col">
        <span className="text-[var(--color-text-secondary)]">Informações</span>
        <span className="mt-2 text-[var(--color-info)] font-bold text-xl">{formatInfo(null)}</span>
      </div>
    </div>
  );
};

export default DashboardHome;
