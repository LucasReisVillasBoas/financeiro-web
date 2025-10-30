import React from 'react';
import { FiCreditCard } from 'react-icons/fi';
import type { ContaBancaria } from '../types/api.types';

interface ContaBancariaCardProps {
  conta: ContaBancaria;
  onVerExtrato: (id: string) => void;
  onConfigurar: (id: string) => void;
}

export const ContaBancariaCard: React.FC<ContaBancariaCardProps> = ({
  conta,
  onVerExtrato,
  onConfigurar,
}) => {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-lg shadow-md p-6 border border-[var(--color-border)] relative">
      {/* Badge de Status */}
      <div className="absolute top-4 right-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            conta.ativo
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          {conta.ativo ? 'Ativa' : 'Inativa'}
        </span>
      </div>

      {/* Header com ícone e nome do banco */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <FiCreditCard className="text-blue-600 dark:text-blue-400" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{conta.banco}</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Ag: {conta.agencia} • Conta: {conta.conta}
          </p>
        </div>
      </div>

      {/* Tipo de Conta */}
      <div className="mb-4">
        <p className="text-xs text-[var(--color-text-secondary)] mb-1">Tipo de Conta</p>
        <p className="text-sm font-medium text-[var(--color-text)]">{conta.tipoConta}</p>
      </div>

      {/* Saldo Disponível */}
      <div className="mb-6">
        <p className="text-xs text-[var(--color-text-secondary)] mb-1">Saldo Disponível</p>
        <p className="text-2xl font-bold text-[var(--color-text-primary)]">
          {formatarMoeda(conta.saldoDisponivel)}
        </p>
      </div>

      {/* Botões de ação */}
      <div className="flex gap-3">
        <button
          onClick={() => onVerExtrato(conta.id)}
          className="flex-1 py-2 px-4 border border-[var(--color-border)] text-[var(--color-text)] rounded-md hover:bg-[var(--color-bg)] transition-colors text-sm font-medium"
        >
          Ver Extrato
        </button>
        <button
          onClick={() => onConfigurar(conta.id)}
          className="flex-1 py-2 px-4 border border-[var(--color-border)] text-[var(--color-text)] rounded-md hover:bg-[var(--color-bg)] transition-colors text-sm font-medium"
        >
          Configurar
        </button>
      </div>
    </div>
  );
};
