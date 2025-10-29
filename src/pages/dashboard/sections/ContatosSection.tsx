import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiUserCheck, FiX } from 'react-icons/fi';
import type { Contato } from '../../../types/api.types';
import { contatoService } from '../../../services/contato.service';

interface ContatosSectionProps {
  onNavigate: (section: string, params?: Record<string, any>) => void;
}

export const ContatosSection: React.FC<ContatosSectionProps> = ({ onNavigate }) => {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [contatoParaExcluir, setContatoParaExcluir] = useState<Contato | null>(null);

  useEffect(() => {
    const fetchContatos = async () => {
      try {
        const contatosData = await contatoService.findAll();
        if (contatosData.length === 0) {
          setContatos([]);
        } else {
          setContatos(contatosData);
        }
      } catch (err) {
        setError('Erro ao carregar contatos');
        console.error('Erro ao buscar contatos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContatos();
  }, []);

  const handleDelete = (id: string) => {
    const contato = contatos.find(c => c.id === id);
    if (!contato) return;

    setContatoParaExcluir(contato);
    setShowConfirmModal(true);
  };

  const handleConfirmarExclusao = async () => {
    if (!contatoParaExcluir) return;

    try {
      setLoading(true);
      setShowConfirmModal(false);
      await contatoService.delete(contatoParaExcluir.id);
      setContatos(contatos.filter(c => c.id !== contatoParaExcluir.id));
      setContatoParaExcluir(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir contato');
      console.error('Erro ao deletar contato:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarModal = () => {
    setShowConfirmModal(false);
    setContatoParaExcluir(null);
  };

  const getStatus = (contato: Contato) => {
    return contato.deletadoEm ? 'Inativo' : 'Ativo';
  };

  return (
    <div className="space-y-6">
      {/* Modal de Confirmação */}
      {showConfirmModal && contatoParaExcluir && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Confirmação</h2>
              <button
                onClick={handleCancelarModal}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-[var(--color-text)] mb-4">
                Deseja realmente excluir este contato? Esta ação não pode ser desfeita.
              </p>
              <div className="bg-[var(--color-bg)] p-4 rounded-md">
                <p className="text-sm text-[var(--color-text-secondary)] mb-1">Nome</p>
                <p className="text-[var(--color-text)] font-medium">{contatoParaExcluir.nome}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-[var(--color-border)]">
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
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          onClick={() => onNavigate('auxiliares-contatos-novo')}
          className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          Novo Contato
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[var(--color-surface)] rounded-md shadow">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Total Contatos</span>
            <FiUserCheck className="text-[var(--color-primary)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">
            {contatos.length}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-[var(--color-text-secondary)]">
          Carregando contatos...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-[var(--color-surface)] rounded-md shadow">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Nome</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Função</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Telefone</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Celular</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">E-mail</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Status</th>
                <th className="text-center p-4 text-[var(--color-text-secondary)]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {contatos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--color-text-secondary)]">
                    Nenhum contato cadastrado
                  </td>
                </tr>
              ) : (
                contatos.map(contato => (
                  <tr
                    key={contato.id}
                    className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg)]"
                  >
                    <td className="p-4 text-[var(--color-text)]">{contato.nome}</td>
                    <td className="p-4 text-[var(--color-text)]">{contato.funcao}</td>
                    <td className="p-4 text-[var(--color-text)]">{contato.telefone || '-'}</td>
                    <td className="p-4 text-[var(--color-text)]">{contato.celular || '-'}</td>
                    <td className="p-4 text-[var(--color-text)]">{contato.email || '-'}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          getStatus(contato) === 'Ativo'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                        }`}
                      >
                        {getStatus(contato)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            onNavigate('auxiliares-contatos-editar', { contatoId: contato.id })
                          }
                          className="p-2 hover:bg-[var(--color-primary-hover)] rounded transition-colors"
                          title="Editar"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors text-red-600"
                          title="Excluir"
                          onClick={() => handleDelete(contato.id)}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
