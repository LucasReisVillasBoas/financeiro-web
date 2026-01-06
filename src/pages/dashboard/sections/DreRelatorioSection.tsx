import React, { useState, useEffect, useCallback } from 'react';
import {
  FiDownload,
  FiFilter,
  FiX,
  FiCalendar,
  FiChevronRight,
  FiChevronDown,
} from 'react-icons/fi';
import { RiBuilding4Line } from 'react-icons/ri';
import * as XLSX from 'xlsx';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import type { DreResponse, DreFiltros, DreItemLinha, Empresa } from '../../../types/api.types';
import { dreRelatorioService } from '../../../services/dre-relatorio.service';
import { empresaService } from '../../../services';
import { useAuth } from '../../../context/AuthContext';
import { useReportFilters } from '../../../hooks/useReportFilters';
import { PaginationControls } from '../../../components/reports/PaginationControls';
import { SortableTableHeader } from '../../../components/reports/SortableTableHeader';

// Configure pdfMake fonts
(pdfMake as unknown as { vfs: typeof pdfFonts }).vfs = pdfFonts;

export const DreRelatorioSection: React.FC = () => {
  const { user } = useAuth();
  const [dados, setDados] = useState<DreResponse | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFiltros, setShowFiltros] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Hook para ordenação e paginação (aplicado apenas aos itens raiz)
  const {
    paginationConfig,
    filteredSortedPaginatedData,
    setCurrentPage,
    setItemsPerPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    requestSort,
    sortConfig,
  } = useReportFilters({
    data: dados?.itens || [],
    initialItemsPerPage: 25,
  });

  const hoje = new Date();
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  const [filtros, setFiltros] = useState<DreFiltros>({
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

  // Função para construir hierarquia a partir de lista plana
  const construirHierarquia = (itens: DreItemLinha[]): DreItemLinha[] => {
    if (!itens || itens.length === 0) return [];

    // Criar um mapa de itens por ID
    const itemsMap = new Map<string, DreItemLinha>();
    const roots: DreItemLinha[] = [];

    // Primeiro, criar cópias de todos os itens e adicionar ao mapa
    itens.forEach(item => {
      const itemCopy = { ...item, filhos: [] };
      itemsMap.set(String(item.id), itemCopy);
    });

    // Segundo, construir a hierarquia
    itens.forEach(item => {
      const itemCopy = itemsMap.get(String(item.id));
      if (!itemCopy) return;

      if (item.parentId) {
        const parent = itemsMap.get(String(item.parentId));
        if (parent) {
          if (!parent.filhos) parent.filhos = [];
          parent.filhos.push(itemCopy);
        } else {
          // Se o parent não existe, adicionar como raiz
          roots.push(itemCopy);
        }
      } else {
        // Item sem parent é raiz
        roots.push(itemCopy);
      }
    });

    return roots;
  };

  const buscarDados = useCallback(async () => {
    if (!filtros.dataInicio || !filtros.dataFim || !filtros.empresaId) {
      return;
    }

    setLoading(true);
    try {
      const response = await dreRelatorioService.buscarRelatorio(filtros);
      // Construir hierarquia se os itens estiverem planos
      if (response.itens && response.itens.length > 0) {
        // Verificar se já está hierarquizado ou se precisa construir
        const temHierarquia = response.itens.some(item => item.filhos && item.filhos.length > 0);

        if (!temHierarquia) {
          const itensHierarquicos = construirHierarquia(response.itens);
          response.itens = itensHierarquicos;
        }
      }

      setDados(response);
    } catch (error) {
      console.error('Erro ao buscar DRE:', error);
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
    let valorFinal = percentual;

    if (Math.abs(percentual) < 1 && percentual !== 0) {
      valorFinal = percentual * 100;
    }

    return `${valorFinal.toFixed(2)}%`;
  };

  const toggleExpand = (itemId: string) => {
    const id = String(itemId);
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Exportação CSV
  const exportarCSV = () => {
    if (!dados || dados.itens.length === 0) {
      alert('N�o h� dados para exportar');
      return;
    }

    const headers = ['Código', 'Descrição', 'Valor', 'Percentual'];
    const rows: string[][] = [];

    const processarItens = (itens: DreItemLinha[], nivel: number = 0) => {
      itens.forEach(item => {
        const indent = '  '.repeat(nivel);
        rows.push([
          item.codigo,
          indent + item.descricao,
          item.valor.toFixed(2),
          item.percentual ? item.percentual.toFixed(2) : '0.00',
        ]);

        if (item.filhos && item.filhos.length > 0) {
          processarItens(item.filhos, nivel + 1);
        }
      });
    };

    processarItens(dados.itens);

    const csv = [
      headers.join(','),
      ...rows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `dre-${filtros.dataInicio}-${filtros.dataFim}.csv`;
    link.click();
  };

  // Exportação XLSX
  const exportarXLSX = () => {
    if (!dados || dados.itens.length === 0) {
      alert('N�o h� dados para exportar');
      return;
    }

    const worksheetData: (string | number)[][] = [
      ['DRE - Demonstrativo de Resultado do Exercicio'],
      [`Periodo: ${formatarData(filtros.dataInicio)} a ${formatarData(filtros.dataFim)}`],
      [],
      ['Codigo', 'Descricao', 'Valor', 'Percentual'],
    ];

    const processarItens = (itens: DreItemLinha[], nivel: number = 0) => {
      itens.forEach(item => {
        const indent = '  '.repeat(nivel);
        worksheetData.push([
          item.codigo,
          indent + item.descricao,
          item.valor,
          item.percentual || 0,
        ]);

        if (item.filhos && item.filhos.length > 0) {
          processarItens(item.filhos, nivel + 1);
        }
      });
    };

    processarItens(dados.itens);

    worksheetData.push([]);
    worksheetData.push(['TOTALIZADORES']);
    worksheetData.push(['Receita Bruta', '', dados.totalizadores.receitaBruta]);
    worksheetData.push(['(-) Dedu��es', '', dados.totalizadores.deducoes]);
    worksheetData.push(['(=) Receita Líquida', '', dados.totalizadores.receitaLiquida]);
    worksheetData.push(['(-) Custos', '', dados.totalizadores.custos]);
    worksheetData.push(['(=) Margem Bruta', '', dados.totalizadores.margemBruta]);
    worksheetData.push(['(-) Despesas Operacionais', '', dados.totalizadores.despesasOperacionais]);
    worksheetData.push(['(=) Resultado Operacional', '', dados.totalizadores.resultadoOperacional]);
    worksheetData.push([
      '(+/-) Outras Receitas/Despesas',
      '',
      dados.totalizadores.outrasReceitasDespesas,
    ]);
    worksheetData.push([
      '(=) Resultado Antes de Impostos',
      '',
      dados.totalizadores.resultadoAntesImpostos,
    ]);
    worksheetData.push(['(-) Impostos', '', dados.totalizadores.impostos]);
    worksheetData.push(['(=) Resultado Líquido', '', dados.totalizadores.resultadoLiquido]);

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DRE');

    XLSX.writeFile(workbook, `dre-${filtros.dataInicio}-${filtros.dataFim}.xlsx`);
  };

  // Exportação PDF
  const exportarPDF = () => {
    if (!dados || dados.itens.length === 0) {
      alert('N�o h� dados para exportar');
      return;
    }

    const tableBody: (string | { text: string; style?: string; alignment?: string })[][] = [
      [
        { text: 'Código', style: 'tableHeader' },
        { text: 'Descrição', style: 'tableHeader' },
        { text: 'Valor', style: 'tableHeader', alignment: 'right' },
        { text: '%', style: 'tableHeader', alignment: 'right' },
      ],
    ];

    const processarItens = (itens: DreItemLinha[], nivel: number = 0) => {
      itens.forEach(item => {
        const indent = '  '.repeat(nivel);
        tableBody.push([
          item.codigo,
          indent + item.descricao,
          { text: formatarMoeda(item.valor), alignment: 'right' },
          { text: item.percentual ? formatarPercentual(item.percentual) : '-', alignment: 'right' },
        ]);

        if (item.filhos && item.filhos.length > 0) {
          processarItens(item.filhos, nivel + 1);
        }
      });
    };

    processarItens(dados.itens);

    const documentDefinition: TDocumentDefinitions = {
      pageOrientation: 'portrait',
      content: [
        {
          text: 'DRE - Demonstrativo de Resultado do Exerc�cio',
          style: 'header',
          alignment: 'center',
        },
        {
          text: `Per�odo: ${formatarData(filtros.dataInicio)} a ${formatarData(filtros.dataFim)}`,
          style: 'subheader',
          alignment: 'center',
          margin: [0, 5, 0, 15],
        },
        ...(dados.empresa
          ? [
              {
                text: `Empresa: ${dados.empresa.razao_social}`,
                margin: [0, 0, 0, 10],
              },
            ]
          : []),
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto'],
            body: tableBody,
          },
          layout: 'lightHorizontalLines',
        },
        {
          text: '\nTOTALIZADORES',
          style: 'subheader',
          margin: [0, 20, 0, 10],
        },
        {
          table: {
            widths: ['*', 'auto'],
            body: [
              ['Receita Bruta', formatarMoeda(dados.totalizadores.receitaBruta)],
              ['(-) Dedu��es', formatarMoeda(dados.totalizadores.deducoes)],
              [
                '(=) Receita Líquida',
                { text: formatarMoeda(dados.totalizadores.receitaLiquida), bold: true },
              ],
              ['(-) Custos', formatarMoeda(dados.totalizadores.custos)],
              [
                '(=) Margem Bruta',
                { text: formatarMoeda(dados.totalizadores.margemBruta), bold: true },
              ],
              [
                '(-) Despesas Operacionais',
                formatarMoeda(dados.totalizadores.despesasOperacionais),
              ],
              [
                '(=) Resultado Operacional',
                { text: formatarMoeda(dados.totalizadores.resultadoOperacional), bold: true },
              ],
              [
                '(+/-) Outras Receitas/Despesas',
                formatarMoeda(dados.totalizadores.outrasReceitasDespesas),
              ],
              [
                '(=) Resultado Antes de Impostos',
                { text: formatarMoeda(dados.totalizadores.resultadoAntesImpostos), bold: true },
              ],
              ['(-) Impostos', formatarMoeda(dados.totalizadores.impostos)],
              [
                '(=) RESULTADO LíquIDO',
                {
                  text: formatarMoeda(dados.totalizadores.resultadoLiquido),
                  bold: true,
                  fontSize: 12,
                },
              ],
            ],
          },
          layout: 'lightHorizontalLines',
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
      .download(`dre-${filtros.dataInicio}-${filtros.dataFim}.pdf`);
  };

  const renderItem = (item: DreItemLinha, nivel: number = 0) => {
    const hasChildren = item.filhos && item.filhos.length > 0;
    const id = String(item.id);
    const isExpanded = expandedItems.has(id);
    const isResultado = item.tipo === 'RESULTADO';

    return (
      <React.Fragment key={item.id}>
        <tr
          className={`hover:bg-[var(--color-bg)] transition-colors ${
            isResultado ? 'bg-gray-50 dark:bg-gray-800/50' : ''
          }`}
        >
          <td className="px-6 py-3 whitespace-nowrap text-sm">
            <div className="flex items-center" style={{ paddingLeft: `${nivel * 24}px` }}>
              {hasChildren && (
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="mr-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                >
                  {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                </button>
              )}
              <span className={isResultado ? 'font-bold' : ''}>{item.codigo}</span>
            </div>
          </td>
          <td className={`px-6 py-3 text-sm ${isResultado ? 'font-bold' : ''}`}>
            {item.descricao}
          </td>
          <td
            className={`px-6 py-3 whitespace-nowrap text-sm text-right ${isResultado ? 'font-bold' : ''}`}
          >
            {formatarMoeda(item.valor)}
          </td>
          <td
            className={`px-6 py-3 whitespace-nowrap text-sm text-right text-[var(--color-text-secondary)] ${
              isResultado ? 'font-bold' : ''
            }`}
          >
            {item.percentual ? formatarPercentual(item.percentual) : '-'}
          </td>
        </tr>
        {hasChildren && isExpanded && item.filhos?.map(filho => renderItem(filho, nivel + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            DRE - Demonstrativo de Resultado
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Demonstrativo estruturado de receitas, custos e despesas
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

      {/* Cards de Totalizadores */}
      {dados && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[var(--color-card)] rounded-lg p-6 border border-[var(--color-border)]">
            <p className="text-sm text-[var(--color-text-secondary)] mb-2">Receita Líquida</p>
            <p className="text-3xl font-bold text-green-600">
              {formatarMoeda(dados.totalizadores.receitaLiquida)}
            </p>
          </div>

          <div className="bg-[var(--color-card)] rounded-lg p-6 border border-[var(--color-border)]">
            <p className="text-sm text-[var(--color-text-secondary)] mb-2">Margem Bruta</p>
            <p className="text-3xl font-bold text-blue-600">
              {formatarMoeda(dados.totalizadores.margemBruta)}
            </p>
          </div>

          <div className="bg-[var(--color-card)] rounded-lg p-6 border border-[var(--color-border)]">
            <p className="text-sm text-[var(--color-text-secondary)] mb-2">Resultado Operacional</p>
            <p className="text-3xl font-bold text-indigo-600">
              {formatarMoeda(dados.totalizadores.resultadoOperacional)}
            </p>
          </div>

          <div className="bg-[var(--color-card)] rounded-lg p-6 border border-[var(--color-border)]">
            <p className="text-sm text-[var(--color-text-secondary)] mb-2">Resultado Líquido</p>
            <p
              className={`text-3xl font-bold ${
                dados.totalizadores.resultadoLiquido >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatarMoeda(dados.totalizadores.resultadoLiquido)}
            </p>
          </div>
        </div>
      )}

      {/* Botões de Ação */}
      {dados && dados.itens.length > 0 && (
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

      {/* Tabela */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
        </div>
      ) : dados && dados.itens.length > 0 ? (
        <div className="bg-[var(--color-card)] rounded-lg shadow-sm border border-[var(--color-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                <tr>
                  <SortableTableHeader
                    label="Código"
                    sortKey="codigo"
                    currentSortKey={sortConfig?.key}
                    sortDirection={sortConfig?.direction}
                    onSort={requestSort}
                    align="left"
                    className="uppercase tracking-wider text-xs font-medium"
                  />
                  <SortableTableHeader
                    label="Descrição"
                    sortKey="descricao"
                    currentSortKey={sortConfig?.key}
                    sortDirection={sortConfig?.direction}
                    onSort={requestSort}
                    align="left"
                    className="uppercase tracking-wider text-xs font-medium"
                  />
                  <SortableTableHeader
                    label="Valor"
                    sortKey="valor"
                    currentSortKey={sortConfig?.key}
                    sortDirection={sortConfig?.direction}
                    onSort={requestSort}
                    align="right"
                    className="uppercase tracking-wider text-xs font-medium"
                  />
                  <SortableTableHeader
                    label="%"
                    sortKey="percentual"
                    currentSortKey={sortConfig?.key}
                    sortDirection={sortConfig?.direction}
                    onSort={requestSort}
                    align="right"
                    className="uppercase tracking-wider text-xs font-medium"
                  />
                </tr>
              </thead>
              <tbody className="bg-[var(--color-card)] divide-y divide-[var(--color-border)]">
                {filteredSortedPaginatedData.map(item => renderItem(item))}
              </tbody>
            </table>
          </div>

          {/* Controles de Paginação */}
          <PaginationControls
            config={paginationConfig}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            onFirstPage={goToFirstPage}
            onLastPage={goToLastPage}
            onNextPage={goToNextPage}
            onPreviousPage={goToPreviousPage}
          />
        </div>
      ) : (
        <div className="bg-[var(--color-card)] rounded-lg p-12 text-center border border-[var(--color-border)]">
          <p className="text-[var(--color-text-secondary)] text-lg">
            {filtros.dataInicio && filtros.dataFim
              ? 'Nenhum dado encontrado para o período selecionado'
              : 'Selecione um período para visualizar o DRE'}
          </p>
        </div>
      )}
    </div>
  );
};
