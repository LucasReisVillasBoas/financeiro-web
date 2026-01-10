import React, { useState, useEffect, useCallback } from 'react';
import {
  FiPlus,
  FiSearch,
  FiDownload,
  FiEdit,
  FiTrash2,
  FiX,
  FiGrid,
  FiCheck,
  FiAlertCircle,
} from 'react-icons/fi';
import { planoContasService, empresaService } from '../../../services';
import { useAuth } from '../../../context/AuthContext';
import type {
  PlanoContas,
  CreatePlanoContasDto,
  Empresa,
  TipoPlanoContas,
} from '../../../types/api.types';

export const PlanoContasSection: React.FC = () => {
  const { user } = useAuth();
  const [contas, setContas] = useState<PlanoContas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingConta, setEditingConta] = useState<PlanoContas | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<string>('');

  const [formData, setFormData] = useState<CreatePlanoContasDto>({
    empresaId: '',
    codigo: '',
    descricao: '',
    tipo: 'Receita' as TipoPlanoContas,
    nivel: 1,
    permite_lancamento: true,
    ativo: true,
  });
  const [formError, setFormError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contaParaExcluir, setContaParaExcluir] = useState<PlanoContas | null>(null);

  const loadEmpresas = useCallback(async () => {
    try {
      if (!user?.clienteId) return;
      const empresasData = await empresaService.findByCliente(user.clienteId);
      setEmpresas(empresasData || []);
      if (empresasData && empresasData.length > 0) {
        setEmpresaSelecionada(empresasData[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar empresas');
    }
  }, [user?.clienteId]);

  const loadContas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await planoContasService.findByEmpresa(empresaSelecionada);
      setContas(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar plano de contas');
    } finally {
      setLoading(false);
    }
  }, [empresaSelecionada]);

  useEffect(() => {
    loadEmpresas();
  }, [loadEmpresas]);

  useEffect(() => {
    if (empresaSelecionada) {
      loadContas();
    }
  }, [empresaSelecionada, loadContas]);

  const handleNovaConta = () => {
    setEditingConta(null);
    setFormData({
      empresaId: empresaSelecionada,
      codigo: '',
      descricao: '',
      tipo: 'Receita' as TipoPlanoContas,
      nivel: 1,
      permite_lancamento: true,
      ativo: true,
    });
    setFormError('');
    setShowForm(true);
  };

  const handleEditConta = (conta: PlanoContas) => {
    setEditingConta(conta);
    setFormData({
      empresaId: conta.empresaId,
      codigo: conta.codigo,
      descricao: conta.descricao,
      tipo: conta.tipo,
      nivel: conta.nivel,
      parentId: conta.parentId,
      permite_lancamento: conta.permite_lancamento,
      ativo: conta.ativo,
    });
    setFormError('');
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingConta(null);
    setFormError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'nivel') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 1 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      if (editingConta) {
        await planoContasService.update(editingConta.id, formData);
      } else {
        await planoContasService.create(formData);
      }
      await loadContas();
      handleCloseForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar conta');
    }
  };

  const handleToggleStatus = async (id: string, ativo: boolean) => {
    try {
      await planoContasService.toggleStatus(id, !ativo);
      await loadContas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar status');
    }
  };

  const handleDelete = (conta: PlanoContas) => {
    setContaParaExcluir(conta);
    setShowDeleteModal(true);
  };

  const handleConfirmarExclusao = async () => {
    if (!contaParaExcluir) return;

    try {
      const usoResponse = await planoContasService.verificarUso(contaParaExcluir.id);
      if (usoResponse.data?.emUso) {
        setError(
          `Esta conta não pode ser excluída pois está em uso em ${usoResponse.data.total} lançamento(s).`
        );
        setShowDeleteModal(false);
        setContaParaExcluir(null);
        return;
      }

      await planoContasService.delete(contaParaExcluir.id);
      await loadContas();
      setShowDeleteModal(false);
      setContaParaExcluir(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir conta');
    }
  };

  const handleCancelarExclusao = () => {
    setShowDeleteModal(false);
    setContaParaExcluir(null);
  };

  const handleExportCSV = async () => {
    try {
      const blob = await planoContasService.exportCSV(empresaSelecionada);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plano-contas-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao exportar CSV');
    }
  };

  const contasFiltradas = contas.filter(conta => {
    const matchSearch =
      !searchTerm ||
      conta.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conta.descricao.toLowerCase().includes(searchTerm.toLowerCase());

    const matchTipo = !tipoFiltro || conta.tipo === tipoFiltro;

    return matchSearch && matchTipo;
  });

  const totalContas = contas.length;
  const contasAtivas = contas.filter(c => c.ativo).length;
  const contasAnaliticas = contas.filter(c => c.permite_lancamento).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Plano de Contas</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Gerencie o plano de contas da empresa
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            disabled={!empresaSelecionada}
            className="px-4 py-2 bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-bg)] transition-colors flex items-center gap-2"
          >
            <FiDownload size={18} />
            Exportar
          </button>
          <button
            onClick={handleNovaConta}
            disabled={!empresaSelecionada}
            className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors flex items-center gap-2"
          >
            <FiPlus size={18} />
            Nova Conta
          </button>
        </div>
      </div>

      {/* Seleção de Empresa */}
      {empresas.length > 0 && (
        <div className="bg-[var(--color-surface)] p-4 rounded-lg border border-[var(--color-border)]">
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Empresa</label>
          <select
            value={empresaSelecionada}
            onChange={e => setEmpresaSelecionada(e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            {empresas.map(empresa => (
              <option key={empresa.id} value={empresa.id}>
                {empresa.nome_fantasia}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[var(--color-surface)] rounded-md shadow">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Total de Contas</span>
            <FiGrid className="text-[var(--color-primary)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">{totalContas}</p>
        </div>

        <div className="p-4 bg-[var(--color-surface)] rounded-md shadow">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Contas Ativas</span>
            <FiCheck className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-500 mt-2">{contasAtivas}</p>
        </div>

        <div className="p-4 bg-[var(--color-surface)] rounded-md shadow">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Contas Analíticas</span>
            <FiAlertCircle className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-500 mt-2">{contasAnaliticas}</p>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-[var(--color-surface)] p-4 rounded-lg border border-[var(--color-border)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Buscar
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Código ou descrição..."
                className="w-full pl-10 pr-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Tipo</label>
            <select
              value={tipoFiltro}
              onChange={e => setTipoFiltro(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="">Todos os tipos</option>
              <option value="Receita">Receita</option>
              <option value="Custo">Custo</option>
              <option value="Despesa">Despesa</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <div className="p-4 bg-red-600 dark:bg-red-700 text-white rounded-md font-medium border border-red-700 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && contaParaExcluir && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Confirmação</h2>
              <button
                onClick={handleCancelarExclusao}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-[var(--color-text)]">Tem certeza que deseja excluir esta conta?</p>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-1">Código</p>
                <p className="text-[var(--color-text)] font-medium">{contaParaExcluir.codigo}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-1">Descrição</p>
                <p className="text-[var(--color-text)]">{contaParaExcluir.descricao}</p>
              </div>
              <p className="text-sm text-red-500 font-medium">Esta ação não pode ser desfeita.</p>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-[var(--color-border)]">
              <button
                onClick={handleCancelarExclusao}
                className="px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarExclusao}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                {editingConta ? 'Editar Conta' : 'Nova Conta'}
              </h2>
              <button
                onClick={handleCloseForm}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-4 bg-red-600 dark:bg-red-700 text-white rounded-md font-medium border border-red-700 dark:border-red-800">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Código *
                  </label>
                  <input
                    type="text"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Ex: 1.1.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Tipo *
                  </label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    <option value="Receita">Receita</option>
                    <option value="Custo">Custo</option>
                    <option value="Despesa">Despesa</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Descrição *
                  </label>
                  <input
                    type="text"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Ex: Vendas de Produtos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Nível *
                  </label>
                  <input
                    type="number"
                    name="nivel"
                    value={formData.nivel}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div className="flex items-center gap-4 md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="permite_lancamento"
                      checked={formData.permite_lancamento}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-[var(--color-text)]">
                      Permite lançamento (Analítica)
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="ativo"
                      checked={formData.ativo}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-[var(--color-text)]">Ativa</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
                >
                  {editingConta ? 'Atualizar' : 'Criar'} Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabela de Contas */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
          <p className="mt-4 text-[var(--color-text-secondary)]">Carregando contas...</p>
        </div>
      ) : contasFiltradas.length === 0 ? (
        <div className="text-center py-12 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
          <FiGrid size={48} className="mx-auto text-[var(--color-text-secondary)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
            Nenhuma conta encontrada
          </h3>
          <p className="text-[var(--color-text-secondary)] mb-6">
            {searchTerm || tipoFiltro
              ? 'Tente ajustar os filtros'
              : 'Comece criando sua primeira conta'}
          </p>
          {!searchTerm && !tipoFiltro && (
            <button
              onClick={handleNovaConta}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors font-medium"
            >
              <FiPlus size={20} />
              Criar Conta
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-[var(--color-surface)] rounded-md shadow">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Código</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Descrição</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Tipo</th>
                <th className="text-center p-4 text-[var(--color-text-secondary)]">Nível</th>
                <th className="text-center p-4 text-[var(--color-text-secondary)]">Analítica</th>
                <th className="text-center p-4 text-[var(--color-text-secondary)]">Status</th>
                <th className="text-center p-4 text-[var(--color-text-secondary)]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {contasFiltradas.map(conta => (
                <tr
                  key={conta.id}
                  className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg)]"
                >
                  <td className="p-4 text-[var(--color-text)] font-mono">{conta.codigo}</td>
                  <td className="p-4 text-[var(--color-text)]">{conta.descricao}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        conta.tipo === 'Receita'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : conta.tipo === 'Custo'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                            : conta.tipo === 'Despesa'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {conta.tipo}
                    </span>
                  </td>
                  <td className="p-4 text-center text-[var(--color-text)]">{conta.nivel}</td>
                  <td className="p-4 text-center">
                    {conta.permite_lancamento ? (
                      <span className="text-green-500">Sim</span>
                    ) : (
                      <span className="text-gray-500">Não</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        conta.ativo
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {conta.ativo ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEditConta(conta)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                        title="Editar"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(conta.id, conta.ativo)}
                        className={`p-2 rounded ${
                          conta.ativo
                            ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30'
                            : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
                        }`}
                        title={conta.ativo ? 'Inativar' : 'Ativar'}
                      >
                        <FiCheck size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(conta)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                        title="Excluir"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
