import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiEye, FiX } from 'react-icons/fi';
import { empresaService } from '../../../services/empresa.service';
import { contatoService } from '../../../services/contato.service';
import { cidadeService } from '../../../services/cidade.service';
import { usuarioService } from '../../../services/usuario.service';
import type { Empresa, Filial, UsuarioEmpresaFilial } from '../../../types/api.types';
import { useAuth } from '../../../context/AuthContext';
import { EmpresaViewModal } from '../modals/EmpresaViewModal';

// Tipo unificado para exibição na tabela
interface EmpresaFilialItem {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj_cpf: string;
  deleted_at?: string;
  tipo: 'sede' | 'filial';
  sedeId?: string; // ID da sede (para filiais)
}

// Tipo para dados completos (modal/edição)
type EmpresaOuFilial = Empresa | Filial;

interface EmpresasListSectionProps {
  onNavigate: (sectionId: string, params?: Record<string, unknown>) => void;
}

export const EmpresasListSection: React.FC<EmpresasListSectionProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<EmpresaFilialItem[]>([]);
  const [empresasOriginais, setEmpresasOriginais] = useState<Empresa[]>([]);
  const [filiaisOriginais, setFiliaisOriginais] = useState<Filial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EmpresaOuFilial | null>(null);
  const [selectedItemTipo, setSelectedItemTipo] = useState<'sede' | 'filial'>('sede');
  const { getClienteId } = useAuth();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemParaExcluir, setItemParaExcluir] = useState<EmpresaFilialItem | null>(null);
  const [modalMessage, setModalMessage] = useState('');
  const [isAlertModal, setIsAlertModal] = useState(false);

  useEffect(() => {
    loadEmpresas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadEmpresas = async () => {
    try {
      setLoading(true);
      const clienteId = getClienteId();

      if (!clienteId) {
        setError('Erro ao obter informações do usuário');
        return;
      }

      // Busca todas as empresas (sedes)
      const empresas = await empresaService.findByCliente(clienteId);
      setEmpresasOriginais(empresas);

      // Monta lista unificada de sedes + filiais
      const listaUnificada: EmpresaFilialItem[] = [];
      const todasFiliais: Filial[] = [];
      const idsAdicionados = new Set<string>();

      for (const empresa of empresas) {
        // Identifica se é sede (sede === null)
        const isSede = !empresa.sede;

        // Adiciona a empresa/sede
        if (!idsAdicionados.has(empresa.id)) {
          idsAdicionados.add(empresa.id);
          listaUnificada.push({
            id: empresa.id,
            razao_social: empresa.razao_social,
            nome_fantasia: empresa.nome_fantasia,
            cnpj_cpf: empresa.cnpj_cpf,
            deleted_at: empresa.deleted_at,
            tipo: isSede ? 'sede' : 'filial',
            sedeId: empresa.sede || undefined,
          });
        }

        // Se for sede, busca suas filiais
        if (isSede) {
          try {
            const filiais = await empresaService.listFiliais(empresa.id);
            for (const filial of filiais) {
              if (!idsAdicionados.has(filial.id)) {
                idsAdicionados.add(filial.id);
                todasFiliais.push(filial);
                listaUnificada.push({
                  id: filial.id,
                  razao_social: filial.razao_social,
                  nome_fantasia: filial.nome_fantasia,
                  cnpj_cpf: filial.cnpj_cpf,
                  deleted_at: filial.deleted_at || filial.deletadoEm,
                  tipo: 'filial',
                  sedeId: empresa.id,
                });
              }
            }
          } catch (err) {
            console.warn('Erro ao carregar filiais da empresa:', empresa.id, err);
          }
        }
      }

      setFiliaisOriginais(todasFiliais);
      setItems(listaUnificada);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (item: EmpresaFilialItem) => {
    let mensagem = 'Deseja realmente excluir esta filial?';
    if (item.tipo === 'sede') {
      mensagem =
        'Deseja realmente excluir esta SEDE? ATENÇÃO: Todas as filiais vinculadas também serão excluídas automaticamente.';
    }

    setItemParaExcluir(item);
    setModalMessage(mensagem);
    setIsAlertModal(false);
    setShowConfirmModal(true);
  };

  const handleConfirmarExclusao = async () => {
    if (!itemParaExcluir) return;

    try {
      setLoading(true);
      setShowConfirmModal(false);

      const clienteId = getClienteId();

      try {
        const allContatos = await contatoService.findAll();
        const contatosEmpresa = allContatos.filter(c => c.filialId === itemParaExcluir.id);

        for (const contato of contatosEmpresa) {
          await contatoService.delete(contato.id);
        }
      } catch (error) {
        console.warn('Erro ao deletar contatos:', error);
      }

      try {
        const allCidades = await cidadeService.findAll();
        const cidadesEmpresa = allCidades.filter(c => c.filialId === itemParaExcluir.id);

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
            (a: UsuarioEmpresaFilial) =>
              a.empresa_id === itemParaExcluir.id || a.filial_id === itemParaExcluir.id
          );

          for (const associacao of associacoesEmpresa) {
            await usuarioService.removerAssociacao(clienteId, associacao.id);
          }
        } catch (error) {
          console.warn('Erro ao desassociar usuários:', error);
        }
      }

      // Deleta empresa ou filial
      if (itemParaExcluir.tipo === 'sede') {
        await empresaService.delete(itemParaExcluir.id);
      } else {
        await empresaService.deleteFilial(itemParaExcluir.id);
      }

      await loadEmpresas();
      setItemParaExcluir(null);
    } catch (err: unknown) {
      setModalMessage(err instanceof Error ? err.message : 'Erro ao excluir');
      setIsAlertModal(true);
      setShowConfirmModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarModal = () => {
    setShowConfirmModal(false);
    setItemParaExcluir(null);
    setModalMessage('');
    setIsAlertModal(false);
  };

  const handleVisualizar = (item: EmpresaFilialItem) => {
    if (item.tipo === 'sede') {
      const empresa = empresasOriginais.find(e => e.id === item.id);
      if (empresa) {
        setSelectedItem(empresa);
        setSelectedItemTipo('sede');
        setShowModal(true);
      }
    } else {
      const filial = filiaisOriginais.find(f => f.id === item.id);
      if (filial) {
        setSelectedItem(filial);
        setSelectedItemTipo('filial');
        setShowModal(true);
      }
    }
  };

  const handleEditar = (item: EmpresaFilialItem) => {
    onNavigate('empresas-editar', {
      empresaId: item.id,
      tipo: item.tipo,
      sedeId: item.sedeId
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleCreateFilial = () => {
    onNavigate('empresas-nova-filial');
  };

  const getStatus = (item: EmpresaFilialItem) => {
    return item.deleted_at ? 'Inativa' : 'Ativa';
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
          className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
          onClick={() => handleCreateFilial()}
        >
          Nova Filial
        </button>
      </div>

      {error && <div className="p-4 bg-red-100/30 text-red-800 rounded-md">{error}</div>}

      {loading ? (
        <div className="text-center py-8 text-[var(--color-text-secondary)]">
          Carregando empresas...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-[var(--color-surface)] rounded-md shadow">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Tipo</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Razão Social</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Nome Fantasia</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">CNPJ</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Status</th>
                <th className="text-center p-4 text-[var(--color-text-secondary)]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--color-text-secondary)]">
                    Nenhuma empresa cadastrada
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <tr
                    key={item.id}
                    className={`border-b border-[var(--color-border)] hover:bg-[var(--color-bg)] ${
                      item.tipo === 'filial' ? 'bg-[var(--color-bg)]/50' : ''
                    }`}
                  >
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          item.tipo === 'sede'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {item.tipo === 'sede' ? 'Sede' : '↳ Filial'}
                      </span>
                    </td>
                    <td className={`p-4 text-[var(--color-text)] ${item.tipo === 'filial' ? 'pl-8' : ''}`}>
                      {item.razao_social}
                    </td>
                    <td className="p-4 text-[var(--color-text)]">{item.nome_fantasia}</td>
                    <td className="p-4 text-[var(--color-text)]">{item.cnpj_cpf}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          getStatus(item) === 'Ativa'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {getStatus(item)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          className="p-2 hover:bg-[var(--color-primary-hover)] rounded transition-colors"
                          onClick={() => handleVisualizar(item)}
                          title="Visualizar"
                        >
                          <FiEye size={18} />
                        </button>
                        <button
                          className="p-2 hover:bg-[var(--color-primary-hover)] rounded transition-colors"
                          onClick={() => handleEditar(item)}
                          title="Editar"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          className={`p-2 rounded transition-colors ${
                            item.tipo === 'sede'
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'hover:bg-red-100 text-red-600'
                          }`}
                          onClick={() => item.tipo !== 'sede' && handleDelete(item)}
                          disabled={item.tipo === 'sede'}
                          title={item.tipo === 'sede' ? 'Não é possível excluir a sede' : 'Excluir'}
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
      {showModal && selectedItem && (
        <EmpresaViewModal
          data={selectedItem}
          tipo={selectedItemTipo}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};
