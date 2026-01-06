import React, { useEffect, useState } from 'react';
import { SelectField, ROLES_USUARIO } from '../../../components/SelectField';
import { perfilService, type PerfilUpdateDto } from '../../../services/perfil.service';
import type { Perfil } from '../../../types/api.types';
import { useAuth } from '../../../context/AuthContext';

// Módulos disponíveis no sistema
const MODULOS_DISPONIVEIS = [
  { value: 'empresas', label: 'Empresas', descricao: 'Gestão de empresas e filiais' },
  { value: 'financeiro', label: 'Financeiro', descricao: 'Contas a pagar/receber, movimentações' },
  { value: 'usuarios', label: 'Usuários', descricao: 'Gestão de usuários e perfis' },
  { value: 'relatorios', label: 'Relatórios', descricao: 'Relatórios e exportações' },
  { value: 'contatos', label: 'Contatos', descricao: 'Gestão de contatos' },
  { value: 'cidades', label: 'Cidades', descricao: 'Cadastro de cidades' },
  { value: 'pessoas', label: 'Pessoas', descricao: 'Cadastro de pessoas/clientes' },
  { value: 'auditoria', label: 'Auditoria', descricao: 'Logs de auditoria' },
];

// Níveis de permissão hierárquicos
const NIVEIS_PERMISSAO = [
  { value: '', label: 'Sem acesso', acoes: [] },
  { value: 'visualizar', label: 'Visualizar', acoes: ['visualizar', 'listar'] },
  { value: 'editar', label: 'Editar', acoes: ['visualizar', 'listar', 'editar'] },
  { value: 'criar', label: 'Criar', acoes: ['visualizar', 'listar', 'editar', 'criar'] },
  {
    value: 'excluir',
    label: 'Excluir',
    acoes: ['visualizar', 'listar', 'editar', 'criar', 'excluir'],
  },
  {
    value: 'completa',
    label: 'Completa',
    acoes: ['visualizar', 'listar', 'editar', 'criar', 'excluir', 'exportar'],
  },
];

interface EditarPerfilSectionProps {
  perfilId: string;
  onNavigate: (section: string) => void;
}

