import React, { useState, useEffect } from 'react';
import { FiUsers, FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import type { Pessoa } from '../../../types/api.types';
import { pessoaService } from '../../../services';
import { useAuth } from '../../../context/AuthContext';

interface PessoasSectionProps {
  onNavigate: (section: string, params?: Record<string, any>) => void;
}

export const PessoasSection: React.FC<PessoasSectionProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [pessoasFiltradas, setPessoasFiltradas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'Todos' | 'Física' | 'Jurídica'>('Todos');
  const [filtroStatus, setFiltroStatus] = useState<'Todos' | 'Ativos' | 'Inativos'>('Ativos');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pessoaParaExcluir, setPessoaParaExcluir] = useState<Pessoa | null>(null);
  const [modalMessage, setModalMessage] = useState('');
  const [isAlertModal, setIsAlertModal] = useState(false);

  useEffect(() => {
    loadPessoas();
  }, []);

  useEffect(() => {
    filtrarPessoas();
  }, [pessoas, searchTerm, filtroTipo, filtroStatus]);

  const mapPessoaFromApi = (pessoa: Pessoa): Pessoa => {
    const documentoLength = pessoa.documento?.replace(/\D/g, '').length || 0;
    const tipo =
      documentoLength === 11 ? 'Física' : documentoLength === 14 ? 'Jurídica' : undefined;

    return {
      ...pessoa,
      nome: pessoa.razaoNome,
      cpf_cnpj: pessoa.documento,
      tipo: tipo as 'Física' | 'Jurídica' | undefined,
      cidade: pessoa.endereco?.cidade,
      uf: pessoa.endereco?.uf,
    };
  };

  const loadPessoas = async () => {
    try {
      setLoading(true);
      setError('');
      if (user?.clienteId) {
        const data = await pessoaService.findByCliente(user.clienteId);
        console.log('Pessoas carregadas:', data);
        const pessoasMapeadas = Array.isArray(data) ? data.map(mapPessoaFromApi) : [];
        setPessoas(pessoasMapeadas);
      }
    } catch (err: any) {
      console.error('Erro ao carregar pessoas:', err);
      setError(err.message || 'Erro ao carregar pessoas');
      setPessoas([]);
    } finally {
      setLoading(false);
    }
  };

  const filtrarPessoas = () => {
    if (!Array.isArray(pessoas)) {
      setPessoasFiltradas([]);
      return;
    }

    let resultado = [...pessoas];

    if (filtroTipo !== 'Todos') {
      resultado = resultado.filter(p => p.tipo === filtroTipo);
    }

    if (filtroStatus === 'Ativos') {
      resultado = resultado.filter(p => p.ativo);
    } else if (filtroStatus === 'Inativos') {
      resultado = resultado.filter(p => !p.ativo);
    }

    if (searchTerm.trim()) {
      const termo = searchTerm.toLowerCase();
      resultado = resultado.filter(
        p =>
          p.nome?.toLowerCase().includes(termo) ||
          p.razaoNome?.toLowerCase().includes(termo) ||
          p.fantasiaApelido?.toLowerCase().includes(termo) ||
          p.cpf_cnpj?.toLowerCase().includes(termo) ||
          p.documento?.toLowerCase().includes(termo) ||
          p.email?.toLowerCase().includes(termo) ||
          p.telefone?.toLowerCase().includes(termo) ||
          p.celular?.toLowerCase().includes(termo)
      );
    }

    setPessoasFiltradas(resultado);
  };

  const handleDelete = async (id: string) => {
    const pessoa = pessoas.find(e => e.id === id);
    if (!pessoa) return;
    let mensagem = 'Deseja realmente excluir esta pessoa?';

    setPessoaParaExcluir(pessoa);
    setModalMessage(mensagem);
    setIsAlertModal(false);
    setShowConfirmModal(true);
  };

  const handleToggleStatus = async (pessoa: Pessoa) => {
    try {
      await pessoaService.update(pessoa.id, { ativo: !pessoa.ativo });
      await loadPessoas();
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar status');
    }
  };

  const formatCpfCnpj = (cpfCnpj?: string) => {
    if (!cpfCnpj) return '-';
    const cleaned = cpfCnpj.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (cleaned.length === 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cpfCnpj;
  };

  const formatTelefone = (telefone?: string) => {
    if (!telefone) return '-';
    const cleaned = telefone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return telefone;
  };

  const handleCancelarModal = () => {
    setShowConfirmModal(false);
    setPessoaParaExcluir(null);
    setModalMessage('');
    setIsAlertModal(false);
  };

  const handleConfirmarExclusao = async () => {
    if (!pessoaParaExcluir) return;

    try {
      setLoading(true);
      setShowConfirmModal(false);
      await pessoaService.delete(pessoaParaExcluir.id);

      await loadPessoas();
      setPessoaParaExcluir(null);
    } catch (err: any) {
      console.error('Erro ao excluir pessoa:', err);
      const errorMessage = err.message || 'Erro ao excluir pessoa';
      setModalMessage(errorMessage);
      setIsAlertModal(true);
      setShowConfirmModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                {isAlertModal ? 'Aviso' : 'Confirmação'}
              </h2>
              <button
                onClick={handleCancelarModal}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-[var(--color-text)]">{modalMessage}</p>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-[var(--color-border)]">
              {isAlertModal ? (
                <button
                  onClick={handleCancelarModal}
                  className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
                >
                  OK
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancelarModal}
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FiUsers size={24} className="text-[var(--color-primary)]" />
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Pessoas</h1>
        </div>
        <button
          onClick={() => onNavigate('pessoas-nova')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          <FiPlus size={20} />
          Nova Pessoa
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-[var(--color-surface)] p-4 rounded-md shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Busca */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Buscar
            </label>
            <div className="relative">
              <FiSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)]"
                size={18}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Nome, CPF/CNPJ, email, telefone..."
                className="w-full pl-10 pr-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
          </div>

          {/* Filtro Tipo */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Tipo</label>
            <select
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value as any)}
              className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="Todos">Todos</option>
              <option value="Física">Pessoa Física</option>
              <option value="Jurídica">Pessoa Jurídica</option>
            </select>
          </div>

          {/* Filtro Status */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Status
            </label>
            <select
              value={filtroStatus}
              onChange={e => setFiltroStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="Todos">Todos</option>
              <option value="Ativos">Ativos</option>
              <option value="Inativos">Inativos</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-[var(--color-text-secondary)]">
          Mostrando {pessoasFiltradas.length} de {pessoas.length} pessoas
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="p-4 bg-red-600 dark:bg-red-700 text-white rounded-md font-medium border border-red-700 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Conteúdo */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
          <p className="mt-4 text-[var(--color-text-secondary)]">Carregando pessoas...</p>
        </div>
      ) : pessoasFiltradas.length === 0 ? (
        <div className="text-center py-12 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
          <FiUsers size={48} className="mx-auto text-[var(--color-text-secondary)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
            {pessoas.length === 0 ? 'Nenhuma pessoa cadastrada' : 'Nenhuma pessoa encontrada'}
          </h3>
          <p className="text-[var(--color-text-secondary)] mb-6">
            {pessoas.length === 0
              ? 'Comece adicionando a primeira pessoa'
              : 'Tente ajustar os filtros de busca'}
          </p>
          {pessoas.length === 0 && (
            <button
              onClick={() => onNavigate('pessoas-nova')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors font-medium"
            >
              <FiPlus size={20} />
              Adicionar Pessoa
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] rounded-md shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg)]">
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left p-4 text-[var(--color-text-secondary)] font-medium">
                    Nome
                  </th>
                  <th className="text-left p-4 text-[var(--color-text-secondary)] font-medium">
                    Tipo
                  </th>
                  <th className="text-left p-4 text-[var(--color-text-secondary)] font-medium">
                    CPF/CNPJ
                  </th>
                  <th className="text-left p-4 text-[var(--color-text-secondary)] font-medium">
                    Email
                  </th>
                  <th className="text-left p-4 text-[var(--color-text-secondary)] font-medium">
                    Telefone
                  </th>
                  <th className="text-left p-4 text-[var(--color-text-secondary)] font-medium">
                    Cidade/UF
                  </th>
                  <th className="text-center p-4 text-[var(--color-text-secondary)] font-medium">
                    Status
                  </th>
                  <th className="text-center p-4 text-[var(--color-text-secondary)] font-medium">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {pessoasFiltradas.map(pessoa => (
                  <tr
                    key={pessoa.id}
                    className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-medium text-[var(--color-text)]">{pessoa.nome}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          pessoa.tipo === 'Física'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        }`}
                      >
                        {pessoa.tipo}
                      </span>
                    </td>
                    <td className="p-4 text-[var(--color-text)]">
                      {formatCpfCnpj(pessoa.cpf_cnpj)}
                    </td>
                    <td className="p-4 text-[var(--color-text)]">{pessoa.email || '-'}</td>
                    <td className="p-4 text-[var(--color-text)]">
                      {pessoa.telefone || pessoa.celular
                        ? formatTelefone(pessoa.telefone || pessoa.celular)
                        : '-'}
                    </td>
                    <td className="p-4 text-[var(--color-text)]">
                      {pessoa.cidade && pessoa.uf ? `${pessoa.cidade}/${pessoa.uf}` : '-'}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(pessoa)}
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium transition-colors ${
                          pessoa.ativo
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {pessoa.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => onNavigate('pessoas-editar', { pessoaId: pessoa.id })}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="Editar"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(pessoa.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Excluir"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
