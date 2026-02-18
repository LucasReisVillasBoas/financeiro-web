import React, { useState, useEffect, useCallback } from 'react';
import {
  FiUploadCloud,
  FiCheckCircle,
  FiXCircle,
  FiEyeOff,
  FiInfo,
  FiArrowUp,
  FiArrowDown,
  FiX,
  FiAlertCircle,
} from 'react-icons/fi';
import { contaBancariaService } from '../../../services/conta-bancaria.service';
import { extratoBancarioService } from '../../../services/extrato-bancario.service';
import type { ContaBancaria, ExtratoBancario, ResultadoImportacao } from '../../../types/api.types';
import { FormatoExtrato, StatusExtratoItem, TipoTransacao } from '../../../types/api.types';

type TabId = 'importar' | 'sugestoes';

export const ConciliacaoBancariaSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('importar');
  const [contasBancarias, setContasBancarias] = useState<ContaBancaria[]>([]);

  // Import tab state
  const [importContaId, setImportContaId] = useState('');
  const [formato, setFormato] = useState<FormatoExtrato>(FormatoExtrato.OFX);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');
  const [resultado, setResultado] = useState<ResultadoImportacao | null>(null);

  // Suggestions tab state
  const [sugContaId, setSugContaId] = useState('');
  const [extratos, setExtratos] = useState<ExtratoBancario[]>([]);
  const [sugLoading, setSugLoading] = useState(false);
  const [sugError, setSugError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ExtratoBancario | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    const loadContas = async () => {
      try {
        const data = await contaBancariaService.findAll();
        setContasBancarias(data);
      } catch {
        /* silent */
      }
    };
    loadContas();
  }, []);

  const loadExtratosPendentes = useCallback(async () => {
    if (!sugContaId) return;
    setSugLoading(true);
    setSugError('');
    try {
      const data = await extratoBancarioService.findPendentes(sugContaId);
      setExtratos(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar extratos';
      setSugError(msg);
    } finally {
      setSugLoading(false);
    }
  }, [sugContaId]);

  useEffect(() => {
    if (sugContaId) {
      loadExtratosPendentes();
    }
  }, [sugContaId, loadExtratosPendentes]);

  // --- Import handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArquivo(file);
      setImportError('');
      setResultado(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !['csv', 'ofx'].includes(ext)) {
        setImportError('Arquivo deve ter extensão .csv ou .ofx');
        return;
      }

      setArquivo(file);
      setImportError('');
      setResultado(null);
    }
  };

  const handleImportar = async () => {
    if (!importContaId) {
      setImportError('Selecione uma conta bancária');
      return;
    }
    if (!arquivo) {
      setImportError('Selecione um arquivo para importar');
      return;
    }
    setImportLoading(true);
    setImportError('');
    try {
      const response = await extratoBancarioService.importar(importContaId, formato, arquivo);
      if (response.data) {
        setResultado(response.data);
        setArquivo(null);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao importar extrato';
      setImportError(msg);
    } finally {
      setImportLoading(false);
    }
  };

  const handleVerSugestoes = () => {
    setSugContaId(importContaId);
    setActiveTab('sugestoes');
  };

  // --- Suggestion handlers ---
  const handleAceitar = async (itemId: string) => {
    setActionLoading(true);
    try {
      await extratoBancarioService.aceitarSugestao(itemId);
      await loadExtratosPendentes();
      setDetailsOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao aceitar sugestão';
      setSugError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejeitar = async (itemId: string) => {
    setActionLoading(true);
    try {
      await extratoBancarioService.rejeitarSugestao(itemId);
      await loadExtratosPendentes();
      setDetailsOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao rejeitar sugestão';
      setSugError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleIgnorar = async (itemId: string) => {
    setActionLoading(true);
    try {
      await extratoBancarioService.ignorarItem(itemId);
      await loadExtratosPendentes();
      setDetailsOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao ignorar item';
      setSugError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // --- Helpers ---
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (date: string | Date) => new Date(date).toLocaleDateString('pt-BR');

  const getStatusBadge = (status: StatusExtratoItem) => {
    const map: Record<StatusExtratoItem, { label: string; classes: string }> = {
      [StatusExtratoItem.PENDENTE]: {
        label: 'Pendente',
        classes: 'bg-orange-100 text-orange-700',
      },
      [StatusExtratoItem.SUGESTAO]: {
        label: 'Com Sugestão',
        classes: 'bg-blue-100 text-blue-700',
      },
      [StatusExtratoItem.CONCILIADO]: {
        label: 'Conciliado',
        classes: 'bg-green-100 text-green-700',
      },
      [StatusExtratoItem.IGNORADO]: {
        label: 'Ignorado',
        classes: 'bg-gray-100 text-gray-600',
      },
    };
    return map[status] || { label: status, classes: 'bg-gray-100 text-gray-600' };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const extratosComSugestao = extratos.filter(e => e.status === StatusExtratoItem.SUGESTAO);
  const extratosPendentes = extratos.filter(e => e.status === StatusExtratoItem.PENDENTE);

  const acceptedTypes = '.csv,.ofx';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Conciliação Bancária
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Importe extratos bancários e concilie movimentações automaticamente
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--color-border)]">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('importar')}
            className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'importar'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <FiUploadCloud size={16} />
            Importar Extrato
          </button>
          <button
            onClick={() => setActiveTab('sugestoes')}
            className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'sugestoes'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <FiCheckCircle size={16} />
            Sugestões de Conciliação
          </button>
        </div>
      </div>

      {/* Tab: Importar Extrato */}
      {activeTab === 'importar' && (
        <div className="bg-[var(--color-surface)] rounded-lg shadow p-6 space-y-5">
          {/* Conta Bancária */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
              Conta Bancária
            </label>
            <select
              value={importContaId}
              onChange={e => setImportContaId(e.target.value)}
              disabled={importLoading}
              className="w-full border border-[var(--color-border)] rounded-md px-3 py-2 text-sm bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="">Selecione uma conta</option>
              {contasBancarias.map(c => (
                <option key={c.id} value={c.id}>
                  {c.banco} - {c.descricao}
                </option>
              ))}
            </select>
          </div>

          {/* Formato */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
              Formato do Arquivo
            </label>
            <select
              value={formato}
              onChange={e => {
                setFormato(e.target.value as FormatoExtrato);
                setArquivo(null);
              }}
              disabled={importLoading}
              className="w-full border border-[var(--color-border)] rounded-md px-3 py-2 text-sm bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value={FormatoExtrato.OFX}>OFX</option>
              <option value={FormatoExtrato.CSV}>CSV</option>
            </select>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-[var(--color-primary)] bg-blue-50'
                : 'border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-gray-50'
            }`}
          >
            <FiUploadCloud className="mx-auto text-[var(--color-primary)] mb-3" size={40} />
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {arquivo ? arquivo.name : 'Arraste o arquivo aqui ou clique para selecionar'}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Formatos aceitos: CSV ou OFX
            </p>
            <input
              type="file"
              accept={acceptedTypes}
              onChange={handleFileChange}
              className="hidden"
              id="file-upload-conciliacao"
              disabled={importLoading}
            />
            <label
              htmlFor="file-upload-conciliacao"
              className="inline-block mt-3 px-4 py-2 text-sm border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] hover:bg-gray-50 cursor-pointer transition-colors"
            >
              Selecionar Arquivo
            </label>
          </div>

          {/* Import button */}
          <button
            onClick={handleImportar}
            disabled={!arquivo || !importContaId || importLoading}
            className="w-full py-2.5 px-4 rounded-md text-sm font-medium text-white bg-[var(--color-primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {importLoading ? 'Importando...' : 'Importar Extrato'}
          </button>

          {/* Error */}
          {importError && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 text-red-700 text-sm">
              <FiAlertCircle size={16} />
              <span>{importError}</span>
              <button onClick={() => setImportError('')} className="ml-auto">
                <FiX size={14} />
              </button>
            </div>
          )}

          {/* Result */}
          {resultado && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 text-green-700 text-sm">
                <FiCheckCircle size={16} />
                <span className="font-medium">Importação concluída com sucesso!</span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-[var(--color-text-secondary)]">Total Importado</p>
                  <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {resultado.totalImportado}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-green-600">Com Sugestão</p>
                  <p className="text-2xl font-bold text-green-600">{resultado.comSugestao}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-orange-600">Sem Sugestão</p>
                  <p className="text-2xl font-bold text-orange-600">{resultado.semSugestao}</p>
                </div>
              </div>

              {resultado.totalImportado > 0 && (
                <div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full transition-all"
                      style={{
                        width: `${(resultado.comSugestao / resultado.totalImportado) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    {((resultado.comSugestao / resultado.totalImportado) * 100).toFixed(1)}% com
                    sugestões automáticas
                  </p>
                </div>
              )}

              {resultado.comSugestao > 0 && (
                <button
                  onClick={handleVerSugestoes}
                  className="w-full py-2 px-4 rounded-md text-sm font-medium text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-blue-50 transition-colors"
                >
                  Ver Sugestões de Conciliação
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: Sugestões de Conciliação */}
      {activeTab === 'sugestoes' && (
        <div className="bg-[var(--color-surface)] rounded-lg shadow p-6 space-y-5">
          {/* Conta Bancária */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
              Conta Bancária
            </label>
            <select
              value={sugContaId}
              onChange={e => setSugContaId(e.target.value)}
              disabled={sugLoading}
              className="w-full border border-[var(--color-border)] rounded-md px-3 py-2 text-sm bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="">Selecione uma conta</option>
              {contasBancarias.map(c => (
                <option key={c.id} value={c.id}>
                  {c.banco} - {c.descricao}
                </option>
              ))}
            </select>
          </div>

          {/* Stats cards */}
          {sugContaId && !sugLoading && extratos.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-xs text-blue-600">Com Sugestão</p>
                <p className="text-2xl font-bold text-blue-600">{extratosComSugestao.length}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <p className="text-xs text-orange-600">Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">{extratosPendentes.length}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs text-[var(--color-text-secondary)]">Total</p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {extratos.length}
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {sugError && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 text-red-700 text-sm">
              <FiAlertCircle size={16} />
              <span>{sugError}</span>
              <button onClick={() => setSugError('')} className="ml-auto">
                <FiX size={14} />
              </button>
            </div>
          )}

          {/* Loading */}
          {sugLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
            </div>
          )}

          {/* Empty state */}
          {!sugLoading && sugContaId && extratos.length === 0 && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-blue-50 text-blue-700 text-sm">
              <FiInfo size={16} />
              <span>Nenhum extrato pendente de conciliação para esta conta.</span>
            </div>
          )}

          {/* Table */}
          {!sugLoading && extratos.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)]">
                      Data
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)]">
                      Descrição
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)]">
                      Tipo
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-[var(--color-text-secondary)]">
                      Valor
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)]">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)]">
                      Score
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-[var(--color-text-secondary)]">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {extratos.map(extrato => {
                    const statusBadge = getStatusBadge(extrato.status);
                    return (
                      <tr
                        key={extrato.id}
                        className={
                          extrato.status === StatusExtratoItem.SUGESTAO
                            ? 'bg-blue-50/30'
                            : 'bg-[var(--color-surface)]'
                        }
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatDate(extrato.dataTransacao)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[var(--color-text-primary)]">{extrato.descricao}</p>
                          {extrato.documento && (
                            <p className="text-xs text-[var(--color-text-secondary)]">
                              Doc: {extrato.documento}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                              extrato.tipoTransacao === TipoTransacao.CREDITO
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {extrato.tipoTransacao === TipoTransacao.CREDITO ? (
                              <FiArrowUp size={12} />
                            ) : (
                              <FiArrowDown size={12} />
                            )}
                            {extrato.tipoTransacao === TipoTransacao.CREDITO ? 'Crédito' : 'Débito'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <span
                            className={`font-semibold ${
                              extrato.tipoTransacao === TipoTransacao.CREDITO
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {formatCurrency(extrato.valor)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${statusBadge.classes}`}
                          >
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {extrato.scoreMatch != null && (
                            <div className="flex items-center gap-2">
                              <div className="w-14 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${getScoreColor(extrato.scoreMatch)}`}
                                  style={{ width: `${extrato.scoreMatch}%` }}
                                />
                              </div>
                              <span
                                className={`text-xs font-bold ${getScoreTextColor(extrato.scoreMatch)}`}
                              >
                                {extrato.scoreMatch.toFixed(0)}%
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            {extrato.status === StatusExtratoItem.SUGESTAO && (
                              <>
                                <button
                                  onClick={() => handleAceitar(extrato.id)}
                                  disabled={actionLoading}
                                  title="Aceitar Sugestão"
                                  className="p-1.5 rounded-md text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                                >
                                  <FiCheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() => handleRejeitar(extrato.id)}
                                  disabled={actionLoading}
                                  title="Rejeitar Sugestão"
                                  className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                  <FiXCircle size={16} />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {
                                setSelectedItem(extrato);
                                setDetailsOpen(true);
                              }}
                              title="Ver Detalhes"
                              className="p-1.5 rounded-md text-[var(--color-primary)] hover:bg-blue-50 transition-colors"
                            >
                              <FiInfo size={16} />
                            </button>
                            <button
                              onClick={() => handleIgnorar(extrato.id)}
                              disabled={actionLoading}
                              title="Ignorar"
                              className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                              <FiEyeOff size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      {detailsOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[var(--color-surface)] rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Detalhes da Transação
              </h3>
              <button
                onClick={() => setDetailsOpen(false)}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-5">
              {/* Extrato data */}
              <div>
                <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                  Extrato Bancário
                </h4>
                <div className="bg-gray-50 rounded-md p-3 space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Data:</span>{' '}
                    {formatDate(selectedItem.dataTransacao)}
                  </p>
                  <p>
                    <span className="font-medium">Descrição:</span> {selectedItem.descricao}
                  </p>
                  {selectedItem.documento && (
                    <p>
                      <span className="font-medium">Documento:</span> {selectedItem.documento}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Valor:</span> {formatCurrency(selectedItem.valor)}
                  </p>
                  <p>
                    <span className="font-medium">Tipo:</span>{' '}
                    {selectedItem.tipoTransacao === TipoTransacao.CREDITO ? 'Crédito' : 'Débito'}
                  </p>
                </div>
              </div>

              {/* Sugestão */}
              {selectedItem.sugestao && (
                <div>
                  <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                    Sugestão de Conciliação
                  </h4>
                  <div className="bg-blue-50 rounded-md p-3 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Score de Confiança:</span>
                      <span
                        className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full text-white ${getScoreColor(selectedItem.sugestao.score)}`}
                      >
                        {selectedItem.sugestao.score}%
                      </span>
                    </div>
                    <p>
                      <span className="font-medium">Data:</span>{' '}
                      {formatDate(selectedItem.sugestao.movimentacao.data)}
                    </p>
                    <p>
                      <span className="font-medium">Descrição:</span>{' '}
                      {selectedItem.sugestao.movimentacao.descricao}
                    </p>
                    <p>
                      <span className="font-medium">Valor:</span>{' '}
                      {formatCurrency(selectedItem.sugestao.movimentacao.valor)}
                    </p>

                    {selectedItem.sugestao.razoes.length > 0 && (
                      <div className="pt-2">
                        <p className="font-medium mb-1">Razões da Sugestão:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedItem.sugestao.razoes.map((razao, idx) => (
                            <span
                              key={idx}
                              className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
                            >
                              {razao}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Movimentação sugerida (fallback) */}
              {selectedItem.movimentacaoSugerida && !selectedItem.sugestao && (
                <div>
                  <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                    Movimentação Sugerida
                  </h4>
                  <div className="bg-blue-50 rounded-md p-3 space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Data:</span>{' '}
                      {formatDate(selectedItem.movimentacaoSugerida.dataMovimento)}
                    </p>
                    <p>
                      <span className="font-medium">Descrição:</span>{' '}
                      {selectedItem.movimentacaoSugerida.descricao}
                    </p>
                    <p>
                      <span className="font-medium">Valor:</span>{' '}
                      {formatCurrency(selectedItem.movimentacaoSugerida.valor)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--color-border)]">
              {selectedItem.status === StatusExtratoItem.SUGESTAO && (
                <>
                  <button
                    onClick={() => handleRejeitar(selectedItem.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    Rejeitar
                  </button>
                  <button
                    onClick={() => handleAceitar(selectedItem.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading ? 'Processando...' : 'Aceitar'}
                  </button>
                </>
              )}
              {selectedItem.status === StatusExtratoItem.PENDENTE && (
                <button
                  onClick={() => handleIgnorar(selectedItem.id)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Ignorar
                </button>
              )}
              <button
                onClick={() => setDetailsOpen(false)}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
