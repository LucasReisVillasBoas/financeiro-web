import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiLock, FiUserCheck, FiX } from 'react-icons/fi';
import { usuarioService } from '../../../services/usuario.service';
import type { User } from '../../../types/api.types';
import { perfilService } from '../../../services/perfil.service';

interface UsuariosSectionProps {
  onNavigate: (section: string, params?: Record<string, any>) => void;
}

export const UsuariosSection: React.FC<UsuariosSectionProps> = ({ onNavigate }) => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState<User | null>(null);
  const [modalMessage, setModalMessage] = useState('');
  const [isAlertModal, setIsAlertModal] = useState(false);

  const handleDelete = (usuarioId: string) => {
    const usuario = usuarios.find(u => u.id === usuarioId);
    if (usuario?.cargo === 'Proprietário') {
      setModalMessage('Não é permitido excluir o usuário Proprietário.');
      setIsAlertModal(true);
      setShowConfirmModal(true);
      return;
    }

    setUsuarioParaExcluir(usuario || null);
    setModalMessage('Tem certeza que deseja excluir este usuário?');
    setIsAlertModal(false);
    setShowConfirmModal(true);
  };

  const handleConfirmarExclusao = async () => {
    if (!usuarioParaExcluir) return;

    try {
      setLoading(true);
      setShowConfirmModal(false);

      try {
        const perfils = await perfilService.findAll(usuarioParaExcluir.id);
        await Promise.all(perfils.map(p => perfilService.remove(usuarioParaExcluir.id, p.id)));
      } catch (error) {
        console.warn('Erro ao deletar perfis:', error);
      }

      await usuarioService.delete(usuarioParaExcluir.id);
      setUsuarios(prevUsuarios => prevUsuarios.filter(u => u.id !== usuarioParaExcluir.id));
      setUsuarioParaExcluir(null);
    } catch (error) {
      setError('Erro ao excluir usuário');
      console.error('Erro ao excluir usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarModal = () => {
    setShowConfirmModal(false);
    setUsuarioParaExcluir(null);
    setModalMessage('');
    setIsAlertModal(false);
  };

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const usuariosData = await usuarioService.getAll();
        if (usuariosData.length === 0) {
          setUsuarios([]);
        } else {
          const usuariosUnicos = Array.from(
            new Map(usuariosData.map(usuario => [usuario.id, usuario])).values()
          );
          setUsuarios(usuariosUnicos);
        }
      } catch (err) {
        setError('Erro ao carregar usuários');
        console.error('Erro ao buscar usuários:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  const getStatus = (usuario: User) => {
    return usuario.deleted_at ? 'Inativo' : 'Ativo';
  };

  return (
    <div className="space-y-6">
      {/* Modal de Confirmação/Alerta */}
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

      <div className="flex justify-between items-center">
        <button
          onClick={() => onNavigate('usuarios-novo')}
          className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          Novo Usuário
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[var(--color-surface)] rounded-md shadow">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Total Usuários</span>
            <FiUserCheck className="text-[var(--color-primary)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">
            {usuarios.length}
          </p>
        </div>
      </div>

      {error && <div className="p-4 bg-red-100/30 text-red-800 rounded-md">{error}</div>}

      {loading ? (
        <div className="text-center py-8 text-[var(--color-text-secondary)]">
          Carregando usuários...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-[var(--color-surface)] rounded-md shadow">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Nome</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Cargo</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">E-mail</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Telefone</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Status</th>
                <th className="text-center p-4 text-[var(--color-text-secondary)]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--color-text-secondary)]">
                    Nenhum usuário cadastrado
                  </td>
                </tr>
              ) : (
                usuarios.map(usuario => (
                  <tr
                    key={usuario.id}
                    className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg)]"
                  >
                    <td className="p-4 text-[var(--color-text)]">{usuario.nome}</td>
                    <td className="p-4 text-[var(--color-text)]">{usuario.cargo}</td>
                    <td className="p-4 text-[var(--color-text)]">{usuario.email}</td>
                    <td className="p-4 text-[var(--color-text)]">{usuario.telefone || '-'}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          getStatus(usuario) === 'Ativo'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {getStatus(usuario)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => onNavigate('usuarios-editar', { usuarioId: usuario.id })}
                          className="p-2 hover:bg-[var(--color-primary-hover)] rounded transition-colors"
                          title="Editar"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() =>
                            onNavigate('usuarios-resetar-senha', { usuarioId: usuario.id })
                          }
                          className="p-2 hover:bg-[var(--color-primary-hover)] rounded transition-colors"
                          title="Resetar Senha"
                        >
                          <FiLock size={18} />
                        </button>
                        <button
                          className="p-2 hover:bg-red-100:bg-red-900 rounded transition-colors text-red-600"
                          title="Excluir"
                          onClick={() => handleDelete(usuario.id)}
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
