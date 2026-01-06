import React, { useEffect, useState } from 'react';
import { InputField } from '../../../components/InputField';
import { contatoService } from '../../../services/contato.service';
import type { Contato, UpdateContatoDto } from '../../../types/api.types';

interface EditarContatoSectionProps {
  contatoId: string;
  onNavigate: (section: string) => void;
}

export const EditarContatoSection: React.FC<EditarContatoSectionProps> = ({
  contatoId,
  onNavigate,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [telefone, setTelefone] = useState('');
  const [celular, setCelular] = useState('');
  const [contatoData, setContatoData] = useState<Contato | null>(null);

  useEffect(() => {
    const fetchContatoData = async () => {
      if (!contatoId) return;

      try {
        const data = await contatoService.findOne(contatoId);
        setContatoData(data);

        if (data.telefone) {
          setTelefone(formatPhone(data.telefone));
        }
        if (data.celular) {
          setCelular(formatPhone(data.celular));
        }
      } catch {
        setError('Erro ao buscar dados do contato');
      }
    };

    fetchContatoData();
  }, [contatoId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    if (!contatoId) {
      setError('ID do contato não encontrado.');
      setLoading(false);
      return;
    }

    const dto: UpdateContatoDto = {
      nome: formData.get('nome') as string,
      funcao: formData.get('funcao') as string,
      email: formData.get('email') as string,
      telefone: telefone,
      celular: celular,
    };

    if (!dto.nome || !dto.funcao || !dto.celular) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (dto.email && !emailRegex.test(dto.email)) {
      setError('Por favor, insira um email válido.');
      setLoading(false);
      return;
    }

    try {
      await contatoService.update(contatoId, dto);
      setSuccess('Contato atualizado com sucesso!');

      setTimeout(() => {
        onNavigate('auxiliares-contatos');
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar contato');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onNavigate('auxiliares-contatos');
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

  const handleCelularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setCelular(formatted);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {error && <div className="mb-4 p-3 bg-red-100/30 text-red-800 rounded-md">{error}</div>}

      {success && (
        <div className="mb-4 p-3 bg-green-100/30 text-green-800 rounded-md">{success}</div>
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
            defaultValue={contatoData?.nome || ''}
            required
          />
          <InputField
            id="funcao"
            label="Função"
            type="text"
            placeholder="Digite a função/cargo"
            defaultValue={contatoData?.funcao || ''}
            required
          />
          <InputField
            id="email"
            label="E-mail"
            type="email"
            placeholder="contato@email.com"
            defaultValue={contatoData?.email || ''}
          />
          <InputField
            id="telefone"
            label="Telefone"
            type="tel"
            placeholder="(00)00000-0000"
            value={telefone}
            onChange={handleTelefoneChange}
          />
          <InputField
            id="celular"
            label="Celular"
            type="tel"
            placeholder="(00)00000-0000"
            value={celular}
            onChange={handleCelularChange}
            required
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
