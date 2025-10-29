import React, { useEffect, useState } from 'react';
import { InputField } from '../../../components/InputField';
import { usuarioService, type UsuarioUpdateDto } from '../../../services/usuario.service';
import type { User } from '../../../types/api.types';

interface EditarUsuarioSectionProps {
  usuarioId: string;
  onNavigate: (section: string) => void;
}

export const EditarUsuarioSection: React.FC<EditarUsuarioSectionProps> = ({
  usuarioId,
  onNavigate,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [telefone, setTelefone] = useState('');
  const [usuarioData, setUsuarioData] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsuarioData = async () => {
      if (!usuarioId) return;

      try {
        const data = await usuarioService.getOne(usuarioId);
        console.log(data)
        setUsuarioData(data);

        if (data?.telefone) {
          setTelefone(formatPhone(data.telefone));
        }
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

    const dto: UsuarioUpdateDto = {
      nome: formData.get('nome') as string,
      email: formData.get('email') as string,
      cargo: formData.get('cargo') as string,
      telefone: telefone,
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (dto.email && !emailRegex.test(dto.email)) {
      setError('Por favor, insira um email válido.');
      setLoading(false);
      return;
    }

    try {
      await usuarioService.update(usuarioId, dto);
      setSuccess('Usuário atualizado com sucesso!');

      setTimeout(() => {
        onNavigate('usuarios-listar');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onNavigate('usuarios-listar');
  };

  const formatPhone = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length <= 10) {
      return cleaned.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      return cleaned
        .replace(/^(\d{2})(\d)/, '($1)$2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 14);
    }
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setTelefone(formatted);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            id="nome"
            label="Nome Completo"
            type="text"
            placeholder="Digite o nome completo"
            defaultValue={usuarioData?.nome || ''}
            required
          />
          <InputField
            id="email"
            label="E-mail"
            type="email"
            placeholder="usuario@email.com"
            defaultValue={usuarioData?.email || ''}
            required
          />
          <InputField
            id="login"
            label="Login"
            type="text"
            placeholder="Digite o login"
            defaultValue={usuarioData?.login || ''}
            disabled
          />
          <InputField
            id="cargo"
            label="Cargo"
            type="text"
            placeholder="Digite o cargo"
            defaultValue={usuarioData?.cargo || ''}
          />
          <InputField
            id="telefone"
            label="Telefone"
            type="tel"
            placeholder="(00)00000-0000"
            value={telefone}
            onChange={handleTelefoneChange}
          />
        </div>

        <div className="flex justify-end gap-4 pt-6">
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
