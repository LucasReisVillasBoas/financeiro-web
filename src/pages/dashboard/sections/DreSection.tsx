import React, { useState, useEffect, useCallback } from 'react';
import { empresaService, dreService } from '../../../services';
import {
  type Empresa,
  type DreResponseDto,
  type DreConsolidadoDto,
  type DreComparativoDto,
  type DreLinhaDto,
  TipoPlanoContas,
} from '../../../types/api.types';
import { useAuth } from '../../../context/AuthContext';

type ViewMode = 'simple' | 'consolidated' | 'comparative';

export const DreSection: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('simple');

  // Simple DRE state
  const [empresaId, setEmpresaId] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [dreData, setDreData] = useState<DreResponseDto | null>(null);

  // Consolidated DRE state
  const [selectedEmpresaIds, setSelectedEmpresaIds] = useState<string[]>([]);
  const [dreConsolidadoData, setDreConsolidadoData] = useState<DreConsolidadoDto | null>(null);

  // Comparative DRE state
  const [periodo1Inicio, setPeriodo1Inicio] = useState('');
  const [periodo1Fim, setPeriodo1Fim] = useState('');
  const [periodo2Inicio, setPeriodo2Inicio] = useState('');
  const [periodo2Fim, setPeriodo2Fim] = useState('');
  const [dreComparativoData, setDreComparativoData] = useState<DreComparativoDto | null>(null);

  const carregarEmpresas = useCallback(async () => {
    try {
      if (!user?.clienteId) return;
      const data = await empresaService.findByCliente(user.clienteId);
      setEmpresas(data);

      if (data.length > 0 && !empresaId) {
        setEmpresaId(data[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar empresas:', err);
    }
  }, [user?.clienteId, empresaId]);

  useEffect(() => {
    carregarEmpresas();
  }, [carregarEmpresas]);

  const handleGerarDreSimples = async () => {
    if (!empresaId || !dataInicio || !dataFim) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await dreService.gerarDre({
        empresaId,
        dataInicio,
        dataFim,
      });

      if (response.data) {
        setDreData(response.data);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Erro ao gerar DRE';
      setError(errorMessage);
      console.error('Erro ao gerar DRE:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGerarDreConsolidado = async () => {
    if (selectedEmpresaIds.length === 0 || !dataInicio || !dataFim) {
      setError('Por favor, selecione ao menos uma empresa e preencha as datas');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await dreService.gerarDreConsolidado(
        selectedEmpresaIds,
        dataInicio,
        dataFim
      );

      if (response.data) {
        setDreConsolidadoData(response.data);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Erro ao gerar DRE consolidado';
      setError(errorMessage);
      console.error('Erro ao gerar DRE consolidado:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGerarDreComparativo = async () => {
    if (!empresaId || !periodo1Inicio || !periodo1Fim || !periodo2Inicio || !periodo2Fim) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await dreService.gerarComparativo(
        empresaId,
        periodo1Inicio,
        periodo1Fim,
        periodo2Inicio,
        periodo2Fim
      );

      if (response.data) {
        setDreComparativoData(response.data);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Erro ao gerar DRE comparativo';
      setError(errorMessage);
      console.error('Erro ao gerar DRE comparativo:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleEmpresaSelection = (id: string) => {
    setSelectedEmpresaIds(prev =>
      prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]
    );
  };

  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const getTipoColor = (tipo: TipoPlanoContas): string => {
    switch (tipo) {
      case 'Receita':
        return 'text-green-600 dark:text-green-400';
      case 'Custo':
        return 'text-orange-600 dark:text-orange-400';
      case 'Despesa':
        return 'text-red-600 dark:text-red-400';
      case 'Outros':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-[var(--color-text)]';
    }
  };

  const renderLinhasDre = (linhas: DreLinhaDto[], tipo: TipoPlanoContas) => {
    if (!linhas || linhas.length === 0) {
      return (
        <tr>
          <td
            colSpan={4}
            className="px-6 py-4 text-center text-sm text-[var(--color-text-secondary)]"
          >
            Nenhum lançamento nesta categoria
          </td>
        </tr>
      );
    }

    return linhas.map((linha, index) => (
      <tr
        key={`${linha.contaId}-${index}`}
        className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]"
        style={{ paddingLeft: `${linha.nivel * 1}rem` }}
      >
        <td className="px-6 py-3 text-sm font-mono text-[var(--color-text)]">{linha.codigo}</td>
        <td className="px-6 py-3 text-sm text-[var(--color-text)]">
          <span style={{ paddingLeft: `${(linha.nivel - 1) * 1}rem` }}>{linha.descricao}</span>
        </td>
        <td className={`px-6 py-3 text-sm font-medium ${getTipoColor(tipo)}`}>{tipo}</td>
        <td className="px-6 py-3 text-sm font-semibold text-right text-[var(--color-text)]">
          {formatarMoeda(linha.valor)}
        </td>
      </tr>
    ));
  };

  const renderDreSimples = () => {
    if (!dreData || !dreData.totais) return null;

    return (
      <div className="bg-[var(--color-card)] rounded-lg shadow-md border border-[var(--color-border)] p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
            DRE - {dreData.empresaNome}
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Período: {new Date(dreData.dataInicio).toLocaleDateString('pt-BR')} até{' '}
            {new Date(dreData.dataFim).toLocaleDateString('pt-BR')}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Gerado em: {new Date(dreData.geradoEm).toLocaleString('pt-BR')} •{' '}
            {dreData.totalLancamentos} lançamentos
          </p>
        </div>

        {/* Receitas */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3">
            RECEITAS
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[var(--color-bg-secondary)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>{renderLinhasDre(dreData.receitas, TipoPlanoContas.RECEITA)}</tbody>
            </table>
          </div>
        </div>

        {/* Custos */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-3">
            CUSTOS
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[var(--color-bg-secondary)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>{renderLinhasDre(dreData.custos, TipoPlanoContas.CUSTO)}</tbody>
            </table>
          </div>
        </div>

        {/* Despesas */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3">DESPESAS</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[var(--color-bg-secondary)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>{renderLinhasDre(dreData.despesas, TipoPlanoContas.DESPESA)}</tbody>
            </table>
          </div>
        </div>

        {/* Outros */}
        {dreData.outros && dreData.outros.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3">OUTROS</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[var(--color-bg-secondary)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody>{renderLinhasDre(dreData.outros, TipoPlanoContas.OUTROS)}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* Totais */}
        <div className="border-t-2 border-[var(--color-border)] pt-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-[var(--color-text)]">
                  Total Receitas:
                </span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {formatarMoeda(dreData.totais.totalReceitas)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-[var(--color-text)]">Total Custos:</span>
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                  ({formatarMoeda(dreData.totais.totalCustos)})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-[var(--color-text)]">
                  Total Despesas:
                </span>
                <span className="text-sm font-bold text-red-600 dark:text-red-400">
                  ({formatarMoeda(dreData.totais.totalDespesas)})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-[var(--color-text)]">Total Outros:</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {formatarMoeda(dreData.totais.totalOutros)}
                </span>
              </div>
            </div>
            <div className="space-y-3 border-l border-[var(--color-border)] pl-4">
              <div className="flex justify-between">
                <span className="text-base font-semibold text-[var(--color-text-primary)]">
                  Lucro Operacional:
                </span>
                <span
                  className={`text-base font-bold ${
                    dreData.totais.lucroOperacional >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {formatarMoeda(dreData.totais.lucroOperacional)}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-[var(--color-border)]">
                <span className="text-lg font-bold text-[var(--color-text-primary)]">
                  Resultado Líquido:
                </span>
                <span
                  className={`text-lg font-bold ${
                    dreData.totais.resultadoLiquido >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {formatarMoeda(dreData.totais.resultadoLiquido)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDreConsolidado = () => {
    if (!dreConsolidadoData || !dreConsolidadoData.consolidado?.totais) return null;

    return (
      <div className="space-y-6">
        {/* DRE Consolidado */}
        <div className="bg-[var(--color-card)] rounded-lg shadow-md border border-[var(--color-border)] p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
              DRE Consolidado
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Período: {new Date(dreConsolidadoData.periodo.dataInicio).toLocaleDateString('pt-BR')}{' '}
              até {new Date(dreConsolidadoData.periodo.dataFim).toLocaleDateString('pt-BR')}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {dreConsolidadoData.empresas.length} empresa(s) consolidada(s)
            </p>
          </div>

          {/* Totais Consolidados */}
          <div className="border-t-2 border-[var(--color-border)] pt-6 mt-6">
            <h4 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              Resultados Consolidados
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-[var(--color-text)]">
                    Total Receitas:
                  </span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    {formatarMoeda(dreConsolidadoData.consolidado.totais.totalReceitas)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-[var(--color-text)]">
                    Total Custos:
                  </span>
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                    ({formatarMoeda(dreConsolidadoData.consolidado.totais.totalCustos)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-[var(--color-text)]">
                    Total Despesas:
                  </span>
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">
                    ({formatarMoeda(dreConsolidadoData.consolidado.totais.totalDespesas)})
                  </span>
                </div>
              </div>
              <div className="space-y-3 border-l border-[var(--color-border)] pl-4">
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-[var(--color-text-primary)]">
                    Lucro Operacional:
                  </span>
                  <span
                    className={`text-base font-bold ${
                      dreConsolidadoData.consolidado.totais.lucroOperacional >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatarMoeda(dreConsolidadoData.consolidado.totais.lucroOperacional)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-[var(--color-border)]">
                  <span className="text-lg font-bold text-[var(--color-text-primary)]">
                    Resultado Líquido:
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      dreConsolidadoData.consolidado.totais.resultadoLiquido >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatarMoeda(dreConsolidadoData.consolidado.totais.resultadoLiquido)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DRE por Empresa */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Detalhamento por Empresa
          </h4>
          {dreConsolidadoData.empresas.map(empresa => (
            <div
              key={empresa.empresaId}
              className="bg-[var(--color-card)] rounded-lg shadow border border-[var(--color-border)] p-4"
            >
              <h5 className="text-md font-semibold text-[var(--color-text-primary)] mb-3">
                {empresa.empresaNome}
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-[var(--color-text-secondary)]">Receitas:</span>
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    {formatarMoeda(empresa.dre.totais.totalReceitas)}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--color-text-secondary)]">Custos:</span>
                  <p className="font-semibold text-orange-600 dark:text-orange-400">
                    {formatarMoeda(empresa.dre.totais.totalCustos)}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--color-text-secondary)]">Despesas:</span>
                  <p className="font-semibold text-red-600 dark:text-red-400">
                    {formatarMoeda(empresa.dre.totais.totalDespesas)}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--color-text-secondary)]">Resultado:</span>
                  <p
                    className={`font-semibold ${
                      empresa.dre.totais.resultadoLiquido >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatarMoeda(empresa.dre.totais.resultadoLiquido)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDreComparativo = () => {
    if (
      !dreComparativoData ||
      !dreComparativoData.periodo1?.dre?.totais ||
      !dreComparativoData.periodo2?.dre?.totais ||
      !dreComparativoData.comparativo?.totais
    ) {
      return null;
    }

    return (
      <div className="bg-[var(--color-card)] rounded-lg shadow-md border border-[var(--color-border)] p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
            DRE Comparativo - {dreComparativoData.empresaNome}
          </h3>
          <div className="flex gap-6 text-sm text-[var(--color-text-secondary)]">
            <div>
              <span className="font-medium">Período 1:</span>{' '}
              {new Date(dreComparativoData.periodo1.dataInicio).toLocaleDateString('pt-BR')} até{' '}
              {new Date(dreComparativoData.periodo1.dataFim).toLocaleDateString('pt-BR')}
            </div>
            <div>
              <span className="font-medium">Período 2:</span>{' '}
              {new Date(dreComparativoData.periodo2.dataInicio).toLocaleDateString('pt-BR')} até{' '}
              {new Date(dreComparativoData.periodo2.dataFim).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>

        {/* Comparativo de Totais */}
        <div className="border-t-2 border-[var(--color-border)] pt-6 mt-6">
          <h4 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            Comparativo de Resultados
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[var(--color-bg-secondary)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Indicador
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Período 1
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Período 2
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Variação (R$)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Variação (%)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--color-border)]">
                  <td className="px-6 py-4 text-sm font-medium text-[var(--color-text)]">
                    Receitas
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-green-600 dark:text-green-400">
                    {formatarMoeda(dreComparativoData.periodo1.dre.totais.totalReceitas)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-green-600 dark:text-green-400">
                    {formatarMoeda(dreComparativoData.periodo2.dre.totais.totalReceitas)}
                  </td>
                  <td
                    className={`px-6 py-4 text-sm text-right font-semibold ${
                      dreComparativoData.comparativo.totais.variacao.receitas >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatarMoeda(dreComparativoData.comparativo.totais.variacao.receitas)}
                  </td>
                  <td
                    className={`px-6 py-4 text-sm text-right font-semibold ${
                      dreComparativoData.comparativo.totais.variacaoPercentual.receitas >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {dreComparativoData.comparativo.totais.variacaoPercentual.receitas.toFixed(2)}%
                  </td>
                </tr>
                <tr className="border-b border-[var(--color-border)]">
                  <td className="px-6 py-4 text-sm font-medium text-[var(--color-text)]">Custos</td>
                  <td className="px-6 py-4 text-sm text-right text-orange-600 dark:text-orange-400">
                    {formatarMoeda(dreComparativoData.periodo1.dre.totais.totalCustos)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-orange-600 dark:text-orange-400">
                    {formatarMoeda(dreComparativoData.periodo2.dre.totais.totalCustos)}
                  </td>
                  <td
                    className={`px-6 py-4 text-sm text-right font-semibold ${
                      dreComparativoData.comparativo.totais.variacao.custos <= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatarMoeda(dreComparativoData.comparativo.totais.variacao.custos)}
                  </td>
                  <td
                    className={`px-6 py-4 text-sm text-right font-semibold ${
                      dreComparativoData.comparativo.totais.variacaoPercentual.custos <= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {dreComparativoData.comparativo.totais.variacaoPercentual.custos.toFixed(2)}%
                  </td>
                </tr>
                <tr className="border-b border-[var(--color-border)]">
                  <td className="px-6 py-4 text-sm font-medium text-[var(--color-text)]">
                    Despesas
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-red-600 dark:text-red-400">
                    {formatarMoeda(dreComparativoData.periodo1.dre.totais.totalDespesas)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-red-600 dark:text-red-400">
                    {formatarMoeda(dreComparativoData.periodo2.dre.totais.totalDespesas)}
                  </td>
                  <td
                    className={`px-6 py-4 text-sm text-right font-semibold ${
                      dreComparativoData.comparativo.totais.variacao.despesas <= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatarMoeda(dreComparativoData.comparativo.totais.variacao.despesas)}
                  </td>
                  <td
                    className={`px-6 py-4 text-sm text-right font-semibold ${
                      dreComparativoData.comparativo.totais.variacaoPercentual.despesas <= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {dreComparativoData.comparativo.totais.variacaoPercentual.despesas.toFixed(2)}%
                  </td>
                </tr>
                <tr className="border-b-2 border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                  <td className="px-6 py-4 text-sm font-bold text-[var(--color-text-primary)]">
                    Lucro Operacional
                  </td>
                  <td
                    className={`px-6 py-4 text-sm text-right font-semibold ${
                      dreComparativoData.periodo1.dre.totais.lucroOperacional >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatarMoeda(dreComparativoData.periodo1.dre.totais.lucroOperacional)}
                  </td>
                  <td
                    className={`px-6 py-4 text-sm text-right font-semibold ${
                      dreComparativoData.periodo2.dre.totais.lucroOperacional >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatarMoeda(dreComparativoData.periodo2.dre.totais.lucroOperacional)}
                  </td>
                  <td
                    className={`px-6 py-4 text-sm text-right font-bold ${
                      dreComparativoData.comparativo.totais.variacao.lucroOperacional >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatarMoeda(dreComparativoData.comparativo.totais.variacao.lucroOperacional)}
                  </td>
                  <td
                    className={`px-6 py-4 text-sm text-right font-bold ${
                      dreComparativoData.comparativo.totais.variacaoPercentual.lucroOperacional >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {dreComparativoData.comparativo.totais.variacaoPercentual.lucroOperacional.toFixed(
                      2
                    )}
                    %
                  </td>
                </tr>
                <tr className="bg-[var(--color-bg-secondary)]">
                  <td className="px-6 py-4 text-base font-bold text-[var(--color-text-primary)]">
                    Resultado Líquido
                  </td>
                  <td
                    className={`px-6 py-4 text-base text-right font-bold ${
                      dreComparativoData.periodo1.dre.totais.resultadoLiquido >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatarMoeda(dreComparativoData.periodo1.dre.totais.resultadoLiquido)}
                  </td>
                  <td
                    className={`px-6 py-4 text-base text-right font-bold ${
                      dreComparativoData.periodo2.dre.totais.resultadoLiquido >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatarMoeda(dreComparativoData.periodo2.dre.totais.resultadoLiquido)}
                  </td>
                  <td
                    className={`px-6 py-4 text-base text-right font-bold ${
                      dreComparativoData.comparativo.totais.variacao.resultadoLiquido >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatarMoeda(dreComparativoData.comparativo.totais.variacao.resultadoLiquido)}
                  </td>
                  <td
                    className={`px-6 py-4 text-base text-right font-bold ${
                      dreComparativoData.comparativo.totais.variacaoPercentual.resultadoLiquido >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {dreComparativoData.comparativo.totais.variacaoPercentual.resultadoLiquido.toFixed(
                      2
                    )}
                    %
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
          DRE - Demonstração do Resultado do Exercício
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Gere demonstrações de resultado simples, consolidadas ou comparativas
        </p>
      </div>

      {/* View Mode Selector */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => {
            setViewMode('simple');
            setDreData(null);
          }}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            viewMode === 'simple'
              ? 'bg-blue-600 text-white'
              : 'bg-[var(--color-bg-secondary)] text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)]'
          }`}
        >
          DRE Simples
        </button>
        <button
          onClick={() => {
            setViewMode('consolidated');
            setDreConsolidadoData(null);
          }}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            viewMode === 'consolidated'
              ? 'bg-blue-600 text-white'
              : 'bg-[var(--color-bg-secondary)] text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)]'
          }`}
        >
          DRE Consolidado
        </button>
        <button
          onClick={() => {
            setViewMode('comparative');
            setDreComparativoData(null);
          }}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            viewMode === 'comparative'
              ? 'bg-blue-600 text-white'
              : 'bg-[var(--color-bg-secondary)] text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)]'
          }`}
        >
          DRE Comparativo
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-600 dark:bg-red-700 text-white rounded-md font-medium border border-red-700 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Simple DRE Form */}
      {viewMode === 'simple' && (
        <div className="mb-6 bg-[var(--color-card)] rounded-lg shadow border border-[var(--color-border)] p-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            Gerar DRE Simples
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Empresa *
              </label>
              <select
                value={empresaId}
                onChange={e => setEmpresaId(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione...</option>
                {empresas.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nome_fantasia}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Data Início *
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={e => setDataInicio(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Data Fim *
              </label>
              <input
                type="date"
                value={dataFim}
                onChange={e => setDataFim(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleGerarDreSimples}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Gerando...' : 'Gerar DRE'}
            </button>
          </div>
        </div>
      )}

      {/* Consolidated DRE Form */}
      {viewMode === 'consolidated' && (
        <div className="mb-6 bg-[var(--color-card)] rounded-lg shadow border border-[var(--color-border)] p-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            Gerar DRE Consolidado
          </h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Selecione as Empresas *
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-[var(--color-border)] rounded-md p-3 bg-[var(--color-bg)]">
              {empresas.map(emp => (
                <label key={emp.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedEmpresaIds.includes(emp.id)}
                    onChange={() => toggleEmpresaSelection(emp.id)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-[var(--color-text)]">{emp.nome_fantasia}</span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
              {selectedEmpresaIds.length} empresa(s) selecionada(s)
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Data Início *
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={e => setDataInicio(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Data Fim *
              </label>
              <input
                type="date"
                value={dataFim}
                onChange={e => setDataFim(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleGerarDreConsolidado}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Gerando...' : 'Gerar DRE Consolidado'}
            </button>
          </div>
        </div>
      )}

      {/* Comparative DRE Form */}
      {viewMode === 'comparative' && (
        <div className="mb-6 bg-[var(--color-card)] rounded-lg shadow border border-[var(--color-border)] p-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            Gerar DRE Comparativo
          </h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Empresa *
            </label>
            <select
              value={empresaId}
              onChange={e => setEmpresaId(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecione...</option>
              {empresas.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.nome_fantasia}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-[var(--color-border)] rounded-md p-4">
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
                Período 1
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Data Início *
                  </label>
                  <input
                    type="date"
                    value={periodo1Inicio}
                    onChange={e => setPeriodo1Inicio(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Data Fim *
                  </label>
                  <input
                    type="date"
                    value={periodo1Fim}
                    onChange={e => setPeriodo1Fim(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="border border-[var(--color-border)] rounded-md p-4">
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
                Período 2
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Data Início *
                  </label>
                  <input
                    type="date"
                    value={periodo2Inicio}
                    onChange={e => setPeriodo2Inicio(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Data Fim *
                  </label>
                  <input
                    type="date"
                    value={periodo2Fim}
                    onChange={e => setPeriodo2Fim(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleGerarDreComparativo}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Gerando...' : 'Gerar DRE Comparativo'}
            </button>
          </div>
        </div>
      )}

      {/* Results Display */}
      {viewMode === 'simple' && dreData && renderDreSimples()}
      {viewMode === 'consolidated' && dreConsolidadoData && renderDreConsolidado()}
      {viewMode === 'comparative' && dreComparativoData && renderDreComparativo()}
    </div>
  );
};
