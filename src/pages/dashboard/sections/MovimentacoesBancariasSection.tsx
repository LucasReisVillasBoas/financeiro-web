import React, { useState, useEffect } from 'react';
import {
  FiDownload,
  FiSearch,
  FiFilter,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiDollarSign,
  FiCheckCircle,
  FiCircle,
  FiXCircle,
} from 'react-icons/fi';
import { movimentacaoBancariaService } from '../../../services/movimentacao-bancaria.service';
import type { MovimentacaoBancaria } from '../../../types/api.types';

export const MovimentacoesBancariasSection: React.FC = () => {
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoBancaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('Todos');
  const [filterConciliado, setFilterConciliado] = useState('Todos');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [conciliandoLoading, setConciliandoLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadMovimentacoes();
  }, []);

  const loadMovimentacoes = async () => {
    try {
      setLoading(true);
      const data = await movimentacaoBancariaService.findAll();
      setMovimentacoes(data);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao carregar movimentações');
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarDataHora = (data: string) => {
    return new Date(data).toLocaleString('pt-BR');
  };

  const totalEntradas = movimentacoes
    .filter(m => m.tipoMovimento === 'Entrada')
    .reduce((acc, m) => acc + m.valor, 0);

  const totalSaidas = movimentacoes
    .filter(m => m.tipoMovimento === 'Saída')
    .reduce((acc, m) => acc + m.valor, 0);

  const saldoPeriodo = totalEntradas - totalSaidas;
  const qtdEntradas = movimentacoes.filter(m => m.tipoMovimento === 'Entrada').length;
  const qtdSaidas = movimentacoes.filter(m => m.tipoMovimento === 'Saída').length;
  const qtdConciliadas = movimentacoes.filter(m => m.conciliado === 'S').length;
  const qtdNaoConciliadas = movimentacoes.filter(m => m.conciliado === 'N').length;

  const movimentacoesFiltradas = movimentacoes.filter(mov => {
    const matchSearch =
      mov.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.conta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.categoria.toLowerCase().includes(searchTerm.toLowerCase());

    const matchTipo = filterTipo === 'Todos' || mov.tipoMovimento === filterTipo;
    const matchConciliado =
      filterConciliado === 'Todos' ||
      (filterConciliado === 'Conciliadas' && mov.conciliado === 'S') ||
      (filterConciliado === 'Não Conciliadas' && mov.conciliado === 'N');

    return matchSearch && matchTipo && matchConciliado;
  });

  const handleToggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleToggleAll = () => {
    if (selectedIds.size === movimentacoesFiltradas.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(movimentacoesFiltradas.map(m => m.id)));
    }
  };

  const handleConciliar = async () => {
    if (selectedIds.size === 0) {
      setError('Selecione ao menos uma movimentação');
      return;
    }

    try {
      setConciliandoLoading(true);
      setError('');
      setSuccessMessage('');

      const result = await movimentacaoBancariaService.conciliar({
        movimentacaoIds: Array.from(selectedIds),
      });

      setSuccessMessage(`${result.conciliadas} movimentação(ões) conciliada(s) com sucesso!`);

      if (result.erros.length > 0) {
        setError(`Avisos: ${result.erros.join(', ')}`);
      }

      // Recarregar movimentações
      await loadMovimentacoes();
      setSelectedIds(new Set());
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao conciliar movimentações');
    } finally {
      setConciliandoLoading(false);
    }
  };

  const handleDesconciliar = async () => {
    if (selectedIds.size === 0) {
      setError('Selecione ao menos uma movimentação');
      return;
    }

    try {
      setConciliandoLoading(true);
      setError('');
      setSuccessMessage('');

      const result = await movimentacaoBancariaService.desconciliar({
        movimentacaoIds: Array.from(selectedIds),
      });

      setSuccessMessage(`${result.desconciliadas} movimentação(ões) desconciliada(s) com sucesso!`);

      if (result.erros.length > 0) {
        setError(`Avisos: ${result.erros.join(', ')}`);
      }

      // Recarregar movimentações
      await loadMovimentacoes();
      setSelectedIds(new Set());
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao desconciliar movimentações');
    } finally {
      setConciliandoLoading(false);
    }
  };

  const handleExportar = () => {
    // TODO: Implementar exportação
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            Movimentações Bancárias
          </h1>
          <p className="text-[var(--color-text-secondary)]">Histórico completo de transações</p>
        </div>
        <button
          onClick={handleExportar}
          className="flex items-center gap-2 px-4 py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-md hover:bg-[var(--color-bg)] transition-colors font-medium"
        >
          <FiDownload size={18} />
          Exportar
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Entradas */}
        <div className="bg-[var(--color-surface)] rounded-lg shadow-md p-5 border border-[var(--color-border)]">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">
              Total Entradas
            </h3>
            <FiArrowDownLeft size={18} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-500 mb-1">{formatarMoeda(totalEntradas)}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">{qtdEntradas} transações</p>
        </div>

        {/* Total Saídas */}
        <div className="bg-[var(--color-surface)] rounded-lg shadow-md p-5 border border-[var(--color-border)]">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">Total Saídas</h3>
            <FiArrowUpRight size={18} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-500 mb-1">{formatarMoeda(totalSaidas)}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">{qtdSaidas} transações</p>
        </div>

        {/* Saldo do Período */}
        <div className="bg-[var(--color-surface)] rounded-lg shadow-md p-5 border border-[var(--color-border)]">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">
              Saldo do Período
            </h3>
            <FiDollarSign size={18} className="text-[var(--color-text-secondary)]" />
          </div>
          <p
            className={`text-2xl font-bold mb-1 ${
              saldoPeriodo >= 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {formatarMoeda(saldoPeriodo)}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {saldoPeriodo >= 0 ? 'Positivo' : 'Negativo'}
          </p>
        </div>

        {/* Conciliações */}
        <div className="bg-[var(--color-surface)] rounded-lg shadow-md p-5 border border-[var(--color-border)]">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">Conciliações</h3>
            <FiCheckCircle size={18} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-500 mb-1">{qtdConciliadas}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {qtdNaoConciliadas} pendentes
          </p>
        </div>
      </div>

      {/* Mensagem de sucesso */}
      {successMessage && (
        <div className="p-4 bg-green-600 dark:bg-green-700 text-white rounded-md font-medium">
          {successMessage}
        </div>
      )}

      {/* Mensagem de erro */}
      {error && (
        <div className="p-4 bg-red-600 dark:bg-red-700 text-white rounded-md font-medium">
          {error}
        </div>
      )}

      {/* Histórico de Movimentações */}
      <div className="bg-[var(--color-surface)] rounded-lg shadow-md border border-[var(--color-border)]">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
              Histórico de Movimentações
            </h2>

            {/* Botões de Conciliação */}
            {selectedIds.size > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleConciliar}
                  disabled={conciliandoLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors font-medium disabled:opacity-50"
                >
                  <FiCheckCircle size={18} />
                  Conciliar ({selectedIds.size})
                </button>
                <button
                  onClick={handleDesconciliar}
                  disabled={conciliandoLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors font-medium disabled:opacity-50"
                >
                  <FiXCircle size={18} />
                  Desconciliar ({selectedIds.size})
                </button>
              </div>
            )}
          </div>

          {/* Barra de busca e filtros */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <FiSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)]"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-md bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div className="relative">
              <select
                value={filterTipo}
                onChange={e => setFilterTipo(e.target.value)}
                className="pl-4 pr-10 py-2 border border-[var(--color-border)] rounded-md bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none cursor-pointer min-w-[120px]"
              >
                <option value="Todos">Todos os Tipos</option>
                <option value="Entrada">Entradas</option>
                <option value="Saída">Saídas</option>
              </select>
              <FiFilter
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none"
                size={18}
              />
            </div>
            <div className="relative">
              <select
                value={filterConciliado}
                onChange={e => setFilterConciliado(e.target.value)}
                className="pl-4 pr-10 py-2 border border-[var(--color-border)] rounded-md bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none cursor-pointer min-w-[160px]"
              >
                <option value="Todos">Todas</option>
                <option value="Conciliadas">Conciliadas</option>
                <option value="Não Conciliadas">Não Conciliadas</option>
              </select>
              <FiFilter
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none"
                size={18}
              />
            </div>
          </div>

          {/* Tabela */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
              <p className="mt-4 text-[var(--color-text-secondary)]">Carregando movimentações...</p>
            </div>
          ) : movimentacoesFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--color-text-secondary)]">Nenhuma movimentação encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-[var(--color-text-secondary)]">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === movimentacoesFiltradas.length}
                        onChange={handleToggleAll}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[var(--color-text-secondary)]">
                      Data
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[var(--color-text-secondary)]">
                      Descrição
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[var(--color-text-secondary)]">
                      Conta
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[var(--color-text-secondary)]">
                      Categoria
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-[var(--color-text-secondary)]">
                      Valor
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-[var(--color-text-secondary)]">
                      Tipo
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-[var(--color-text-secondary)]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {movimentacoesFiltradas.map(mov => (
                    <tr
                      key={mov.id}
                      className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors"
                    >
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(mov.id)}
                          onChange={() => handleToggleSelection(mov.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-4 text-sm text-[var(--color-text)]">
                        {formatarData(mov.dataMovimento)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-[var(--color-text)] font-medium">
                          {mov.descricao}
                        </div>
                        {mov.observacao && (
                          <div className="text-xs text-[var(--color-text-secondary)] mt-1">
                            {mov.observacao}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm text-[var(--color-text-secondary)]">
                        {mov.conta}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 whitespace-nowrap">
                          {mov.categoria}
                        </span>
                      </td>
                      <td
                        className={`py-4 px-4 text-sm font-semibold text-right ${
                          mov.tipoMovimento === 'Entrada' ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {mov.tipoMovimento === 'Entrada' ? '+' : '−'} {formatarMoeda(mov.valor)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            mov.tipoMovimento === 'Entrada'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          }`}
                        >
                          {mov.tipoMovimento === 'Entrada' ? (
                            <>
                              <FiArrowDownLeft size={12} />
                              Entrada
                            </>
                          ) : (
                            <>
                              <FiArrowUpRight size={12} />
                              Saída
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col items-center gap-1">
                          {mov.conciliado === 'S' ? (
                            <>
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                <FiCheckCircle size={12} />
                                Conciliada
                              </span>
                              {mov.conciliadoEm && (
                                <span
                                  className="text-xs text-[var(--color-text-secondary)]"
                                  title={`Conciliada em ${formatarDataHora(mov.conciliadoEm)}`}
                                >
                                  {formatarData(mov.conciliadoEm)}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                              <FiCircle size={12} />
                              Pendente
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
