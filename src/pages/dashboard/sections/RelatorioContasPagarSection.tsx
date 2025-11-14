import React, { useState, useEffect } from 'react';
import {
  FiDownload,
  FiFilter,
  FiFileText,
  FiX,
  FiCalendar,
  FiUser,
  FiAlertCircle,
} from 'react-icons/fi';
import * as XLSX from 'xlsx';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { StatusContaPagar } from '../../../types/api.types';
import type { ContaPagar, Pessoa } from '../../../types/api.types';
import { contaPagarService, pessoaService } from '../../../services';
import { useReportFilters } from '../../../hooks/useReportFilters';
import { PaginationControls } from '../../../components/reports/PaginationControls';
import { SortableTableHeader } from '../../../components/reports/SortableTableHeader';

// Configure pdfMake fonts
(pdfMake as any).vfs = pdfFonts;

interface FiltroContasPagar {
  dataInicio: string;
  dataFim: string;
  fornecedorId: string;
  status: StatusContaPagar | '';
  tipoData: 'vencimento' | 'emissao' | 'liquidacao';
}

interface TotalizadoresGeral {
  total: number;
  saldoTotal: number;
  valorTotal: number;
  emAberto: number;
  vencidas: number;
  pagas: number;
  parcial: number;
}

interface TotalizadorPorFornecedor {
  fornecedorId: string;
  fornecedorNome: string;
  quantidade: number;
  valorTotal: number;
  saldoTotal: number;
}

