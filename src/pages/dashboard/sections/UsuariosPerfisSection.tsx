import React, { useState, useEffect } from 'react';
import { FiEdit, FiUserCheck } from 'react-icons/fi';
import type { Perfil } from '../../../types/api.types';
import { perfilService } from '../../../services/perfil.service';
import { useAuth } from '../../../context/AuthContext';

interface UsuariosPerfisSectionProps {
  onNavigate: (section: string, params?: Record<string, any>) => void;
}

export const UsuariosPerfisSection: React.FC<UsuariosPerfisSectionProps> = ({ onNavigate }) => {
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { getClienteId } = useAuth();

  const clienteId = getClienteId();
  if (!clienteId) {
    setError('Erro ao obter informações do usuário. Faça login novamente.');
    setLoading(false);
    return;
  }
  useEffect(() => {
    const fetchPerfis = async () => {
      try {
        const perfisData = await perfilService.findAll(clienteId);
        if (perfisData.length === 0) {
          setPerfis([]);
        } else {
          setPerfis(perfisData);
        }
      } catch (err) {
        setError('Erro ao carregar perfis');
        console.error('Erro ao buscar perfis:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfis();
  }, []);

  const getStatus = (usuario: Perfil) => {
    return usuario.ativo ? 'Ativo' : 'Inativo';
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
            {perfis.length}
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
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Status</th>
                <th className="text-center p-4 text-[var(--color-text-secondary)]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {perfis.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--color-text-secondary)]">
                    Nenhum perfil cadastrado
                  </td>
                </tr>
              ) : (
                perfis.map(perfil => (
                  <tr
                    key={perfil.id}
                    className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg)]"
                  >
                    <td className="p-4 text-[var(--color-text)]">{perfil.nome}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          getStatus(perfil) === 'Ativo'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                        }`}
                      >
                        {getStatus(perfil)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            onNavigate('usuarios-perfis-editar', { perfilId: perfil.id })
                          }
                          className="p-2 hover:bg-[var(--color-primary-hover)] rounded transition-colors"
                          title="Editar"
                        >
                          <FiEdit size={18} />
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
