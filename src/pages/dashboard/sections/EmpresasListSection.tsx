import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { empresaService } from '../../../services/empresa.service';
import { contatoService } from '../../../services/contato.service';
import { cidadeService } from '../../../services/cidade.service';
import { usuarioService } from '../../../services/usuario.service';
import type { Empresa, UsuarioEmpresaFilial } from '../../../types/api.types';
import { useAuth } from '../../../context/AuthContext';
import { EmpresaViewModal } from '../modals/EmpresaViewModal';

interface EmpresasListSectionProps {
  onNavigate: (sectionId: string, params?: Record<string, any>) => void;
}

export const EmpresasListSection: React.FC<EmpresasListSectionProps> = ({ onNavigate }) => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string | null>(null);
  const { getClienteId } = useAuth();

  useEffect(() => {
    loadEmpresas();
  }, []);

  const loadEmpresas = async () => {
    try {
      setLoading(true);
      const clienteId = getClienteId();

      if (!clienteId) {
        setError('Erro ao obter informações do usuário');
        return;
      }

      const data = await empresaService.findByCliente(clienteId);
      setEmpresas(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Deseja realmente excluir esta empresa? Todos os dados relacionados (contatos, cidades, associações) também serão removidos.'
      )
    )
      return;

    try {
      setLoading(true);

      const clienteId = getClienteId();

      try {
        const allContatos = await contatoService.findAll();
        const contatosEmpresa = allContatos.filter(c => c.filialId === id);

        for (const contato of contatosEmpresa) {
          await contatoService.delete(contato.id);
        }
      } catch (error) {
        console.warn('Erro ao deletar contatos:', error);
      }

      try {
        const allCidades = await cidadeService.findAll();
        const cidadesEmpresa = allCidades.filter(c => c.filialId === id);

        for (const cidade of cidadesEmpresa) {
          await cidadeService.delete(cidade.id);
        }
      } catch (error) {
        console.warn('Erro ao deletar cidades:', error);
      }

      if (clienteId) {
        try {
          const associacoes = await usuarioService.listarAssociacoes(clienteId);
          const associacoesEmpresa = associacoes.filter(
            (a: UsuarioEmpresaFilial) => a.empresa_id === id || a.filial_id === id
          );

          for (const associacao of associacoesEmpresa) {
            await usuarioService.removerAssociacao(clienteId, associacao.id);
          }
        } catch (error) {
          console.warn('Erro ao desassociar usuários:', error);
        }
      }

      await empresaService.delete(id);

      setEmpresas(empresas.filter(e => e.id !== id));
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleVisualizar = (id: string) => {
    setSelectedEmpresaId(id);
    setShowModal(true);
  };

  const handleEditar = (id: string) => {
    onNavigate('empresas-editar', { empresaId: id });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmpresaId(null);
  };

  const selectedEmpresa = empresas.find(e => e.id === selectedEmpresaId);

  const handleCreateFilial = () => {
    onNavigate('empresas-nova-filial');
  };

  const getStatus = (empresa: Empresa) => {
    return empresa.deleted_at ? 'Inativa' : 'Ativa';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
          onClick={() => handleCreateFilial()}
        >
          Nova Filial
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-[var(--color-text-secondary)]">
          Carregando empresas...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-[var(--color-surface)] rounded-md shadow">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Razão Social</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Nome Fantasia</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">CNPJ</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Status</th>
                <th className="text-center p-4 text-[var(--color-text-secondary)]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {empresas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--color-text-secondary)]">
                    Nenhuma empresa cadastrada
                  </td>
                </tr>
              ) : (
                empresas.map(empresa => (
                  <tr
                    key={empresa.id}
                    className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg)]"
                  >
                    <td className="p-4 text-[var(--color-text)]">{empresa.razao_social}</td>
                    <td className="p-4 text-[var(--color-text)]">{empresa.nome_fantasia}</td>
                    <td className="p-4 text-[var(--color-text)]">{empresa.cnpj_cpf}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-2">
                        <span
                          className={`px-2 py-1 rounded text-sm text-center ${
                            getStatus(empresa) === 'Ativa'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                          }`}
                        >
                          {getStatus(empresa)}
                        </span>
                        {!empresa.sede && (
                          <span className="px-2 py-1 rounded text-sm text-center bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            Sede
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          className="p-2 hover:bg-[var(--color-primary-hover)] rounded transition-colors"
                          onClick={() => handleVisualizar(empresa.id)}
                          title="Visualizar"
                        >
                          <FiEye size={18} />
                        </button>
                        <button
                          className="p-2 hover:bg-[var(--color-primary-hover)] rounded transition-colors"
                          onClick={() => handleEditar(empresa.id)}
                          title="Editar"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors text-red-600"
                          onClick={() => handleDelete(empresa.id)}
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
      {showModal && selectedEmpresa && (
        <EmpresaViewModal empresa={selectedEmpresa} onClose={handleCloseModal} />
      )}
    </div>
  );
};
