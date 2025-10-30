import React, { useState, useEffect } from 'react';
import { contaPagarService } from '../../../services/conta-pagar.service';
import { contaReceberService } from '../../../services/conta-receber.service';
import type { ContaPagar, ContaReceber } from '../../../types/api.types';

export const DashboardSection: React.FC = () => {
  const [totalRecebivel, setTotalRecebivel] = useState<number>(0);
  const [totalPagar, setTotalPagar] = useState<number>(0);
  const [contasQuitadas, setContasQuitadas] = useState<number>(0);
  const [pendencias, setPendencias] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDadosFinanceiros();
  }, []);

  const carregarDadosFinanceiros = async () => {
    try {
      setLoading(true);

      // Buscar contas a pagar e a receber
      const [contasPagar, contasReceber] = await Promise.all([
        contaPagarService.findAll(),
        contaReceberService.findAll(),
      ]);

      // Calcular Total a Receber (contas pendentes)
      const totalAReceber = contasReceber
        .filter((conta: ContaReceber) => conta.status === 'Pendente')
        .reduce((acc: number, conta: ContaReceber) => acc + conta.valor, 0);
      setTotalRecebivel(totalAReceber);

      // Calcular Total a Pagar (contas pendentes)
      const totalAPagar = contasPagar
        .filter((conta: ContaPagar) => conta.status === 'Pendente')
        .reduce((acc: number, conta: ContaPagar) => acc + conta.valor, 0);
      setTotalPagar(totalAPagar);

      // Calcular Contas Quitadas (soma de pagas + recebidas)
      const totalPagas = contasPagar
        .filter((conta: ContaPagar) => conta.status === 'Paga')
        .reduce((acc: number, conta: ContaPagar) => acc + conta.valor, 0);

      const totalRecebidas = contasReceber
        .filter((conta: ContaReceber) => conta.status === 'Recebida')
        .reduce((acc: number, conta: ContaReceber) => acc + conta.valor, 0);

      setContasQuitadas(totalPagas + totalRecebidas);

      // Calcular Pendências (contas vencidas)
      const hoje = new Date().toISOString().split('T')[0];

      const contasPagarVencidas = contasPagar
        .filter((conta: ContaPagar) =>
          (conta.status === 'Pendente' || conta.status === 'Vencida') &&
          conta.vencimento < hoje
        )
        .reduce((acc: number, conta: ContaPagar) => acc + conta.valor, 0);

      const contasReceberVencidas = contasReceber
        .filter((conta: ContaReceber) =>
          conta.status === 'Pendente' &&
          conta.vencimento < hoje
        )
        .reduce((acc: number, conta: ContaReceber) => acc + conta.valor, 0);

      setPendencias(contasPagarVencidas + contasReceberVencidas);

    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err);
    } finally {
      setLoading(false);
    }
  };

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
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="p-4 bg-[var(--color-surface)] dark:bg-[var(--color-bg)] rounded-md shadow flex flex-col animate-pulse">
            <div className="h-4 bg-[var(--color-border)] rounded w-1/2 mb-3"></div>
            <div className="h-6 bg-[var(--color-border)] rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Cartão Recebível */}
      <div className="p-4 bg-[var(--color-surface)] rounded-md shadow flex flex-col">
        <span className="text-[var(--color-text-secondary)]">Total Recebível</span>
        <span className="mt-2 text-[var(--color-receivable)] font-bold text-xl">
          {formatCurrency(totalRecebivel)}
        </span>
      </div>

      {/* Cartão a Pagar */}
      <div className="p-4 bg-[var(--color-surface)] rounded-md shadow flex flex-col">
        <span className="text-[var(--color-text-secondary)]">Total a Pagar</span>
        <span className="mt-2 text-[var(--color-payable)] font-bold text-xl">
          {formatCurrency(totalPagar)}
        </span>
      </div>

      {/* Cartão Contas Quitadas */}
      <div className="p-4 bg-[var(--color-surface)] rounded-md shadow flex flex-col">
        <span className="text-[var(--color-text-secondary)]">Contas Quitadas</span>
        <span className="mt-2 text-[var(--color-settled)] font-bold text-xl">
          {formatCurrency(contasQuitadas)}
        </span>
      </div>

      {/* Cartão Pendências */}
      <div className="p-4 bg-[var(--color-surface)] rounded-md shadow flex flex-col">
        <span className="text-[var(--color-text-secondary)]">Pendências</span>
        <span className="mt-2 text-[var(--color-warning)] font-bold text-xl">
          {formatCurrency(pendencias)}
        </span>
      </div>

      {/* Cartão Informações */}
      <div className="p-4 bg-[var(--color-surface)] rounded-md shadow flex flex-col">
        <span className="text-[var(--color-text-secondary)]">Informações</span>
        <span className="mt-2 text-[var(--color-info)] font-bold text-xl">
          {/* TODO: alterar depois que tiver essa feture no backend */}
          {formatInfo(null)}
        </span>
      </div>
    </div>
  );
};
