import React, { useState, useEffect } from 'react';
import { FiPlus, FiEye, FiCreditCard, FiTrendingUp } from 'react-icons/fi';
import { contaBancariaService } from '../../../services/conta-bancaria.service';
import { ContaBancariaCard } from '../../../components/ContaBancariaCard';
import type { ContaBancaria } from '../../../types/api.types';

export const ContasBancariasSection: React.FC = () => {
  const [contas, setContas] = useState<ContaBancaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadContas();
  }, []);

  const loadContas = async () => {
    try {
      setLoading(true);
      const data = await contaBancariaService.findAll();
      setContas(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar contas bancárias');
    } finally {
      setLoading(false);
    }
  };

  const handleVerExtrato = (id: string) => {
    console.log('Ver extrato da conta:', id);
    // TODO: Implementar modal ou navegação para extrato
  };

  const handleConfigurar = (id: string) => {
    console.log('Configurar conta:', id);
    // TODO: Implementar modal ou navegação para configuração
  };

  const handleNovaConta = () => {
    console.log('Nova conta bancária');
    // TODO: Implementar modal ou navegação para criar nova conta
  };

  // Calcular estatísticas
  const saldoTotal = contas.reduce((acc, conta) => acc + conta.saldoDisponivel, 0);
  const contasAtivas = contas.filter(conta => conta.ativo).length;
  const totalContas = contas.length;

  // Calcular variação mensal (simulado por enquanto)
  const variacaoMensal = 12.5;

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            Contas Bancárias
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Gerencie suas contas e saldos bancários
          </p>
        </div>
        <button
          onClick={handleNovaConta}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors font-medium"
        >
          <FiPlus size={20} />
          Nova Conta
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Saldo Total */}
        <div className="bg-[var(--color-surface)] rounded-lg shadow-md p-6 border border-[var(--color-border)]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">Saldo Total</h3>
            <button className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
              <FiEye size={18} />
            </button>
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">
            {formatarMoeda(saldoTotal)}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">Todas as contas ativas</p>
        </div>

        {/* Contas Ativas */}
        <div className="bg-[var(--color-surface)] rounded-lg shadow-md p-6 border border-[var(--color-border)]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">
              Contas Ativas
            </h3>
            <FiCreditCard
              size={18}
              className="text-[var(--color-text-secondary)]"
            />
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">{contasAtivas}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">De {totalContas} contas totais</p>
        </div>

        {/* Variação Mensal */}
        <div className="bg-[var(--color-surface)] rounded-lg shadow-md p-6 border border-[var(--color-border)]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">
              Variação Mensal
            </h3>
            <FiTrendingUp size={18} className="text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-500 mb-1">+{variacaoMensal}%</p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Comparado ao mês anterior
          </p>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}

      {/* Lista de Contas */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
          <p className="mt-4 text-[var(--color-text-secondary)]">Carregando contas...</p>
        </div>
      ) : contas.length === 0 ? (
        <div className="text-center py-12 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
          <FiCreditCard size={48} className="mx-auto text-[var(--color-text-secondary)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
            Nenhuma conta cadastrada
          </h3>
          <p className="text-[var(--color-text-secondary)] mb-6">
            Comece adicionando sua primeira conta bancária
          </p>
          <button
            onClick={handleNovaConta}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors font-medium"
          >
            <FiPlus size={20} />
            Adicionar Conta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contas.map(conta => (
            <ContaBancariaCard
              key={conta.id}
              conta={conta}
              onVerExtrato={handleVerExtrato}
              onConfigurar={handleConfigurar}
            />
          ))}
        </div>
      )}
    </div>
  );
};
