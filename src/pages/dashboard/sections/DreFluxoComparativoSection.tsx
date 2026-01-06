import React, { useState, useEffect, useCallback } from 'react';
import {
  FiDownload,
  FiFilter,
  FiX,
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown,
} from 'react-icons/fi';
import { RiBuilding4Line } from 'react-icons/ri';
import * as XLSX from 'xlsx';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type {
  DreResponse,
  DreFiltros,
  FluxoCaixaResponse,
  FluxoCaixaFiltros,
  Empresa,
} from '../../../types/api.types';
import { dreRelatorioService } from '../../../services/dre-relatorio.service';
import { fluxoCaixaService } from '../../../services/fluxo-caixa.service';
import { empresaService } from '../../../services';
import { useAuth } from '../../../context/AuthContext';

// Configure pdfMake fonts
(pdfMake as unknown as { vfs: typeof pdfFonts }).vfs = pdfFonts;

interface ComparativoFiltros {
  dataInicio: string;
  dataFim: string;
  empresaId?: string;
  centroCustoId?: string;
}

interface DadosComparativos {
  categoria: string;
  competencia: number;
  caixa: number;
  diferenca: number;
  percentualDiferenca: number;
}

export const DreFluxoComparativoSection: React.FC = () => {
  const { user } = useAuth();
  const [dadosDre, setDadosDre] = useState<DreResponse | null>(null);
  const [dadosComparativos, setDadosComparativos] = useState<DadosComparativos[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFiltros, setShowFiltros] = useState(true);

  const hoje = new Date();
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  const [filtros, setFiltros] = useState<ComparativoFiltros>({
    dataInicio: primeiroDiaMes.toISOString().split('T')[0],
    dataFim: ultimoDiaMes.toISOString().split('T')[0],
  });

  const carregarEmpresas = useCallback(async () => {
    try {
      if (user?.clienteId) {
        const data = await empresaService.findByCliente(user.clienteId);
        setEmpresas(data || []);

        // Definir automaticamente a primeira empresa se não houver uma selecionada
        if (data && data.length > 0 && !filtros.empresaId) {
          setFiltros(prev => ({
            ...prev,
            empresaId: data[0].id,
          }));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  }, [user?.clienteId, filtros.empresaId]);

  const buscarDados = useCallback(async () => {
    if (!filtros.dataInicio || !filtros.dataFim || !filtros.empresaId) {
      return;
    }

    setLoading(true);
    try {
      // Buscar DRE
      const filtrosDre: DreFiltros = {
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
        empresaId: filtros.empresaId,
        centroCustoId: filtros.centroCustoId,
      };
      const responseDre = await dreRelatorioService.buscarRelatorio(filtrosDre);
      setDadosDre(responseDre);

      // Buscar Fluxo de Caixa
      const filtrosFluxo: FluxoCaixaFiltros = {
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
        empresaId: filtros.empresaId,
        consolidado: false,
      };
      const responseFluxo = await fluxoCaixaService.buscarRelatorio(filtrosFluxo);

      // Calcular dados comparativos
      calcularComparativo(responseDre, responseFluxo);
    } catch (error) {
      console.error('Erro ao buscar dados comparativos:', error);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    carregarEmpresas();
  }, [carregarEmpresas]);

  useEffect(() => {
    if (filtros.dataInicio && filtros.dataFim) {
      buscarDados();
    }
  }, [filtros, buscarDados]);

  const calcularComparativo = (dre: DreResponse, fluxo: FluxoCaixaResponse) => {
    const comparativos: DadosComparativos[] = [];

    // Receitas
    comparativos.push({
      categoria: 'Receitas',
      competencia: dre.totalizadores.receitaBruta,
      caixa: fluxo.totais.totalEntradasRealizadas,
      diferenca: dre.totalizadores.receitaBruta - fluxo.totais.totalEntradasRealizadas,
      percentualDiferenca:
        fluxo.totais.totalEntradasRealizadas !== 0
          ? ((dre.totalizadores.receitaBruta - fluxo.totais.totalEntradasRealizadas) /
              Math.abs(fluxo.totais.totalEntradasRealizadas)) *
            100
          : 0,
    });

    // Despesas/Custos
    const despesasCompetencia =
      Math.abs(dre.totalizadores.custos) + Math.abs(dre.totalizadores.despesasOperacionais);
    const despesasCaixa = fluxo.totais.totalSaidasRealizadas;

    comparativos.push({
      categoria: 'Despesas e Custos',
      competencia: -despesasCompetencia,
      caixa: -despesasCaixa,
      diferenca: -despesasCompetencia - -despesasCaixa,
      percentualDiferenca:
        despesasCaixa !== 0 ? ((despesasCompetencia - despesasCaixa) / despesasCaixa) * 100 : 0,
    });

    // Resultado
    comparativos.push({
      categoria: 'Resultado Líquido',
      competencia: dre.totalizadores.resultadoLiquido,
      caixa: fluxo.totais.saldoFinalRealizado,
      diferenca: dre.totalizadores.resultadoLiquido - fluxo.totais.saldoFinalRealizado,
      percentualDiferenca:
        fluxo.totais.saldoFinalRealizado !== 0
          ? ((dre.totalizadores.resultadoLiquido - fluxo.totais.saldoFinalRealizado) /
              Math.abs(fluxo.totais.saldoFinalRealizado)) *
            100
          : 0,
    });

    setDadosComparativos(comparativos);
  };

  const limparFiltros = () => {
    setFiltros({
      dataInicio: primeiroDiaMes.toISOString().split('T')[0],
      dataFim: ultimoDiaMes.toISOString().split('T')[0],
    });
  };

  const formatarData = (data: string) => {
    const d = new Date(data + 'T00:00:00');
    return d.toLocaleDateString('pt-BR');
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const formatarPercentual = (percentual: number) => {
    return `${percentual.toFixed(2)}%`;
  };

  const getClasseDiferenca = (valor: number) => {
    if (valor > 0) return 'text-green-600';
    if (valor < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Exportação CSV
  const exportarCSV = () => {
    if (dadosComparativos.length === 0) {
      alert('Não há dados para exportar');
      return;
    }

    const headers = ['Categoria', 'Competência (DRE)', 'Caixa (Fluxo)', 'Diferença', '% Diferença'];
    const rows = dadosComparativos.map(item => [
      item.categoria,
      item.competencia.toFixed(2),
      item.caixa.toFixed(2),
      item.diferenca.toFixed(2),
      item.percentualDiferenca.toFixed(2),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `comparativo-dre-fluxo-${filtros.dataInicio}-${filtros.dataFim}.csv`;
    link.click();
  };

  // Exportação XLSX
  const exportarXLSX = () => {
    if (dadosComparativos.length === 0) {
      alert('Não há dados para exportar');
      return;
    }

    const worksheetData: (string | number)[][] = [
      ['Comparativo: DRE (Competência) x Fluxo de Caixa (Caixa)'],
      [`Período: ${formatarData(filtros.dataInicio)} a ${formatarData(filtros.dataFim)}`],
      [],
      ['Categoria', 'Competência (DRE)', 'Caixa (Fluxo)', 'Diferença', '% Diferença'],
    ];

    dadosComparativos.forEach(item => {
      worksheetData.push([
        item.categoria,
        item.competencia,
        item.caixa,
        item.diferenca,
        item.percentualDiferenca,
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Comparativo');

    XLSX.writeFile(workbook, `comparativo-dre-fluxo-${filtros.dataInicio}-${filtros.dataFim}.xlsx`);
  };

  // Exportação PDF
  const exportarPDF = () => {
    if (dadosComparativos.length === 0) {
      alert('Não há dados para exportar');
      return;
    }

    const tableBody: (string | { text: string; style?: string; alignment?: string })[][] = [
      [
        { text: 'Categoria', style: 'tableHeader' },
        { text: 'Competência (DRE)', style: 'tableHeader', alignment: 'right' },
        { text: 'Caixa (Fluxo)', style: 'tableHeader', alignment: 'right' },
        { text: 'Diferença', style: 'tableHeader', alignment: 'right' },
        { text: '% Dif.', style: 'tableHeader', alignment: 'right' },
      ],
    ];

    dadosComparativos.forEach(item => {
      tableBody.push([
        item.categoria,
        { text: formatarMoeda(item.competencia), alignment: 'right' },
        { text: formatarMoeda(item.caixa), alignment: 'right' },
        { text: formatarMoeda(item.diferenca), alignment: 'right' },
        { text: formatarPercentual(item.percentualDiferenca), alignment: 'right' },
      ]);
    });

    const documentDefinition: TDocumentDefinitions = {
      pageOrientation: 'portrait',
      content: [
        {
          text: 'Comparativo: DRE (Competência) x Fluxo de Caixa (Caixa)',
          style: 'header',
          alignment: 'center',
        },
        {
          text: `Período: ${formatarData(filtros.dataInicio)} a ${formatarData(filtros.dataFim)}`,
          style: 'subheader',
          alignment: 'center',
          margin: [0, 5, 0, 15],
        },
        ...(dadosDre?.empresa
          ? [
              {
                text: `Empresa: ${dadosDre.empresa.razao_social}`,
                margin: [0, 0, 0, 10],
              },
            ]
          : []),
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto', 'auto'],
            body: tableBody,
          },
          layout: 'lightHorizontalLines',
        },
        {
          text: '\nObservações:',
          style: 'subheader',
          margin: [0, 20, 0, 10],
        },
        {
          ul: [
            'Competência (DRE): Valores registrados no momento em que ocorreram (fato gerador)',
            'Caixa (Fluxo): Valores efetivamente recebidos ou pagos',
            'Diferença Positiva: Receita/despesa reconhecida mas ainda não recebida/paga',
            'Diferença Negativa: Recebimento/pagamento maior que o reconhecido contabilmente',
          ],
          fontSize: 9,
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
        },
        subheader: {
          fontSize: 14,
          bold: true,
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          fillColor: '#eeeeee',
        },
      },
      defaultStyle: {
        fontSize: 9,
      },
    };

    pdfMake
      .createPdf(documentDefinition)
      .download(`comparativo-dre-fluxo-${filtros.dataInicio}-${filtros.dataFim}.pdf`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Comparativo: DRE x Fluxo de Caixa
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Comparação entre regime de competência (DRE) e regime de caixa (Fluxo)
          </p>
        </div>
        <button
          onClick={() => setShowFiltros(!showFiltros)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg transition-colors"
        >
          {showFiltros ? <FiX size={18} /> : <FiFilter size={18} />}
          {showFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </button>
      </div>

      {/* Filtros */}
      {showFiltros && (
        <div className="bg-[var(--color-card)] rounded-lg p-6 shadow-sm border border-[var(--color-border)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Data Início */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                <FiCalendar className="inline mr-2" />
                Data Início
              </label>
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={e => setFiltros({ ...filtros, dataInicio: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
            </div>

            {/* Data Fim */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                <FiCalendar className="inline mr-2" />
                Data Fim
              </label>
              <input
                type="date"
                value={filtros.dataFim}
                onChange={e => setFiltros({ ...filtros, dataFim: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
            </div>

            {/* Empresa */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                <RiBuilding4Line className="inline mr-2" />
                Empresa
              </label>
              <select
                value={filtros.empresaId || ''}
                onChange={e => {
                  const newFiltros = { ...filtros };
                  if (e.target.value) {
                    newFiltros.empresaId = e.target.value;
                  } else {
                    delete newFiltros.empresaId;
                  }
                  setFiltros(newFiltros);
                }}
                className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              >
                <option value="">Todas as empresas</option>
                {empresas.map(empresa => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nome_fantasia || empresa.razao_social}
                  </option>
                ))}
              </select>
            </div>

            {/* Centro de Custo */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Centro de Custo (Opcional)
              </label>
              <input
                type="text"
                value={filtros.centroCustoId || ''}
                onChange={e => {
                  const newFiltros = { ...filtros };
                  if (e.target.value && e.target.value.trim() !== '') {
                    newFiltros.centroCustoId = e.target.value.trim();
                  } else {
                    delete newFiltros.centroCustoId;
                  }
                  setFiltros(newFiltros);
                }}
                placeholder="ID do centro de custo"
                className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
            </div>
          </div>

          {/* Botão Limpar - linha separada */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={limparFiltros}
              className="px-6 py-2 bg-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-border-hover)] transition-colors"
            >
              <FiX className="inline mr-2" />
              Limpar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Cards de Resumo */}
      {dadosComparativos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dadosComparativos.map((item, idx) => (
            <div
              key={idx}
              className="bg-[var(--color-card)] rounded-lg p-6 border border-[var(--color-border)]"
            >
              <p className="text-sm text-[var(--color-text-secondary)] mb-2">{item.categoria}</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--color-text-secondary)]">Competência:</span>
                  <span className="text-lg font-semibold">{formatarMoeda(item.competencia)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--color-text-secondary)]">Caixa:</span>
                  <span className="text-lg font-semibold">{formatarMoeda(item.caixa)}</span>
                </div>
                <div className="border-t border-[var(--color-border)] pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[var(--color-text-secondary)]">Diferença:</span>
                    <span className={`text-lg font-bold ${getClasseDiferenca(item.diferenca)}`}>
                      {item.diferenca > 0 && <FiTrendingUp className="inline mr-1" />}
                      {item.diferenca < 0 && <FiTrendingDown className="inline mr-1" />}
                      {formatarMoeda(Math.abs(item.diferenca))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botões de Exportação */}
      {dadosComparativos.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={exportarCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FiDownload size={18} />
            Exportar CSV
          </button>
          <button
            onClick={exportarXLSX}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiDownload size={18} />
            Exportar XLSX
          </button>
          <button
            onClick={exportarPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FiDownload size={18} />
            Exportar PDF
          </button>
        </div>
      )}

      {/* Tabela Comparativa */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      ) : dadosComparativos.length > 0 ? (
        <div className="bg-[var(--color-card)] rounded-lg shadow-sm border border-[var(--color-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Competência (DRE)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Caixa (Fluxo)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Diferença
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    % Diferença
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--color-card)] divide-y divide-[var(--color-border)]">
                {dadosComparativos.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[var(--color-bg)] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-text-primary)]">
                      {item.categoria}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {formatarMoeda(item.competencia)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {formatarMoeda(item.caixa)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${getClasseDiferenca(item.diferenca)}`}
                    >
                      {formatarMoeda(item.diferenca)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-right ${getClasseDiferenca(item.diferenca)}`}
                    >
                      {formatarPercentual(item.percentualDiferenca)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Nota explicativa */}
          <div className="bg-[var(--color-bg)] border-t border-[var(--color-border)] p-4">
            <p className="text-xs text-[var(--color-text-secondary)]">
              <strong>Nota:</strong> A diferença entre os regimes ocorre devido ao timing de
              reconhecimento. No regime de competência (DRE), receitas e despesas são reconhecidas
              quando ocorrem. No regime de caixa (Fluxo), são reconhecidas apenas quando há efetivo
              recebimento ou pagamento.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--color-card)] rounded-lg p-12 text-center border border-[var(--color-border)]">
          <p className="text-[var(--color-text-secondary)] text-lg">
            {filtros.dataInicio && filtros.dataFim
              ? 'Nenhum dado encontrado para o período selecionado'
              : 'Selecione um período para visualizar o comparativo'}
          </p>
        </div>
      )}
    </div>
  );
};
