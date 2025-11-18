import React, { useState, useEffect } from 'react';
import { FiDownload, FiFilter, FiX, FiCalendar, FiDollarSign, FiCreditCard } from 'react-icons/fi';
import { RiBuilding4Line } from 'react-icons/ri';
import * as XLSX from 'xlsx';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import type {
  ContaBancaria,
  Empresa,
  FluxoCaixaResponse,
  FluxoCaixaFiltros,
  FluxoCaixaLinha,
} from '../../../types/api.types';
import { fluxoCaixaService } from '../../../services/fluxo-caixa.service';
import { contaBancariaService } from '../../../services/conta-bancaria.service';
import { empresaService } from '../../../services';
import { useAuth } from '../../../context/AuthContext';

// Configure pdfMake fonts
(pdfMake as any).vfs = pdfFonts;

type TipoVisualizacao = 'realizado' | 'previsto' | 'ambos';

export const FluxoCaixaSection: React.FC = () => {
  const { user } = useAuth();
  const [dados, setDados] = useState<FluxoCaixaResponse | null>(null);
  const [contasBancarias, setContasBancarias] = useState<ContaBancaria[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFiltros, setShowFiltros] = useState(true);
  const [tipoVisualizacao, setTipoVisualizacao] = useState<TipoVisualizacao>('ambos');
  const [linhaExpandida, setLinhaExpandida] = useState<string | null>(null);

  const hoje = new Date();
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  const [filtros, setFiltros] = useState<FluxoCaixaFiltros>({
    dataInicio: primeiroDiaMes.toISOString().split('T')[0],
    dataFim: ultimoDiaMes.toISOString().split('T')[0],
    contaBancariaId: '',
    empresaId: '',
    consolidado: false,
  });

  useEffect(() => {
    carregarContasBancarias();
    carregarEmpresas();
  }, []);

  useEffect(() => {
    if (filtros.dataInicio && filtros.dataFim) {
      buscarDados();
    }
  }, [filtros]);

  const carregarContasBancarias = async () => {
    try {
      const data = await contaBancariaService.findAll();
      setContasBancarias(data);
    } catch (error) {
      console.error('Erro ao carregar contas bancárias:', error);
    }
  };

  const carregarEmpresas = async () => {
    try {
      if (user?.clienteId) {
        const data = await empresaService.findByCliente(user.clienteId);
        setEmpresas(data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const buscarDados = async () => {
    if (!filtros.dataInicio || !filtros.dataFim) {
      return;
    }

    setLoading(true);
    try {
      const response = await fluxoCaixaService.buscarRelatorio(filtros);
      setDados(response);
    } catch (error) {
      console.error('Erro ao buscar fluxo de caixa:', error);
    } finally {
      setLoading(false);
    }
  };

  const limparFiltros = () => {
    setFiltros({
      dataInicio: primeiroDiaMes.toISOString().split('T')[0],
      dataFim: ultimoDiaMes.toISOString().split('T')[0],
      contaBancariaId: '',
      empresaId: '',
      consolidado: false,
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

  const getClasseSaldo = (valor: number) => {
    if (valor > 0) return 'text-green-600';
    if (valor < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const toggleLinhaExpandida = (data: string) => {
    setLinhaExpandida(linhaExpandida === data ? null : data);
  };

  // Exportação CSV
  const exportarCSV = () => {
    if (!dados || dados.linhas.length === 0) {
      alert('Não há dados para exportar');
      return;
    }

    const headers = [
      'Data',
      'Entradas Realizadas',
      'Entradas Previstas',
      'Saídas Realizadas',
      'Saídas Previstas',
      'Saldo Diário Realizado',
      'Saldo Diário Previsto',
      'Saldo Acumulado Realizado',
      'Saldo Acumulado Previsto',
    ];

    const rows = dados.linhas.map((linha: FluxoCaixaLinha) => [
      formatarData(linha.data),
      linha.entradasRealizadas.toFixed(2),
      linha.entradasPrevistas.toFixed(2),
      linha.saidasRealizadas.toFixed(2),
      linha.saidasPrevistas.toFixed(2),
      linha.saldoDiarioRealizado.toFixed(2),
      linha.saldoDiarioPrevisto.toFixed(2),
      linha.saldoAcumuladoRealizado.toFixed(2),
      linha.saldoAcumuladoPrevisto.toFixed(2),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `fluxo-caixa-${filtros.dataInicio}-${filtros.dataFim}.csv`;
    link.click();
  };

  // Exportação XLSX
  const exportarXLSX = () => {
    if (!dados || dados.linhas.length === 0) {
      alert('Não há dados para exportar');
      return;
    }

    const worksheetData = [
      [
        'Data',
        'Entradas Realizadas',
        'Entradas Previstas',
        'Saídas Realizadas',
        'Saídas Previstas',
        'Saldo Diário Realizado',
        'Saldo Diário Previsto',
        'Saldo Acumulado Realizado',
        'Saldo Acumulado Previsto',
      ],
      ...dados.linhas.map((linha: FluxoCaixaLinha) => [
        formatarData(linha.data),
        linha.entradasRealizadas,
        linha.entradasPrevistas,
        linha.saidasRealizadas,
        linha.saidasPrevistas,
        linha.saldoDiarioRealizado,
        linha.saldoDiarioPrevisto,
        linha.saldoAcumuladoRealizado,
        linha.saldoAcumuladoPrevisto,
      ]),
      [],
      ['TOTAIS'],
      ['Total Entradas Realizadas', dados.totais.totalEntradasRealizadas],
      ['Total Entradas Previstas', dados.totais.totalEntradasPrevistas],
      ['Total Saídas Realizadas', dados.totais.totalSaidasRealizadas],
      ['Total Saídas Previstas', dados.totais.totalSaidasPrevistas],
      ['Saldo Final Realizado', dados.totais.saldoFinalRealizado],
      ['Saldo Final Previsto', dados.totais.saldoFinalPrevisto],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fluxo de Caixa');

    XLSX.writeFile(workbook, `fluxo-caixa-${filtros.dataInicio}-${filtros.dataFim}.xlsx`);
  };

  // Exportação PDF
  const exportarPDF = () => {
    if (!dados || dados.linhas.length === 0) {
      alert('Não há dados para exportar');
      return;
    }

    const documentDefinition: any = {
      pageOrientation: 'landscape',
      content: [
        {
          text: 'Relatório de Fluxo de Caixa',
          style: 'header',
          alignment: 'center',
        },
        {
          text: `Período: ${formatarData(filtros.dataInicio)} a ${formatarData(filtros.dataFim)}`,
          style: 'subheader',
          alignment: 'center',
          margin: [0, 5, 0, 15],
        },
        ...(dados.contaBancaria
          ? [
              {
                text: `Conta: ${dados.contaBancaria.banco} - Ag: ${dados.contaBancaria.agencia} - Conta: ${dados.contaBancaria.conta}`,
                margin: [0, 0, 0, 10],
              },
            ]
          : []),
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
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Data', style: 'tableHeader' },
                { text: 'Ent. Real.', style: 'tableHeader' },
                { text: 'Ent. Prev.', style: 'tableHeader' },
                { text: 'Saí. Real.', style: 'tableHeader' },
                { text: 'Saí. Prev.', style: 'tableHeader' },
                { text: 'Saldo Dia Real.', style: 'tableHeader' },
                { text: 'Saldo Dia Prev.', style: 'tableHeader' },
                { text: 'Saldo Acum. Real.', style: 'tableHeader' },
                { text: 'Saldo Acum. Prev.', style: 'tableHeader' },
              ],
              ...dados.linhas.map((linha: FluxoCaixaLinha) => [
                formatarData(linha.data),
                formatarMoeda(linha.entradasRealizadas),
                formatarMoeda(linha.entradasPrevistas),
                formatarMoeda(linha.saidasRealizadas),
                formatarMoeda(linha.saidasPrevistas),
                formatarMoeda(linha.saldoDiarioRealizado),
                formatarMoeda(linha.saldoDiarioPrevisto),
                formatarMoeda(linha.saldoAcumuladoRealizado),
                formatarMoeda(linha.saldoAcumuladoPrevisto),
              ]),
            ],
          },
          layout: 'lightHorizontalLines',
        },
        {
          text: '\nTOTAIS',
          style: 'subheader',
          margin: [0, 20, 0, 10],
        },
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'REALIZADO', style: 'totalsHeader' },
                { text: `Entradas: ${formatarMoeda(dados.totais.totalEntradasRealizadas)}` },
                { text: `Saídas: ${formatarMoeda(dados.totais.totalSaidasRealizadas)}` },
                {
                  text: `Saldo Final: ${formatarMoeda(dados.totais.saldoFinalRealizado)}`,
                  bold: true,
                },
              ],
            },
            {
              width: '50%',
              stack: [
                { text: 'PREVISTO', style: 'totalsHeader' },
                { text: `Entradas: ${formatarMoeda(dados.totais.totalEntradasPrevistas)}` },
                { text: `Saídas: ${formatarMoeda(dados.totais.totalSaidasPrevistas)}` },
                {
                  text: `Saldo Final: ${formatarMoeda(dados.totais.saldoFinalPrevisto)}`,
                  bold: true,
                },
              ],
            },
          ],
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
        totalsHeader: {
          fontSize: 12,
          bold: true,
          margin: [0, 0, 0, 5],
        },
      },
      defaultStyle: {
        fontSize: 9,
      },
    };

    pdfMake
      .createPdf(documentDefinition)
      .download(`fluxo-caixa-${filtros.dataInicio}-${filtros.dataFim}.pdf`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Fluxo de Caixa</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Visualize entradas, saídas e saldos realizados e previstos
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

            {/* Conta Bancária */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                <FiCreditCard className="inline mr-2" />
                Conta Bancária
              </label>
              <select
                value={filtros.contaBancariaId || ''}
                onChange={e => setFiltros({ ...filtros, contaBancariaId: e.target.value })}
                className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              >
                <option value="">Todas as contas</option>
                {contasBancarias.map(conta => (
                  <option key={conta.id} value={conta.id}>
                    {conta.banco} - {conta.agencia}/{conta.conta}
                  </option>
                ))}
              </select>
            </div>

            {/* Empresa */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                <RiBuilding4Line className="inline mr-2" />
                Empresa
              </label>
              <select
                value={filtros.empresaId || ''}
                onChange={e => setFiltros({ ...filtros, empresaId: e.target.value })}
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

            {/* Tipo de Visualização */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                <FiDollarSign className="inline mr-2" />
                Visualização
              </label>
              <select
                value={tipoVisualizacao}
                onChange={e => setTipoVisualizacao(e.target.value as TipoVisualizacao)}
                className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              >
                <option value="ambos">Realizado e Previsto</option>
                <option value="realizado">Apenas Realizado</option>
                <option value="previsto">Apenas Previsto</option>
              </select>
            </div>

            {/* Botão Limpar */}
            <div className="flex items-end">
              <button
                onClick={limparFiltros}
                className="w-full px-4 py-2 bg-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-border-hover)] transition-colors"
              >
                <FiX className="inline mr-2" />
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cards de Totais */}
      {dados && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Entradas Realizadas */}
          {(tipoVisualizacao === 'realizado' || tipoVisualizacao === 'ambos') && (
            <div className="bg-[var(--color-card)] rounded-lg p-6 border border-[var(--color-border)]">
              <p className="text-sm text-[var(--color-text-secondary)] mb-2">Entradas Realizadas</p>
              <p className="text-3xl font-bold text-green-600">
                {formatarMoeda(dados.totais.totalEntradasRealizadas)}
              </p>
            </div>
          )}

          {/* Saídas Realizadas */}
          {(tipoVisualizacao === 'realizado' || tipoVisualizacao === 'ambos') && (
            <div className="bg-[var(--color-card)] rounded-lg p-6 border border-[var(--color-border)]">
              <p className="text-sm text-[var(--color-text-secondary)] mb-2">Saídas Realizadas</p>
              <p className="text-3xl font-bold text-red-600">
                {formatarMoeda(dados.totais.totalSaidasRealizadas)}
              </p>
            </div>
          )}

          {/* Saldo Final Realizado */}
          {(tipoVisualizacao === 'realizado' || tipoVisualizacao === 'ambos') && (
            <div className="bg-[var(--color-card)] rounded-lg p-6 border border-[var(--color-border)]">
              <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                Saldo Final Realizado
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {formatarMoeda(dados.totais.saldoFinalRealizado)}
              </p>
            </div>
          )}

          {/* Entradas Previstas */}
          {(tipoVisualizacao === 'previsto' || tipoVisualizacao === 'ambos') && (
            <div className="bg-[var(--color-card)] rounded-lg p-6 border border-[var(--color-border)]">
              <p className="text-sm text-[var(--color-text-secondary)] mb-2">Entradas Previstas</p>
              <p className="text-3xl font-bold text-green-600 opacity-70">
                {formatarMoeda(dados.totais.totalEntradasPrevistas)}
              </p>
            </div>
          )}

          {/* Saídas Previstas */}
          {(tipoVisualizacao === 'previsto' || tipoVisualizacao === 'ambos') && (
            <div className="bg-[var(--color-card)] rounded-lg p-6 border border-[var(--color-border)]">
              <p className="text-sm text-[var(--color-text-secondary)] mb-2">Saídas Previstas</p>
              <p className="text-3xl font-bold text-red-600 opacity-70">
                {formatarMoeda(dados.totais.totalSaidasPrevistas)}
              </p>
            </div>
          )}

          {/* Saldo Final Previsto */}
          {(tipoVisualizacao === 'previsto' || tipoVisualizacao === 'ambos') && (
            <div className="bg-[var(--color-card)] rounded-lg p-6 border border-[var(--color-border)]">
              <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                Saldo Final Previsto
              </p>
              <p className="text-3xl font-bold text-blue-600 opacity-70">
                {formatarMoeda(dados.totais.saldoFinalPrevisto)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Botões de Exportação */}
      {dados && dados.linhas.length > 0 && (
        <div className="flex gap-3">
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
      ) : dados && dados.linhas.length > 0 ? (
        <div className="bg-[var(--color-card)] rounded-lg shadow-sm border border-[var(--color-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Data
                  </th>
                  {(tipoVisualizacao === 'realizado' || tipoVisualizacao === 'ambos') && (
                    <>
                      <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                        Entradas Real.
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                        Saídas Real.
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                        Saldo Dia Real.
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                        Saldo Acum. Real.
                      </th>
                    </>
                  )}
                  {(tipoVisualizacao === 'previsto' || tipoVisualizacao === 'ambos') && (
                    <>
                      <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)] opacity-70 uppercase tracking-wider">
                        Entradas Prev.
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)] opacity-70 uppercase tracking-wider">
                        Saídas Prev.
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)] opacity-70 uppercase tracking-wider">
                        Saldo Dia Prev.
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)] opacity-70 uppercase tracking-wider">
                        Saldo Acum. Prev.
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-[var(--color-card)] divide-y divide-[var(--color-border)]">
                {dados.linhas.map((linha: FluxoCaixaLinha) => (
                  <tr
                    key={linha.data}
                    className="hover:bg-[var(--color-bg)] transition-colors cursor-pointer"
                    onClick={() => toggleLinhaExpandida(linha.data)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-text-primary)]">
                      {formatarData(linha.data)}
                    </td>
                    {(tipoVisualizacao === 'realizado' || tipoVisualizacao === 'ambos') && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                          {formatarMoeda(linha.entradasRealizadas)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                          {formatarMoeda(linha.saidasRealizadas)}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${getClasseSaldo(linha.saldoDiarioRealizado)}`}
                        >
                          {formatarMoeda(linha.saldoDiarioRealizado)}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${getClasseSaldo(linha.saldoAcumuladoRealizado)}`}
                        >
                          {formatarMoeda(linha.saldoAcumuladoRealizado)}
                        </td>
                      </>
                    )}
                    {(tipoVisualizacao === 'previsto' || tipoVisualizacao === 'ambos') && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 opacity-70">
                          {formatarMoeda(linha.entradasPrevistas)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 opacity-70">
                          {formatarMoeda(linha.saidasPrevistas)}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium opacity-70 ${getClasseSaldo(linha.saldoDiarioPrevisto)}`}
                        >
                          {formatarMoeda(linha.saldoDiarioPrevisto)}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold opacity-70 ${getClasseSaldo(linha.saldoAcumuladoPrevisto)}`}
                        >
                          {formatarMoeda(linha.saldoAcumuladoPrevisto)}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--color-card)] rounded-lg p-12 text-center border border-[var(--color-border)]">
          <FiDollarSign
            size={48}
            className="mx-auto text-[var(--color-text-secondary)] opacity-50 mb-4"
          />
          <p className="text-[var(--color-text-secondary)] text-lg">
            {filtros.dataInicio && filtros.dataFim
              ? 'Nenhum dado encontrado para o período selecionado'
              : 'Selecione um período para visualizar o fluxo de caixa'}
          </p>
        </div>
      )}
    </div>
  );
};
