import React, { useEffect, useState } from 'react';
import { InputField } from '../../../components/InputField';
import { perfilService, type PerfilUpdateDto } from '../../../services/perfil.service';
import type { Perfil } from '../../../types/api.types';
import { useAuth } from '../../../context/AuthContext';

interface EditarPerfilSectionProps {
  perfilId: string;
  onNavigate: (section: string) => void;
}

export const EditarPerfilSection: React.FC<EditarPerfilSectionProps> = ({
  perfilId,
  onNavigate,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [perfilData, setPerfilData] = useState<Perfil | null>(null);
  const { getClienteId } = useAuth();

  // Permissões disponíveis
  const modulosDisponiveis = ['usuarios', 'empresas', 'relatorios', 'financeiro'];
  const acoesDisponiveis = ['visualizar', 'criar', 'editar', 'excluir'];

  // Estado para gerenciar as permissões selecionadas
  const [permissoes, setPermissoes] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchPerfilData = async () => {
      if (!perfilId) return;

      const clienteId = getClienteId();
      if (!clienteId) {
        setError('Erro ao obter informações do usuário. Faça login novamente.');
        return;
      }

      try {
        const data = await perfilService.findOne(perfilId, clienteId);
        setPerfilData(data);
        setPermissoes(data.permissoes || {});
      } catch (error) {
        setError('Erro ao buscar dados do perfil');
      }
    };

    fetchPerfilData();
  }, [perfilId]);

  const handlePermissaoChange = (modulo: string, acao: string, checked: boolean) => {
    setPermissoes(prev => {
      const novasPermissoes = { ...prev };
      if (!novasPermissoes[modulo]) {
        novasPermissoes[modulo] = [];
      }

      if (checked) {
        if (!novasPermissoes[modulo].includes(acao)) {
          novasPermissoes[modulo] = [...novasPermissoes[modulo], acao];
        }
      } else {
        novasPermissoes[modulo] = novasPermissoes[modulo].filter(a => a !== acao);
      }

      return novasPermissoes;
    });
  };

  const isPermissaoChecked = (modulo: string, acao: string): boolean => {
    return permissoes[modulo]?.includes(acao) || false;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

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

    const dto: PerfilUpdateDto = {
      nome: formData.get('nome') as string,
      permissoes: permissoes,
    };

    // Validações
    if (!dto.nome) {
      setError('Por favor, informe o nome do perfil.');
      setLoading(false);
      return;
    }

    // Verificar se pelo menos uma permissão foi selecionada
    const temPermissoes = Object.values(permissoes).some(acoes => acoes.length > 0);
    if (!temPermissoes) {
      setError('Por favor, selecione pelo menos uma permissão.');
      setLoading(false);
      return;
    }

    try {
      await perfilService.update(clienteId, perfilId, dto);
      setSuccess('Perfil atualizado com sucesso!');

      setTimeout(() => {
        onNavigate('usuarios-perfis');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onNavigate('usuarios-perfis');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="mb-4 p-3 bg-red-100/30 text-red-800 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100/30 text-green-800 rounded-md">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-[var(--color-surface)] p-6 rounded-md shadow"
      >
        <div className="space-y-6">
          <InputField
            id="nome"
            label="Nome do Perfil"
            type="text"
            placeholder="Ex: Administrador, Editor, Visualizador"
            defaultValue={perfilData?.nome || ''}
            required
          />
        </div>

        <div className="border-t border-[var(--color-border)] pt-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            Permissões
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            Selecione as permissões que este perfil terá em cada módulo do sistema.
          </p>

          <div className="space-y-6">
            {modulosDisponiveis.map(modulo => (
              <div
                key={modulo}
                className="border border-[var(--color-border)] rounded-md p-4 space-y-3"
              >
                <h4 className="font-medium text-[var(--color-text)] capitalize">{modulo}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {acoesDisponiveis.map(acao => (
                    <label key={acao} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPermissaoChecked(modulo, acao)}
                        onChange={e => handlePermissaoChange(modulo, acao, e.target.checked)}
                        className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />
                      <span className="text-sm text-[var(--color-text)] capitalize">{acao}</span>
                    </label>
                  ))}
                </div>
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
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};
