import React, { useEffect, useState } from 'react';
import { InputField } from '../../../components/InputField';
import { empresaService } from '../../../services/empresa.service';
import type { CreateFilialDto, Empresa } from '../../../types/api.types';
import { useAuth } from '../../../context/AuthContext';
import { contatoService } from '../../../services/contato.service';
import { cidadeService } from '../../../services/cidade.service';

interface EditarEmpresaSectionProps {
  empresaId: string;
  onNavigate: (section: string) => void;
}

export const EditarEmpresaSection: React.FC<EditarEmpresaSectionProps> = ({
  empresaId,
  onNavigate,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bacen, setBacen] = useState('');
  const [telefone, setTelefone] = useState('');
  const [celular, setCelular] = useState('');
  const [empresaData, setEmpresaData] = useState<Empresa | null>(null);
  const { getClienteId } = useAuth();

  useEffect(() => {
    const fetchEmpresaData = async () => {
      if (!empresaId) return;

      try {
        const data = await empresaService.findOne(empresaId);
        setEmpresaData(data);

        if (data.telefone) {
          setTelefone(formatPhone(data.telefone));
        }
        if (data.celular) {
          setCelular(formatPhone(data.celular));
        }
      } catch (error) {
        setError('Erro ao buscar dados da empresa');
      }
    };

    fetchEmpresaData();
  }, [empresaId]);

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

    if (!empresaId) {
      setError('ID da empresa não encontrado.');
      setLoading(false);
      return;
    }

    const empresas = await empresaService.findByCliente(clienteId);
    const sede = empresas.find(e => e.sede === null);
    const sedeId = sede ? sede.id : '';

    const dto: CreateFilialDto = {
      cliente_id: clienteId,
      empresa_id: sedeId,
      razao_social: (formData.get('razao-social') as string) || empresaData?.razao_social || '',
      nome_fantasia: (formData.get('nome-fantasia') as string) || empresaData?.nome_fantasia || '',
      cnpj_cpf: (formData.get('cnpj') as string) || empresaData?.cnpj_cpf || '',
      inscricao_estadual:
        (formData.get('inscricao-estadual') as string) || empresaData?.inscricao_estadual || '',
      cep: formData.get('cep') as string,
      logradouro: formData.get('logradouro') as string,
      numero: formData.get('numero') as string,
      complemento: formData.get('complemento') as string,
      bairro: formData.get('bairro') as string,
      cidade: formData.get('cidade') as string,
      uf: formData.get('estado') as string,
      telefone: telefone,
      celular: celular,
      email: formData.get('email') as string,
      codigo_ibge: formData.get('ibge') as string,
    };

    try {
      if (empresaData?.sede) {
        await empresaService.updateFilial(empresaId, dto);
      } else {
        await empresaService.update(empresaId, dto);
      }

      try {
        const contato = await contatoService.findOneByTelefone(dto.celular || dto.telefone || '');
        if (contato?.id) {
          await contatoService.update(contato.id, {
            telefone: dto.telefone || '',
            celular: dto.celular || '',
            email: dto.email || '',
          });
        }
      } catch (contatoErr) {
        console.warn('Erro ao atualizar contato:', contatoErr);
      }

      try {
        const cidade = await cidadeService.findByCodigoIbge(empresaData?.codigo_ibge || '');
        if (cidade?.id) {
          await cidadeService.update(cidade.id, {
            nome: dto.cidade || '',
            uf: dto.uf || '',
            codigoBacen: bacen || '0',
          });
        }
      } catch (cidadeErr) {
        console.warn('Erro ao atualizar cidade:', cidadeErr);
      }

      setSuccess('Empresa atualizada com sucesso!');
      onNavigate('empresas-listar');
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onNavigate('empresas-listar');
  };

  const formatPhone = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length <= 10) {
      return cleaned.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      return cleaned
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 15);
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

  const handleBacenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBacen(e.target.value);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-[var(--color-surface)] p-6 rounded-md shadow"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            id="razao-social"
            label="Razão Social"
            type="text"
            placeholder="Digite a razão social"
            disabled={true}
            defaultValue={empresaData?.razao_social || ''}
          />
          <InputField
            id="nome-fantasia"
            label="Nome Fantasia"
            type="text"
            disabled={true}
            placeholder="Digite o nome fantasia"
            defaultValue={empresaData?.nome_fantasia || ''}
          />
          <InputField
            id="cnpj"
            label="CNPJ"
            type="text"
            disabled={true}
            placeholder="00.000.000/0000-00"
            defaultValue={empresaData?.cnpj_cpf || ''}
          />
          <InputField
            id="inscricao-estadual"
            label="Inscrição Estadual"
            type="text"
            disabled={true}
            placeholder="Digite a IE"
            defaultValue={empresaData?.inscricao_estadual || ''}
          />
        </div>

        <div className="border-t border-[var(--color-border)] pt-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              id="cep"
              label="CEP"
              type="text"
              placeholder="00000-000"
              defaultValue={empresaData?.cep || ''}
            />
            <InputField
              id="logradouro"
              label="Logradouro"
              type="text"
              placeholder="Rua, Avenida..."
              defaultValue={empresaData?.logradouro || ''}
            />
            <InputField
              id="numero"
              label="Número"
              type="text"
              placeholder="Nº"
              defaultValue={empresaData?.numero || ''}
            />
            <InputField
              id="complemento"
              label="Complemento"
              type="text"
              placeholder="Apto, Sala..."
              defaultValue={empresaData?.complemento || ''}
            />
            <InputField
              id="bairro"
              label="Bairro"
              type="text"
              placeholder="Digite o bairro"
              defaultValue={empresaData?.bairro || ''}
            />
            <InputField
              id="cidade"
              label="Cidade"
              type="text"
              placeholder="Digite a cidade"
              defaultValue={empresaData?.cidade || ''}
            />
            <InputField
              id="estado"
              label="Estado"
              type="text"
              placeholder="UF"
              defaultValue={empresaData?.uf || ''}
            />
            <InputField
              id="ibge"
              label="Código IBGE"
              placeholder="Digite o código IBGE"
              defaultValue={empresaData?.codigo_ibge || ''}
            />

            <InputField
              id="codigo-bacen"
              label="Código BACEN"
              placeholder="Digite o código BACEN"
              value={bacen}
              onChange={handleBacenChange}
            />
          </div>
        </div>

        <div className="border-t border-[var(--color-border)] pt-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Contato</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              id="telefone"
              label="Telefone"
              type="tel"
              placeholder="(00) 0000-0000"
              value={telefone}
              onChange={handleTelefoneChange}
            />
            <InputField
              id="celular"
              label="Celular"
              type="tel"
              placeholder="(00) 00000-0000"
              value={celular}
              onChange={handleCelularChange}
            />
            <InputField
              id="email"
              label="E-mail"
              type="email"
              placeholder="empresa@email.com"
              defaultValue={empresaData?.email || ''}
            />
          </div>
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
