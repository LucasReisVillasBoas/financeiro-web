import React, { useState, useEffect } from 'react';
import { FiEdit, FiUserCheck, FiTrash2 } from 'react-icons/fi';
import {
  usuarioPerfilService,
  type UsuarioPerfilDetalhado,
} from '../../../services/usuario-perfil.service';
import { useAuth } from '../../../context/AuthContext';

interface UsuariosPerfisSectionProps {
  onNavigate: (section: string, params?: Record<string, unknown>) => void;
}

export const UsuariosPerfisSection: React.FC<UsuariosPerfisSectionProps> = ({ onNavigate }) => {
  const [usuariosPerfis, setUsuariosPerfis] = useState<UsuarioPerfilDetalhado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { getClienteId, user } = useAuth();

  const clienteId = getClienteId();

  // Verifica se o usuário logado tem algum perfil "Administrador"
  const isAdmin = usuariosPerfis.some(
    up => up.usuario.id === user?.id && up.perfil.nome === 'Administrador'
  );

  // Filtra os perfis: admin vê todos, outros veem apenas o próprio
  const perfisFiltrados = isAdmin
    ? usuariosPerfis
    : usuariosPerfis.filter(up => up.usuario.id === user?.id);

  useEffect(() => {
    if (!clienteId) {
      setError('Erro ao obter informações do usuário. Faça login novamente.');
      setLoading(false);
      return;
    }

    const fetchUsuariosPerfis = async () => {
      try {
        const data = await usuarioPerfilService.findByCliente(clienteId);
        setUsuariosPerfis(data);
      } catch (err) {
        setError('Erro ao carregar perfis de usuários');
        console.error('Erro ao buscar perfis de usuários:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuariosPerfis();
  }, [clienteId]);

  const getStatusUsuario = (ativo: boolean) => {
    return ativo ? 'Ativo' : 'Inativo';
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este perfil de usuário?')) {
      return;
    }

    try {
      await usuarioPerfilService.delete(id);
      setUsuariosPerfis(prev => prev.filter(up => up.id !== id));
    } catch (err) {
      console.error('Erro ao excluir perfil:', err);
      setError('Erro ao excluir perfil de usuário');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {/* <button className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors">
            Novo Perfil
          </button> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[var(--color-surface)] rounded-md shadow">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Total Perfis</span>
            <FiUserCheck className="text-[var(--color-primary)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">
            {perfisFiltrados.length}
          </p>
        </div>
      </div>

      {error && <div className="p-4 bg-red-100/30 text-red-800 rounded-md">{error}</div>}

      {loading ? (
        <div className="text-center py-8 text-[var(--color-text-secondary)]">
          Carregando perfis de usuários...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-[var(--color-surface)] rounded-md shadow">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Usuário</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Empresa(s)</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Perfil</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Status</th>
                <th className="text-center p-4 text-[var(--color-text-secondary)]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {perfisFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--color-text-secondary)]">
                    Nenhum perfil de usuário cadastrado
                  </td>
                </tr>
              ) : (
                perfisFiltrados.map(up => (
                  <tr
                    key={up.id}
                    className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg)]"
                  >
                    <td className="p-4 text-[var(--color-text)]">
                      <div>
                        <div className="font-medium">{up.usuario.nome}</div>
                        <div className="text-sm text-[var(--color-text-secondary)]">
                          {up.usuario.login}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[var(--color-text)]">
                      <div className="flex flex-wrap gap-1">
                        {up.empresas.map(empresa => (
                          <span
                            key={empresa.id}
                            className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                              empresa.isFilial
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {empresa.nome_fantasia || empresa.razao_social}
                            <span className="ml-1 opacity-70">
                              ({empresa.isFilial ? 'Filial' : 'Sede'})
                            </span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-[var(--color-text)]">
                      <div className="flex items-center gap-2">
                        <span>{up.perfil.nome}</span>
                        {up.perfil.masterAdmin && (
                          <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-medium rounded-full">
                            Master Admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          getStatusUsuario(up.usuario.ativo) === 'Ativo'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {getStatusUsuario(up.usuario.ativo)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            onNavigate('usuarios-perfis-editar', { perfilId: up.perfil.id })
                          }
                          className={`p-2 rounded transition-colors ${
                            up.perfil.masterAdmin
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'hover:bg-[var(--color-primary-hover)]'
                          }`}
                          title={
                            up.perfil.masterAdmin
                              ? 'Master Admin não pode ser editado'
                              : 'Editar Perfil'
                          }
                          disabled={up.perfil.masterAdmin}
                        >
                          <FiEdit size={18} />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => !up.perfil.masterAdmin && handleDelete(up.id)}
                            className={`p-2 rounded transition-colors ${
                              up.perfil.masterAdmin
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'hover:bg-red-100 text-red-600'
                            }`}
                            title={
                              up.perfil.masterAdmin
                                ? 'Master Admin não pode ser excluído'
                                : 'Excluir Perfil'
                            }
                            disabled={up.perfil.masterAdmin}
                          >
                            <FiTrash2 size={18} />
                          </button>
                        )}
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
