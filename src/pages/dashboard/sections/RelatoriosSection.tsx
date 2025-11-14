import React, { useState, useEffect } from 'react';
import { FiDownload, FiFilter, FiFileText, FiX } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TipoRelatorio, FormatoExportacao, TipoPessoa } from '../../../types/api.types';

// Configure pdfMake fonts
(pdfMake as any).vfs = pdfFonts;
import type { FiltroRelatorio, TotaisRelatorio, Pessoa } from '../../../types/api.types';
import {
  pessoaService,
  contaBancariaService,
  planoContasService,
  contaReceberService,
  contaPagarService,
} from '../../../services';

export const RelatoriosSection: React.FC = () => {
  const [tipoRelatorio, setTipoRelatorio] = useState<TipoRelatorio>(TipoRelatorio.PESSOAS);
  const [showFiltros, setShowFiltros] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState<any[]>([]);
  const [dadosFiltrados, setDadosFiltrados] = useState<any[]>([]);
  const [totais, setTotais] = useState<TotaisRelatorio>({ total: 0, ativos: 0, inativos: 0 });

  const [filtros, setFiltros] = useState<FiltroRelatorio>({
    dataInicio: '',
    dataFim: '',
    nome: '',
    documento: '',
    situacao: '',
    ativo: undefined,
    tipo: '',
  });

  useEffect(() => {
    carregarDados();
  }, [tipoRelatorio]);

  // Update filtered data when dados or filtros change
  useEffect(() => {
    let filtered = [...dados];

    if (filtros.nome) {
      filtered = filtered.filter(item => {
        const nome = item.razaoNome || item.nome || item.descricao || item.razao_social || '';
        return nome.toLowerCase().includes(filtros.nome!.toLowerCase());
      });
    }

    if (filtros.documento) {
      filtered = filtered.filter(item => {
        const doc = item.documento || item.cnpj_cpf || '';
        return doc.includes(filtros.documento!);
      });
    }

    if (filtros.ativo !== undefined) {
      filtered = filtered.filter(item => {
        if ('ativo' in item) return item.ativo === filtros.ativo;
        if ('status' in item) {
          return filtros.ativo ? item.status !== 'CANCELADO' : item.status === 'CANCELADO';
        }
        return true;
      });
    }

    if (filtros.situacao) {
      filtered = filtered.filter(item => {
        if ('situacao' in item) return item.situacao === filtros.situacao;
        if ('status' in item) return item.status === filtros.situacao;
        return true;
      });
    }

    if (filtros.tipo && tipoRelatorio === TipoRelatorio.PESSOAS) {
      filtered = filtered.filter((item: Pessoa) => {
        return item.tipos?.some(t => t.tipo === filtros.tipo);
      });
    }

    if (filtros.dataInicio) {
      filtered = filtered.filter(item => {
        const data = new Date(item.criadoEm || item.created_at || item.dataEmissao);
        return data >= new Date(filtros.dataInicio!);
      });
    }

    if (filtros.dataFim) {
      filtered = filtered.filter(item => {
        const data = new Date(item.criadoEm || item.created_at || item.dataEmissao);
        return data <= new Date(filtros.dataFim!);
      });
    }

    setDadosFiltrados(filtered);
    calcularTotais(filtered);
  }, [dados, filtros, tipoRelatorio]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      let dadosCarregados: any[] = [];

      switch (tipoRelatorio) {
        case TipoRelatorio.PESSOAS:
          dadosCarregados = await pessoaService.findAll();
          break;
        case TipoRelatorio.CONTAS_BANCARIAS:
          dadosCarregados = await contaBancariaService.findAll();
          break;
        case TipoRelatorio.PLANO_CONTAS:
          const planoContasResponse = await planoContasService.findAll();
          dadosCarregados = planoContasResponse.data || [];
          break;
        case TipoRelatorio.CONTAS_RECEBER:
          dadosCarregados = await contaReceberService.findAll();
          break;
        case TipoRelatorio.CONTAS_PAGAR:
          dadosCarregados = await contaPagarService.findAll();
          break;
      }

      setDados(dadosCarregados);
      calcularTotais(dadosCarregados);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const calcularTotais = (dados: any[]) => {
    const total = dados.length;
    const ativos = dados.filter(item => {
      if ('ativo' in item) return item.ativo;
      if ('status' in item) return item.status !== 'CANCELADO';
      return true;
    }).length;
    const inativos = total - ativos;

    setTotais({ total, ativos, inativos });
  };


  const exportarDados = (formato: FormatoExportacao) => {
    switch (formato) {
      case FormatoExportacao.CSV:
        exportarCSV(dadosFiltrados);
        break;
      case FormatoExportacao.XLSX:
        exportarXLSX(dadosFiltrados);
        break;
      case FormatoExportacao.PDF:
        exportarPDF(dadosFiltrados);
        break;
    }
  };

  const exportarCSV = (dados: any[]) => {
    if (dados.length === 0) return;

    const headers = Object.keys(dados[0]);
    const csvContent = [
      headers.join(','),
      ...dados.map(item =>
        headers
          .map(header => {
            const value = item[header];
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value);
            return `"${value}"`;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-${tipoRelatorio}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportarXLSX = (dados: any[]) => {
    if (dados.length === 0) {
      alert('Não há dados para exportar');
      return;
    }

    // Preparar dados formatados para Excel
    const dadosFormatados = dados.map(item => {
      switch (tipoRelatorio) {
        case TipoRelatorio.PESSOAS:
          return {
            Nome: item.razaoNome || item.fantasiaApelido,
            Documento: item.documento || 'N/A',
            Tipos: item.tipos?.map((t: any) => t.tipo).join(', ') || 'N/A',
            Email: item.email || 'N/A',
            Telefone: item.telefone || 'N/A',
            Situação: item.ativo ? 'Ativo' : 'Inativo',
            'Data Cadastro': item.criadoEm
              ? new Date(item.criadoEm).toLocaleDateString('pt-BR')
              : 'N/A',
          };

        case TipoRelatorio.CONTAS_BANCARIAS:
          return {
            Banco: item.banco,
            Agência: item.agencia,
            Conta: item.conta,
            Tipo: item.tipo,
            'Saldo Atual': item.saldo_atual,
            Descrição: item.descricao,
            Status: item.ativo ? 'Ativa' : 'Inativa',
          };

        case TipoRelatorio.PLANO_CONTAS:
          return {
            Código: item.codigo,
            Descrição: item.descricao,
            Tipo: item.tipo,
            Nível: item.nivel,
            'Permite Lançamento': item.permite_lancamento ? 'Sim' : 'Não',
            Status: item.ativo ? 'Ativo' : 'Inativo',
          };

        case TipoRelatorio.CONTAS_RECEBER:
          return {
            Documento: `${item.documento}/${item.serie}-${item.parcela}`,
            Cliente: item.pessoaNome || 'N/A',
            Descrição: item.descricao,
            'Valor Total': item.valorTotal,
            Saldo: item.saldo,
            Vencimento: new Date(item.vencimento).toLocaleDateString('pt-BR'),
            Status: item.status,
          };

        case TipoRelatorio.CONTAS_PAGAR:
          return {
            Documento: `${item.documento}/${item.serie}-${item.parcela}`,
            Fornecedor: item.pessoaNome || 'N/A',
            Descrição: item.descricao,
            'Valor Total': item.valor_total,
            Saldo: item.saldo,
            Vencimento: new Date(item.vencimento).toLocaleDateString('pt-BR'),
            Status: item.status,
          };

        default:
          return item;
      }
    });

    // Criar workbook e worksheet
    const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');

    // Ajustar largura das colunas
    const colWidths = Object.keys(dadosFormatados[0]).map(key => ({
      wch: Math.max(key.length, 15),
    }));
    worksheet['!cols'] = colWidths;

    // Gerar arquivo
    const fileName = `relatorio-${tipoRelatorio}-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const exportarPDF = (dados: any[]) => {
    if (dados.length === 0) {
      alert('Não há dados para exportar');
      return;
    }

    // Definir cabeçalhos e corpo da tabela baseado no tipo de relatório
    let headers: string[] = [];
    let body: any[][] = [];

    switch (tipoRelatorio) {
      case TipoRelatorio.PESSOAS:
        headers = ['Nome', 'Documento', 'Tipos', 'Email', 'Situação'];
        body = dados.map(item => [
          item.razaoNome || item.fantasiaApelido,
          item.documento || 'N/A',
          item.tipos?.map((t: any) => t.tipo).join(', ') || 'N/A',
          item.email || 'N/A',
          item.ativo ? 'Ativo' : 'Inativo',
        ]);
        break;

      case TipoRelatorio.CONTAS_BANCARIAS:
        headers = ['Banco', 'Agência', 'Conta', 'Tipo', 'Saldo', 'Status'];
        body = dados.map(item => [
          item.banco,
          item.agencia,
          item.conta,
          item.tipo,
          `R$ ${item.saldo_atual?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          item.ativo ? 'Ativa' : 'Inativa',
        ]);
        break;

      case TipoRelatorio.PLANO_CONTAS:
        headers = ['Código', 'Descrição', 'Tipo', 'Nível', 'Lançamento', 'Status'];
        body = dados.map(item => [
          item.codigo,
          item.descricao,
          item.tipo,
          item.nivel.toString(),
          item.permite_lancamento ? 'Sim' : 'Não',
          item.ativo ? 'Ativo' : 'Inativo',
        ]);
        break;

      case TipoRelatorio.CONTAS_RECEBER:
        headers = ['Documento', 'Cliente', 'Descrição', 'Valor', 'Saldo', 'Vencimento', 'Status'];
        body = dados.map(item => [
          `${item.documento}/${item.serie}-${item.parcela}`,
          item.pessoaNome || 'N/A',
          item.descricao,
          `R$ ${item.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          `R$ ${item.saldo?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          new Date(item.vencimento).toLocaleDateString('pt-BR'),
          item.status,
        ]);
        break;

      case TipoRelatorio.CONTAS_PAGAR:
        headers = [
          'Documento',
          'Fornecedor',
          'Descrição',
          'Valor',
          'Saldo',
          'Vencimento',
          'Status',
        ];
        body = dados.map(item => [
          `${item.documento}/${item.serie}-${item.parcela}`,
          item.pessoaNome || 'N/A',
          item.descricao,
          `R$ ${item.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          `R$ ${item.saldo?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          new Date(item.vencimento).toLocaleDateString('pt-BR'),
          item.status,
        ]);
        break;
    }

    // Obter título do relatório
    const titulos: Record<TipoRelatorio, string> = {
      [TipoRelatorio.PESSOAS]: 'Relatório de Pessoas',
      [TipoRelatorio.CONTAS_BANCARIAS]: 'Relatório de Contas Bancárias',
      [TipoRelatorio.PLANO_CONTAS]: 'Relatório de Plano de Contas',
      [TipoRelatorio.CONTAS_RECEBER]: 'Relatório de Contas a Receber',
      [TipoRelatorio.CONTAS_PAGAR]: 'Relatório de Contas a Pagar',
    };

    // Definir documento PDF
    const docDefinition: any = {
      pageSize: 'A4',
      pageOrientation: headers.length > 5 ? 'landscape' : 'portrait',
      pageMargins: [40, 60, 40, 60],
      content: [
        {
          text: titulos[tipoRelatorio],
          style: 'header',
          margin: [0, 0, 0, 10],
        },
        {
          text: `Data de Geração: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
          style: 'subheader',
          margin: [0, 0, 0, 5],
        },
        {
          text: `Total de Registros: ${totais.total} | Ativos: ${totais.ativos} | Inativos: ${totais.inativos}`,
          style: 'subheader',
          margin: [0, 0, 0, 20],
        },
        {
          table: {
            headerRows: 1,
            widths: headers.map(() => 'auto'),
            body: [headers.map(h => ({ text: h, style: 'tableHeader' })), ...body],
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
      ],
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
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'white',
          fillColor: '#3B82F6',
          alignment: 'center',
        },
      },
      defaultStyle: {
        fontSize: 9,
      },
    };

    // Gerar e baixar PDF
    const fileName = `relatorio-${tipoRelatorio}-${new Date().toISOString().split('T')[0]}.pdf`;
    (pdfMake as any).createPdf(docDefinition).download(fileName);
  };

  const limparFiltros = () => {
    setFiltros({
      dataInicio: '',
      dataFim: '',
      nome: '',
      documento: '',
      situacao: '',
      ativo: undefined,
      tipo: '',
    });
    carregarDados();
  };

  const dadosExibidos = dadosFiltrados;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Relatórios</h1>
      </div>

      {/* Seletor de Tipo de Relatório */}
      <div className="bg-[var(--color-surface)] rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
          Tipo de Relatório
        </label>
        <select
          value={tipoRelatorio}
          onChange={e => setTipoRelatorio(e.target.value as TipoRelatorio)}
          className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        >
          <option value={TipoRelatorio.PESSOAS}>Pessoas (Clientes/Fornecedores)</option>
          <option value={TipoRelatorio.CONTAS_BANCARIAS}>Contas Bancárias</option>
          <option value={TipoRelatorio.PLANO_CONTAS}>Plano de Contas</option>
          <option value={TipoRelatorio.CONTAS_RECEBER}>Contas a Receber</option>
          <option value={TipoRelatorio.CONTAS_PAGAR}>Contas a Pagar</option>
        </select>
      </div>

      {/* Totalizadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--color-surface)] rounded-lg shadow p-4">
          <div className="text-sm text-[var(--color-text-secondary)] mb-1">Total de Registros</div>
          <div className="text-2xl font-bold text-[var(--color-text-primary)]">{totais.total}</div>
        </div>
        <div className="bg-[var(--color-surface)] rounded-lg shadow p-4">
          <div className="text-sm text-[var(--color-text-secondary)] mb-1">Ativos</div>
          <div className="text-2xl font-bold text-green-600">{totais.ativos}</div>
        </div>
        <div className="bg-[var(--color-surface)] rounded-lg shadow p-4">
          <div className="text-sm text-[var(--color-text-secondary)] mb-1">Inativos</div>
          <div className="text-2xl font-bold text-red-600">{totais.inativos}</div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowFiltros(!showFiltros)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-md hover:bg-[var(--color-bg)] transition-colors"
        >
          <FiFilter size={18} />
          {showFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </button>

        <button
          onClick={() => exportarDados(FormatoExportacao.CSV)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <FiDownload size={18} />
          Exportar CSV
        </button>

        <button
          onClick={() => exportarDados(FormatoExportacao.XLSX)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FiDownload size={18} />
          Exportar Excel
        </button>

        <button
          onClick={() => exportarDados(FormatoExportacao.PDF)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <FiFileText size={18} />
          Exportar PDF
        </button>
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
                Nome/Descrição
              </label>
              <input
                type="text"
                value={filtros.nome}
                onChange={e => setFiltros(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Filtrar por nome..."
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                CNPJ/CPF/Documento
              </label>
              <input
                type="text"
                value={filtros.documento}
                onChange={e => setFiltros(prev => ({ ...prev, documento: e.target.value }))}
                placeholder="Filtrar por documento..."
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Situação
              </label>
              <select
                value={filtros.ativo === undefined ? '' : filtros.ativo ? 'ativo' : 'inativo'}
                onChange={e =>
                  setFiltros(prev => ({
                    ...prev,
                    ativo: e.target.value === '' ? undefined : e.target.value === 'ativo',
                  }))
                }
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">Todos</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
            </div>

            {tipoRelatorio === TipoRelatorio.PESSOAS && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Tipo de Pessoa
                </label>
                <select
                  value={filtros.tipo}
                  onChange={e => setFiltros(prev => ({ ...prev, tipo: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="">Todos</option>
                  {Object.values(TipoPessoa).map(tipo => (
                    <option key={tipo} value={tipo}>
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}

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

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                // Filters are automatically applied via useEffect
                setShowFiltros(false);
              }}
              className="px-6 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Aplicar Filtros
            </button>
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
        ) : dadosExibidos.length === 0 ? (
          <div className="text-center py-12">
            <FiFileText size={48} className="mx-auto text-[var(--color-text-secondary)] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
              Nenhum registro encontrado
            </h3>
            <p className="text-[var(--color-text-secondary)]">
              Tente ajustar os filtros ou selecione outro tipo de relatório.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                <tr>
                  {tipoRelatorio === TipoRelatorio.PESSOAS && (
                    <>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">Nome</th>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">
                        Documento
                      </th>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">Tipos</th>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">Email</th>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">Situação</th>
                    </>
                  )}
                  {tipoRelatorio === TipoRelatorio.CONTAS_BANCARIAS && (
                    <>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">Banco</th>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">Agência</th>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">Conta</th>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">Tipo</th>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">Saldo</th>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">Status</th>
                    </>
                  )}
                  {tipoRelatorio === TipoRelatorio.PLANO_CONTAS && (
                    <>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">Código</th>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">
                        Descrição
                      </th>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">Tipo</th>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">Nível</th>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">
                        Lançamento
                      </th>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">Status</th>
                    </>
                  )}
                  {tipoRelatorio === TipoRelatorio.CONTAS_RECEBER && (
                    <>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">
                        Documento
                      </th>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">Cliente</th>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">
                        Descrição
                      </th>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">Valor</th>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">Saldo</th>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">
                        Vencimento
                      </th>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">Status</th>
                    </>
                  )}
                  {tipoRelatorio === TipoRelatorio.CONTAS_PAGAR && (
                    <>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">
                        Documento
                      </th>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">
                        Fornecedor
                      </th>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">
                        Descrição
                      </th>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">Valor</th>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">Saldo</th>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">
                        Vencimento
                      </th>
                      <th className="text-left p-4 text-[var(--color-text-secondary)]">Status</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {dadosExibidos.map((item: any, index: number) => (
                  <tr
                    key={item.id || index}
                    className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg)]"
                  >
                    {tipoRelatorio === TipoRelatorio.PESSOAS && (
                      <>
                        <td className="p-4 text-[var(--color-text)]">
                          {item.razaoNome || item.fantasiaApelido}
                        </td>
                        <td className="p-4 text-[var(--color-text)]">{item.documento || 'N/A'}</td>
                        <td className="p-4 text-[var(--color-text)]">
                          {item.tipos?.map((t: any) => t.tipo).join(', ') || 'N/A'}
                        </td>
                        <td className="p-4 text-[var(--color-text)]">{item.email || 'N/A'}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              item.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                      </>
                    )}
                    {tipoRelatorio === TipoRelatorio.CONTAS_BANCARIAS && (
                      <>
                        <td className="p-4 text-[var(--color-text)]">{item.banco}</td>
                        <td className="p-4 text-[var(--color-text)]">{item.agencia}</td>
                        <td className="p-4 text-[var(--color-text)]">{item.conta}</td>
                        <td className="p-4 text-[var(--color-text)]">{item.tipo}</td>
                        <td className="p-4 text-[var(--color-text)]">
                          R${' '}
                          {item.saldo_atual?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              item.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.ativo ? 'Ativa' : 'Inativa'}
                          </span>
                        </td>
                      </>
                    )}
                    {tipoRelatorio === TipoRelatorio.PLANO_CONTAS && (
                      <>
                        <td className="p-4 text-[var(--color-text)]">{item.codigo}</td>
                        <td className="p-4 text-[var(--color-text)]">{item.descricao}</td>
                        <td className="p-4 text-[var(--color-text)]">{item.tipo}</td>
                        <td className="p-4 text-[var(--color-text)]">{item.nivel}</td>
                        <td className="p-4 text-[var(--color-text)]">
                          {item.permite_lancamento ? 'Sim' : 'Não'}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              item.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                      </>
                    )}
                    {tipoRelatorio === TipoRelatorio.CONTAS_RECEBER && (
                      <>
                        <td className="p-4 text-[var(--color-text)]">
                          {item.documento}/{item.serie}-{item.parcela}
                        </td>
                        <td className="p-4 text-[var(--color-text)]">{item.pessoaNome || 'N/A'}</td>
                        <td className="p-4 text-[var(--color-text)]">{item.descricao}</td>
                        <td className="p-4 text-[var(--color-text)]">
                          R${' '}
                          {item.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-[var(--color-text)]">
                          R$ {item.saldo?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-[var(--color-text)]">
                          {new Date(item.vencimento).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-4 text-[var(--color-text)]">{item.status}</td>
                      </>
                    )}
                    {tipoRelatorio === TipoRelatorio.CONTAS_PAGAR && (
                      <>
                        <td className="p-4 text-[var(--color-text)]">
                          {item.documento}/{item.serie}-{item.parcela}
                        </td>
                        <td className="p-4 text-[var(--color-text)]">{item.pessoaNome || 'N/A'}</td>
                        <td className="p-4 text-[var(--color-text)]">{item.descricao}</td>
                        <td className="p-4 text-[var(--color-text)]">
                          R${' '}
                          {item.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-[var(--color-text)]">
                          R$ {item.saldo?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-[var(--color-text)]">
                          {new Date(item.vencimento).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-4 text-[var(--color-text)]">{item.status}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