export const RelatorioContasPagarSection: React.FC = () => {
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [contasFiltradas, setContasFiltradas] = useState<ContaPagar[]>([]);
  const [fornecedores, setFornecedores] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFiltros, setShowFiltros] = useState(true);
  const [agruparPorFornecedor, setAgruparPorFornecedor] = useState(false);

  const [filtros, setFiltros] = useState<FiltroContasPagar>({
    dataInicio: '',
    dataFim: '',
    fornecedorId: '',
    status: '',
    tipoData: 'vencimento',
  });

  const [totalizadores, setTotalizadores] = useState<TotalizadoresGeral>({
    total: 0,
    saldoTotal: 0,
    valorTotal: 0,
    emAberto: 0,
    vencidas: 0,
    pagas: 0,
    parcial: 0,
  });

  useEffect(() => {
    carregarDados();
    carregarFornecedores();
  }, []);

  // Update filtered data and totals when filters or source data changes
  useEffect(() => {
    let dadosFiltrados = [...contas];

    // Filtro por fornecedor
    if (filtros.fornecedorId) {
      dadosFiltrados = dadosFiltrados.filter(c => c.pessoa.id === filtros.fornecedorId);
    }

    // Filtro por status
    if (filtros.status) {
      dadosFiltrados = dadosFiltrados.filter(c => c.status === filtros.status);
    }

    // Filtro por período
    if (filtros.dataInicio) {
      dadosFiltrados = dadosFiltrados.filter(c => {
        let data: Date;
        switch (filtros.tipoData) {
          case 'emissao':
            data = new Date(c.data_emissao);
            break;
          case 'liquidacao':
            data = c.data_liquidacao ? new Date(c.data_liquidacao) : new Date(0);
            break;
          default:
            data = new Date(c.vencimento);
        }
        return data >= new Date(filtros.dataInicio);
      });
    }

    if (filtros.dataFim) {
      dadosFiltrados = dadosFiltrados.filter(c => {
        let data: Date;
        switch (filtros.tipoData) {
          case 'emissao':
            data = new Date(c.data_emissao);
            break;
          case 'liquidacao':
            data = c.data_liquidacao ? new Date(c.data_liquidacao) : new Date(0);
            break;
          default:
            data = new Date(c.vencimento);
        }
        return data <= new Date(filtros.dataFim);
      });
    }

    setContasFiltradas(dadosFiltrados);
    calcularTotalizadores(dadosFiltrados);
  }, [contas, filtros]);

  // Use report filters hook for sorting and pagination
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
    data: contasFiltradas,
    initialItemsPerPage: 25,
  });

  const carregarFornecedores = async () => {
    try {
      const data = await pessoaService.findAll();
      setFornecedores(data.filter(p => p.ativo));
    } catch (err) {
      console.error('Erro ao carregar fornecedores:', err);
    }
  };

  const carregarDados = async () => {
    setLoading(true);
    try {
      const data = await contaPagarService.findAll();
      setContas(data);
      calcularTotalizadores(data);
    } catch (err) {
      console.error('Erro ao carregar contas:', err);
    } finally {
      setLoading(false);
    }
  };

  const calcularTotalizadores = (dados: ContaPagar[]) => {
    const total = dados.length;
    const saldoTotal = dados.reduce((acc, c) => acc + c.saldo, 0);
    const valorTotal = dados.reduce((acc, c) => acc + c.valor_total, 0);

    const emAberto = dados.filter(c => c.status === StatusContaPagar.PENDENTE).length;
    const vencidas = dados.filter(c => c.status === StatusContaPagar.VENCIDA).length;
    const pagas = dados.filter(c => c.status === StatusContaPagar.PAGA).length;
    const parcial = dados.filter(c => c.status === StatusContaPagar.PARCIALMENTE_PAGA).length;

    setTotalizadores({
      total,
      saldoTotal,
      valorTotal,
      emAberto,
      vencidas,
      pagas,
      parcial,
    });
  };

  const agruparPorFornecedorFunc = (dados: ContaPagar[]): TotalizadorPorFornecedor[] => {
    const grupos = dados.reduce(
      (acc, conta) => {
        const key = conta.pessoa.id;
        if (!acc[key]) {
          acc[key] = {
            fornecedorId: conta.pessoa.id,
            fornecedorNome:
              conta.pessoa.fantasiaApelido ||
              conta.pessoa.razaoNome ||
              'Fornecedor não identificado',
            quantidade: 0,
            valorTotal: 0,
            saldoTotal: 0,
          };
        }
        acc[key].quantidade++;
        acc[key].valorTotal += conta.valor_total;
        acc[key].saldoTotal += conta.saldo;
        return acc;
      },
      {} as Record<string, TotalizadorPorFornecedor>
    );

    return Object.values(grupos).sort((a, b) => b.valorTotal - a.valorTotal);
  };

  const limparFiltros = () => {
    setFiltros({
      dataInicio: '',
      dataFim: '',
      fornecedorId: '',
      status: '',
      tipoData: 'vencimento',
    });
    carregarDados();
  };

  const exportarCSV = (dados: ContaPagar[]) => {
    if (dados.length === 0) {
      alert('Não há dados para exportar');
      return;
    }

    const dadosFormatados = dados.map(c => ({
      Documento: `${c.documento}/${c.serie || '1'}-${c.parcela}`,
      Fornecedor: c.pessoa.fantasiaApelido || c.pessoa.razaoNome || 'N/A',
      Descrição: c.descricao,
      'Data Emissão': new Date(c.data_emissao).toLocaleDateString('pt-BR'),
      Vencimento: new Date(c.vencimento).toLocaleDateString('pt-BR'),
      'Data Liquidação': c.data_liquidacao
        ? new Date(c.data_liquidacao).toLocaleDateString('pt-BR')
        : '',
      'Valor Total': c.valor_total,
      Saldo: c.saldo,
      Status: c.status,
    }));

    const headers = Object.keys(dadosFormatados[0]);
    const csvContent = [
      headers.join(','),
      ...dadosFormatados.map(item =>
        headers.map(h => `"${item[h as keyof typeof item]}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-contas-pagar-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportarXLSX = (dados: ContaPagar[]) => {
    if (dados.length === 0) {
      alert('Não há dados para exportar');
      return;
    }

    const dadosFormatados = dados.map(c => ({
      Documento: `${c.documento}/${c.serie || '1'}-${c.parcela}`,
      Fornecedor: c.pessoa.fantasiaApelido || c.pessoa.razaoNome || 'N/A',
      Descrição: c.descricao,
      'Data Emissão': new Date(c.data_emissao).toLocaleDateString('pt-BR'),
      Vencimento: new Date(c.vencimento).toLocaleDateString('pt-BR'),
      'Data Liquidação': c.data_liquidacao
        ? new Date(c.data_liquidacao).toLocaleDateString('pt-BR')
        : '',
      'Valor Total': c.valor_total,
      Saldo: c.saldo,
      Status: c.status,
    }));

    // Criar workbook
    const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contas a Pagar');

    // Adicionar totalizadores
    if (agruparPorFornecedor) {
      const grupos = agruparPorFornecedorFunc(dados);
      const worksheetGrupos = XLSX.utils.json_to_sheet(
        grupos.map(g => ({
          Fornecedor: g.fornecedorNome,
          Quantidade: g.quantidade,
          'Valor Total': g.valorTotal,
          Saldo: g.saldoTotal,
        }))
      );
      XLSX.utils.book_append_sheet(workbook, worksheetGrupos, 'Totais por Fornecedor');
    }

    XLSX.writeFile(
      workbook,
      `relatorio-contas-pagar-${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  const exportarPDF = (dados: ContaPagar[]) => {
    if (dados.length === 0) {
      alert('Não há dados para exportar');
      return;
    }

    const body = dados.map(c => [
      `${c.documento}/${c.serie || '1'}-${c.parcela}`,
      c.pessoa.fantasiaApelido || c.pessoa.razaoNome || 'N/A',
      c.descricao,
      new Date(c.vencimento).toLocaleDateString('pt-BR'),
      `R$ ${c.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `R$ ${c.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      c.status,
    ]);

    const content: any[] = [
      { text: 'Relatório de Contas a Pagar', style: 'header', margin: [0, 0, 0, 10] },
      {
        text: `Data de Geração: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
        style: 'subheader',
        margin: [0, 0, 0, 5],
      },
      {
        text: [
          `Total de Títulos: ${totalizadores.total} | `,
          `Valor Total: R$ ${totalizadores.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | `,
          `Saldo: R$ ${totalizadores.saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        ],
        style: 'subheader',
        margin: [0, 0, 0, 5],
      },
      {
        text: [
          `Em Aberto: ${totalizadores.emAberto} | `,
          `Vencidas: ${totalizadores.vencidas} | `,
          `Pagas: ${totalizadores.pagas} | `,
          `Parcial: ${totalizadores.parcial}`,
        ],
        style: 'subheader',
        margin: [0, 0, 0, 20],
      },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', '*', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Documento', style: 'tableHeader' },
              { text: 'Fornecedor', style: 'tableHeader' },
              { text: 'Descrição', style: 'tableHeader' },
              { text: 'Vencimento', style: 'tableHeader' },
              { text: 'Valor Total', style: 'tableHeader' },
              { text: 'Saldo', style: 'tableHeader' },
              { text: 'Status', style: 'tableHeader' },
            ],
            ...body,
          ],
        },
        layout: {
          fillColor: (rowIndex: number) =>
            rowIndex === 0 ? '#3B82F6' : rowIndex % 2 === 0 ? '#F3F4F6' : null,
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#E5E7EB',
          vLineColor: () => '#E5E7EB',
        },
      },
    ];

    // Adicionar tabela de totais por fornecedor
    if (agruparPorFornecedor) {
      const grupos = agruparPorFornecedorFunc(dados);
      content.push(
        { text: '\nTotais por Fornecedor', style: 'sectionHeader', margin: [0, 20, 0, 10] },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Fornecedor', style: 'tableHeader' },
                { text: 'Qtd', style: 'tableHeader' },
                { text: 'Valor Total', style: 'tableHeader' },
                { text: 'Saldo', style: 'tableHeader' },
              ],
              ...grupos.map(g => [
                g.fornecedorNome,
                g.quantidade.toString(),
                `R$ ${g.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                `R$ ${g.saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
              ]),
            ],
          },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex === 0 ? '#3B82F6' : rowIndex % 2 === 0 ? '#F3F4F6' : null,
          },
        }
      );
    }

    const docDefinition: any = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [40, 60, 40, 60],
      content,
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          color: '#1F2937',
        },
        subheader: {
          fontSize: 10,
          alignment: 'center',
          color: '#6B7280',
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          color: '#1F2937',
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'white',
          fillColor: '#3B82F6',
          alignment: 'center',
        },
      },
      defaultStyle: {
        fontSize: 8,
      },
    };

    (pdfMake as any)
      .createPdf(docDefinition)
      .download(`relatorio-contas-pagar-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const totaisPorFornecedor = agruparPorFornecedor ? agruparPorFornecedorFunc(contasFiltradas) : [];

  const getStatusColor = (status: StatusContaPagar) => {
    const colors = {
      [StatusContaPagar.PENDENTE]: 'bg-yellow-100 text-yellow-800',
      [StatusContaPagar.PARCIALMENTE_PAGA]: 'bg-blue-100 text-blue-800',
      [StatusContaPagar.PAGA]: 'bg-green-100 text-green-800',
      [StatusContaPagar.VENCIDA]: 'bg-red-100 text-red-800',
      [StatusContaPagar.CANCELADA]: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Relatório de Contas a Pagar
        </h1>
      </div>

      {/* Totalizadores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--color-surface)] rounded-lg shadow p-4">
          <div className="text-sm text-[var(--color-text-secondary)] mb-1">Total de Títulos</div>
          <div className="text-2xl font-bold text-[var(--color-text-primary)]">
            {totalizadores.total}
          </div>
        </div>
        <div className="bg-[var(--color-surface)] rounded-lg shadow p-4">
          <div className="text-sm text-[var(--color-text-secondary)] mb-1">Valor Total</div>
          <div className="text-2xl font-bold text-blue-600">
            R$ {totalizadores.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-[var(--color-surface)] rounded-lg shadow p-4">
          <div className="text-sm text-[var(--color-text-secondary)] mb-1">Saldo Total</div>
          <div className="text-2xl font-bold text-red-600">
            R$ {totalizadores.saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-[var(--color-surface)] rounded-lg shadow p-4">
          <div className="text-sm text-[var(--color-text-secondary)] mb-1">Status</div>
          <div className="text-xs space-y-1">
            <div>
              Em Aberto: <span className="font-bold">{totalizadores.emAberto}</span>
            </div>
            <div>
              Vencidas: <span className="font-bold text-red-600">{totalizadores.vencidas}</span>
            </div>
            <div>
              Pagas: <span className="font-bold text-green-600">{totalizadores.pagas}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={() => setShowFiltros(!showFiltros)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-md hover:bg-[var(--color-bg)] transition-colors"
        >
          <FiFilter size={18} />
          {showFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </button>

        <label className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-md cursor-pointer">
          <input
            type="checkbox"
            checked={agruparPorFornecedor}
            onChange={e => setAgruparPorFornecedor(e.target.checked)}
            className="rounded"
          />
          <span>Agrupar por Fornecedor</span>
        </label>

        <div className="ml-auto flex gap-3">
          <button
            onClick={() => exportarCSV(contasFiltradas)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <FiDownload size={18} />
            CSV
          </button>

          <button
            onClick={() => exportarXLSX(contasFiltradas)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FiDownload size={18} />
            Excel
          </button>

          <button
            onClick={() => exportarPDF(contasFiltradas)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <FiFileText size={18} />
            PDF
          </button>
        </div>
      </div>

      {/* Painel de Filtros */}
      {showFiltros && (
        <div className="bg-[var(--color-surface)] rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Filtros</h3>
            <button
              onClick={limparFiltros}
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] flex items-center gap-1"
            >
              <FiX size={16} />
              Limpar Filtros
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                <FiUser className="inline mr-1" />
                Fornecedor
              </label>
              <select
                value={filtros.fornecedorId}
                onChange={e => setFiltros(prev => ({ ...prev, fornecedorId: e.target.value }))}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">Todos os Fornecedores</option>
                {fornecedores.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.razaoNome || p.fantasiaApelido}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                <FiAlertCircle className="inline mr-1" />
                Status
              </label>
              <select
                value={filtros.status}
                onChange={e => setFiltros(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">Todos os Status</option>
                <option value={StatusContaPagar.PENDENTE}>Em Aberto (Pendente)</option>
                <option value={StatusContaPagar.VENCIDA}>Vencida</option>
                <option value={StatusContaPagar.PAGA}>Paga</option>
                <option value={StatusContaPagar.PARCIALMENTE_PAGA}>Parcialmente Paga</option>
                <option value={StatusContaPagar.CANCELADA}>Cancelada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                <FiCalendar className="inline mr-1" />
                Tipo de Data
              </label>
              <select
                value={filtros.tipoData}
                onChange={e => setFiltros(prev => ({ ...prev, tipoData: e.target.value as any }))}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="vencimento">Vencimento</option>
                <option value="emissao">Emissão</option>
                <option value="liquidacao">Liquidação</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Data Início
              </label>
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={e => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Data Fim
              </label>
              <input
                type="date"
                value={filtros.dataFim}
                onChange={e => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Totais por Fornecedor */}
      {agruparPorFornecedor && totaisPorFornecedor.length > 0 && (
        <div className="bg-[var(--color-surface)] rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            Totais por Fornecedor
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="text-left p-3 text-[var(--color-text-secondary)]">Fornecedor</th>
                  <th className="text-center p-3 text-[var(--color-text-secondary)]">Qtd</th>
                  <th className="text-right p-3 text-[var(--color-text-secondary)]">Valor Total</th>
                  <th className="text-right p-3 text-[var(--color-text-secondary)]">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {totaisPorFornecedor.map(grupo => (
                  <tr
                    key={grupo.fornecedorId}
                    className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg)]"
                  >
                    <td className="p-3 text-[var(--color-text)]">{grupo.fornecedorNome}</td>
                    <td className="p-3 text-center text-[var(--color-text)]">{grupo.quantidade}</td>
                    <td className="p-3 text-right text-[var(--color-text)] font-medium">
                      R$ {grupo.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right text-[var(--color-text)] font-medium">
                      R$ {grupo.saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabela de Dados */}
      <div className="bg-[var(--color-surface)] rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
            <p className="mt-4 text-[var(--color-text-secondary)]">Carregando dados...</p>
          </div>
        ) : contasFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <FiFileText size={48} className="mx-auto text-[var(--color-text-secondary)] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
              Nenhum título encontrado
            </h3>
            <p className="text-[var(--color-text-secondary)]">
              Tente ajustar os filtros para ver os resultados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                <tr>
                  <SortableTableHeader
                    label="Documento"
                    sortKey="documento"
                    currentSortKey={sortConfig?.key as string}
                    sortDirection={sortConfig?.direction}
                    onSort={requestSort}
                    align="left"
                  />
                  <SortableTableHeader
                    label="Fornecedor"
                    sortKey="pessoa.fantasiaApelido"
                    currentSortKey={sortConfig?.key as string}
                    sortDirection={sortConfig?.direction}
                    onSort={requestSort}
                    align="left"
                  />
                  <SortableTableHeader
                    label="Descrição"
                    sortKey="descricao"
                    currentSortKey={sortConfig?.key as string}
                    sortDirection={sortConfig?.direction}
                    onSort={requestSort}
                    align="left"
                  />
                  <SortableTableHeader
                    label="Emissão"
                    sortKey="data_emissao"
                    currentSortKey={sortConfig?.key as string}
                    sortDirection={sortConfig?.direction}
                    onSort={requestSort}
                    align="left"
                  />
                  <SortableTableHeader
                    label="Vencimento"
                    sortKey="vencimento"
                    currentSortKey={sortConfig?.key as string}
                    sortDirection={sortConfig?.direction}
                    onSort={requestSort}
                    align="left"
                  />
                  <SortableTableHeader
                    label="Valor Total"
                    sortKey="valor_total"
                    currentSortKey={sortConfig?.key as string}
                    sortDirection={sortConfig?.direction}
                    onSort={requestSort}
                    align="right"
                  />
                  <SortableTableHeader
                    label="Saldo"
                    sortKey="saldo"
                    currentSortKey={sortConfig?.key as string}
                    sortDirection={sortConfig?.direction}
                    onSort={requestSort}
                    align="right"
                  />
                  <SortableTableHeader
                    label="Status"
                    sortKey="status"
                    currentSortKey={sortConfig?.key as string}
                    sortDirection={sortConfig?.direction}
                    onSort={requestSort}
                    align="center"
                  />
                </tr>
              </thead>
              <tbody>
                {filteredSortedPaginatedData.map(conta => (
                  <tr
                    key={conta.id}
                    className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg)]"
                  >
                    <td className="p-3 text-[var(--color-text)] font-mono text-sm">
                      {conta.documento}/{conta.serie || '1'}-{conta.parcela}
                    </td>
                    <td className="p-3 text-[var(--color-text)]">
                      {conta.pessoa.fantasiaApelido || conta.pessoa.razaoNome || 'N/A'}
                    </td>
                    <td className="p-3 text-[var(--color-text)]">{conta.descricao}</td>
                    <td className="p-3 text-[var(--color-text)] text-sm">
                      {new Date(conta.data_emissao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3 text-[var(--color-text)] text-sm">
                      {new Date(conta.vencimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3 text-right text-[var(--color-text)] font-medium">
                      R$ {conta.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right text-[var(--color-text)] font-bold">
                      R$ {conta.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(conta.status)}`}
                      >
                        {conta.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && contasFiltradas.length > 0 && (
          <PaginationControls
            config={paginationConfig}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            onFirstPage={goToFirstPage}
            onLastPage={goToLastPage}
            onNextPage={goToNextPage}
            onPreviousPage={goToPreviousPage}
          />
        )}
      </div>
    </div>
  );
};