export const EditarPerfilSection: React.FC<EditarPerfilSectionProps> = ({
  perfilId,
  onNavigate,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [perfilData, setPerfilData] = useState<Perfil | null>(null);
  const [nome, setNome] = useState('');
  const [permissoesPorModulo, setPermissoesPorModulo] = useState<Record<string, string>>({});
  const { getClienteId } = useAuth();

  // Determina o nível de permissão baseado nas ações salvas
  const determinarNivel = (acoes: string[]): string => {
    if (!acoes || acoes.length === 0) return '';

    // Verifica de trás pra frente (do maior nível para o menor)
    for (let i = NIVEIS_PERMISSAO.length - 1; i >= 0; i--) {
      const nivel = NIVEIS_PERMISSAO[i];
      if (nivel.acoes.length === 0) continue;

      // Se todas as ações do nível estão presentes
      const todasPresentes = nivel.acoes.every(acao => acoes.includes(acao));
      if (todasPresentes) {
        return nivel.value;
      }
    }

    return 'visualizar';
  };

  useEffect(() => {
    const fetchPerfilData = async () => {
      if (!perfilId) return;

      const clienteId = getClienteId();
      if (!clienteId) {
        setError('Erro ao obter informações do usuário. Faça login novamente.');
        setLoadingData(false);
        return;
      }

      try {
        const data = await perfilService.findOne(perfilId, clienteId);
        setPerfilData(data);
        setNome(data.nome || '');

        // Converter permissões para níveis por módulo
        const niveis: Record<string, string> = {};
        if (data.permissoes) {
          Object.entries(data.permissoes).forEach(([modulo, acoes]) => {
            niveis[modulo] = determinarNivel(acoes);
          });
        }
        setPermissoesPorModulo(niveis);
      } catch {
        setError('Erro ao buscar dados do perfil');
      } finally {
        setLoadingData(false);
      }
    };

    fetchPerfilData();
  }, [perfilId, getClienteId]);

  const handleNivelChange = (modulo: string, nivel: string) => {
    setPermissoesPorModulo(prev => ({
      ...prev,
      [modulo]: nivel,
    }));
  };

  // Converte níveis selecionados para o formato de permissões do backend
  const converterParaPermissoes = (): Record<string, string[]> => {
    const permissoes: Record<string, string[]> = {};

    Object.entries(permissoesPorModulo).forEach(([modulo, nivel]) => {
      if (nivel) {
        const nivelConfig = NIVEIS_PERMISSAO.find(n => n.value === nivel);
        if (nivelConfig && nivelConfig.acoes.length > 0) {
          permissoes[modulo] = [...nivelConfig.acoes];
        }
      }
    });

    return permissoes;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Verifica se é Master Admin
    if (perfilData?.masterAdmin) {
      setError(
        'Não é possível editar o perfil do Administrador Master. Este perfil possui acesso total e não pode ser modificado.'
      );
      return;
    }

    setLoading(true);

    const clienteId = getClienteId();
    if (!clienteId) {
      setError('Erro ao obter informações do usuário. Faça login novamente.');
      setLoading(false);
      return;
    }

    if (!perfilId) {
      setError('ID do perfil não encontrado.');
      setLoading(false);
      return;
    }

    if (!nome) {
      setError('Por favor, informe o nome do perfil.');
      setLoading(false);
      return;
    }

    const permissoes = converterParaPermissoes();
    const temPermissoes = Object.keys(permissoes).length > 0;

    if (!temPermissoes) {
      setError('Por favor, selecione pelo menos uma permissão.');
      setLoading(false);
      return;
    }

    const dto: PerfilUpdateDto = {
      nome: nome,
      permissoes: permissoes,
    };

    try {
      await perfilService.update(clienteId, perfilId, dto);
      setSuccess('Perfil atualizado com sucesso!');

      setTimeout(() => {
        onNavigate('usuarios-perfis');
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onNavigate('usuarios-perfis');
  };

  const isMasterAdmin = perfilData?.masterAdmin === true;

  if (loadingData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-8 text-[var(--color-text-secondary)]">
          Carregando dados do perfil...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {error && <div className="mb-4 p-3 bg-red-100/30 text-red-800 rounded-md">{error}</div>}

      {success && (
        <div className="mb-4 p-3 bg-green-100/30 text-green-800 rounded-md">{success}</div>
      )}

      {/* Alerta Master Admin */}
      {isMasterAdmin && (
        <div className="mb-4 p-4 bg-yellow-100/30 border border-yellow-400 text-yellow-800 rounded-md">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-semibold">Perfil Master Admin</p>
              <p className="text-sm">
                Este perfil possui acesso total ao sistema e não pode ser editado ou excluído.
              </p>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-[var(--color-surface)] p-6 rounded-md shadow"
      >
        {/* Cabeçalho com badge Master Admin */}
        {isMasterAdmin && (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-purple-600 text-white text-sm font-medium rounded-full">
              Master Admin
            </span>
          </div>
        )}

        <div className="space-y-6">
          <SelectField
            id="nome"
            label="Nome do Perfil"
            placeholder="Selecione o perfil"
            options={ROLES_USUARIO}
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
            disabled={isMasterAdmin}
          />
        </div>

        <div className="border-t border-[var(--color-border)] pt-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
            Permissões por Módulo
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            Selecione o nível de acesso para cada módulo. Cada nível inclui automaticamente as
            permissões dos níveis anteriores.
          </p>

          <div className="space-y-4">
            {MODULOS_DISPONIVEIS.map(modulo => (
              <div
                key={modulo.value}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border border-[var(--color-border)] rounded-md bg-[var(--color-bg)]"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-[var(--color-text)]">{modulo.label}</h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">{modulo.descricao}</p>
                </div>
                <div className="sm:w-48">
                  <select
                    value={permissoesPorModulo[modulo.value] || ''}
                    onChange={e => handleNivelChange(modulo.value, e.target.value)}
                    disabled={isMasterAdmin}
                    className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {NIVEIS_PERMISSAO.map(nivel => (
                      <option key={nivel.value} value={nivel.value}>
                        {nivel.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legenda dos níveis */}
        <div className="border-t border-[var(--color-border)] pt-6">
          <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">
            Legenda dos Níveis de Permissão
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
            {NIVEIS_PERMISSAO.slice(1).map(nivel => (
              <div key={nivel.value} className="flex items-start gap-2">
                <span className="font-medium text-[var(--color-text)]">{nivel.label}:</span>
                <span className="text-[var(--color-text-secondary)]">{nivel.acoes.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-[var(--color-border)]">
          <button
            type="button"
            className="px-6 py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-md hover:bg-[var(--color-bg)] transition-colors"
            onClick={handleCancel}
          >
            {isMasterAdmin ? 'Voltar' : 'Cancelar'}
          </button>
          {!isMasterAdmin && (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
