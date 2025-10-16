import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiLock, FiUserCheck } from 'react-icons/fi';
import { usuarioService } from '../../../services/usuario.service';
import type { User } from '../../../types/api.types';

export const UsuariosSection: React.FC = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const usuariosData = await usuarioService.getAll();
        if (usuariosData.length === 0) {
          setUsuarios([]);
        } else {
          setUsuarios(usuariosData);
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Gerenciar Usuários</h2>
        <button className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors">
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

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}

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
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                        }`}
                      >
                        {getStatus(usuario)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          className="p-2 hover:bg-[var(--color-primary-hover)] rounded transition-colors"
                          title="Editar"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          className="p-2 hover:bg-[var(--color-primary-hover)] rounded transition-colors"
                          title="Resetar Senha"
                        >
                          <FiLock size={18} />
                        </button>
                        <button
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors text-red-600"
                          title="Excluir"
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
