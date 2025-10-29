import React, { useEffect, useState } from 'react';
import { InputField } from '../../../components/InputField';
import { usuarioService, type UsuarioUpdateDto } from '../../../services/usuario.service';
import type { User } from '../../../types/api.types';

interface ResetarSenhaUsuarioSectionProps {
  usuarioId: string;
  onNavigate: (section: string) => void;
}

export const ResetarSenhaUsuarioSection: React.FC<ResetarSenhaUsuarioSectionProps> = ({
  usuarioId,
  onNavigate,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [usuarioData, setUsuarioData] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsuarioData = async () => {
      if (!usuarioId) return;

      try {
        const data = await usuarioService.getOne(usuarioId);
        setUsuarioData(data);
      } catch (error) {
        setError('Erro ao buscar dados do usuário');
      }
    };

    fetchUsuarioData();
  }, [usuarioId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    if (!usuarioId) {
      setError('ID do usuário não encontrado.');
      setLoading(false);
      return;
    }

    const novaSenha = formData.get('novaSenha') as string;
    const confirmarSenha = formData.get('confirmarSenha') as string;

    // Validações
    if (!novaSenha || novaSenha.trim() === '') {
      setError('Por favor, informe a nova senha.');
      setLoading(false);
      return;
    }

    if (novaSenha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    const dto: UsuarioUpdateDto = {
      senha: novaSenha,
    };

    try {
      await usuarioService.update(usuarioId, dto);
      setSuccess('Senha resetada com sucesso!');

      setTimeout(() => {
        onNavigate('usuarios-listar');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao resetar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onNavigate('usuarios-listar');
  };

  return (
    <div className="max-w-2xl mx-auto">
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

      <div className="bg-[var(--color-surface)] p-6 rounded-md shadow mb-6">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
          Informações do Usuário
        </h3>
        <div className="space-y-2 text-[var(--color-text-secondary)]">
          <p>
            <span className="font-medium">Nome:</span> {usuarioData?.nome || '-'}
          </p>
          <p>
            <span className="font-medium">Email:</span> {usuarioData?.email || '-'}
          </p>
          <p>
            <span className="font-medium">Login:</span> {usuarioData?.login || '-'}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-[var(--color-surface)] p-6 rounded-md shadow"
      >
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Resetar Senha
          </h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            Digite a nova senha para o usuário. A senha deve ter pelo menos 6 caracteres.
          </p>

          <InputField
            id="novaSenha"
            label="Nova Senha"
            type="password"
            placeholder="Digite a nova senha"
            required
          />

          <InputField
            id="confirmarSenha"
            label="Confirmar Nova Senha"
            type="password"
            placeholder="Confirme a nova senha"
            required
          />
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
            {loading ? 'Resetando...' : 'Resetar Senha'}
          </button>
        </div>
      </form>
    </div>
  );
};
