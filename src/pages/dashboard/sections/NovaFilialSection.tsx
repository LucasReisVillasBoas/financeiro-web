import React, { useState, useEffect } from 'react';
import { InputField } from '../../../components/InputField';
import { SelectField, ESTADOS_BRASIL } from '../../../components/SelectField';
import { CepField } from '../../../components/CepField';
import { empresaService } from '../../../services/empresa.service';
import type { CreateFilialDto, Empresa } from '../../../types/api.types';
import { useAuth } from '../../../context/AuthContext';
import { perfilService } from '../../../services/perfil.service';
import type { CepData } from '../../../services/cep.service';

interface NovaFilialSectionProps {
  onNavigate: (section: string) => void;
}

export const NovaFilialSection: React.FC<NovaFilialSectionProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [loadingSede, setLoadingSede] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sede, setSede] = useState<Empresa | null>(null);
  const [cnpj, setCnpj] = useState('');
  const [telefone, setTelefone] = useState('');
  const [celular, setCelular] = useState('');
  const { getClienteId } = useAuth();

  // Funções de formatação
  const formatCnpj = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18);
  };

  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      return numbers
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 15);
    }
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpj(formatCnpj(e.target.value));
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatPhone(e.target.value));
  };

  const handleCelularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCelular(formatPhone(e.target.value));
  };

  // Buscar a sede automaticamente
  useEffect(() => {
    const fetchSede = async () => {
      const clienteId = getClienteId();
      if (!clienteId) {
        setError('Erro ao obter informações do usuário.');
        setLoadingSede(false);
        return;
      }

      try {
        const empresas = await empresaService.findByCliente(clienteId);
        const sedeEmpresa = empresas.find(e => !e.sede);
        if (sedeEmpresa) {
          setSede(sedeEmpresa);
        } else {
          setError('Nenhuma sede encontrada. Cadastre uma sede primeiro.');
        }
      } catch (err: unknown) {
        const error = err as { message?: string };
        setError(error.message || 'Erro ao buscar sede');
      } finally {
        setLoadingSede(false);
      }
    };

    fetchSede();
  }, [getClienteId]);

  // Estado para campos de endereço
  const [endereco, setEndereco] = useState({
    cep: '',
    logradouro: '',
    bairro: '',
    cidade: '',
    uf: '',
    ibge: '',
  });

  const handleEnderecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setEndereco(prev => ({ ...prev, [id]: value }));
  };

  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEndereco(prev => ({ ...prev, uf: e.target.value }));
  };

  const handleAddressFound = (data: CepData) => {
    setEndereco(prev => ({
      ...prev,
      logradouro: data.logradouro || prev.logradouro,
      bairro: data.bairro || prev.bairro,
      cidade: data.cidade || prev.cidade,
      uf: data.uf || prev.uf,
      ibge: data.ibge || prev.ibge,
    }));
  };

  const handleCancel = () => {
    onNavigate('empresas-listar');
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

    if (!sede) {
      setError('Sede não encontrada. Não é possível cadastrar filial.');
      setLoading(false);
      return;
    }

    const nomeFantasia = formData.get('nome-fantasia') as string;
    const emailValue = formData.get('email') as string;

    // Validação de campos obrigatórios
    const razaoSocial = formData.get('razao-social') as string;
    if (!razaoSocial || !nomeFantasia || !cnpj || !emailValue) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    const inscricaoEstadual = formData.get('inscricao-estadual') as string;
    const numeroValue = formData.get('numero') as string;
    const complementoValue = formData.get('complemento') as string;
    const dataAbertura = formData.get('data-abertura') as string;

    const dto: CreateFilialDto = {
      empresa_id: sede.id,
      cliente_id: clienteId,
      razao_social: formData.get('razao-social') as string,
      nome_fantasia: nomeFantasia,
      cnpj_cpf: cnpj.replace(/\D/g, ''),
      inscricao_estadual: inscricaoEstadual || undefined,
      cep: endereco.cep.replace(/\D/g, '') || undefined,
      logradouro: endereco.logradouro || undefined,
      numero: numeroValue || undefined,
      complemento: complementoValue || undefined,
      bairro: endereco.bairro || undefined,
      cidade: endereco.cidade || undefined,
      uf: endereco.uf || undefined,
      data_abertura: dataAbertura ? new Date(dataAbertura) : undefined,
    };

    // Adiciona contato com dados obrigatórios
    dto.contato = {
      nome: nomeFantasia,
      email: emailValue,
      telefone: telefone.replace(/\D/g, '') || undefined,
      celular: celular.replace(/\D/g, '') || undefined,
      funcao: 'Contato Principal',
    };

    try {
      const perfil = await perfilService.findAll(clienteId);
      if (perfil.length !== 0 && perfil.map(p => p.nome).includes('Administrador') === false) {
        setError('Perfil "Administrador" não encontrado. Contate o suporte.');
        setLoading(false);
        return;
      }
      if (perfil.length === 0) {
        await perfilService.create({
          clienteId: clienteId,
          nome: 'Administrador',
          permissoes: {
            usuarios: ['criar', 'editar', 'listar'],
            relatorios: ['criar', 'editar', 'listar'],
            empresas: ['criar', 'editar', 'listar'],
          },
        });
      }
      await empresaService.createFilial(sede.id, dto);
      setSuccess('Filial cadastrada com sucesso!');

      // Volta para listagem após 1 segundo
      setTimeout(() => {
        onNavigate('empresas-listar');
      }, 1000);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao cadastrar filial');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {error && <div className="mb-4 p-3 bg-red-100/30 text-red-800 rounded-md">{error}</div>}

      {success && (
        <div className="mb-4 p-3 bg-green-100/30 text-green-800 rounded-md">{success}</div>
      )}

      {loadingSede ? (
        <div className="text-center py-8 text-[var(--color-text-secondary)]">
          Carregando informações da sede...
        </div>
      ) : !sede ? (
        <div className="text-center py-8 text-[var(--color-text-secondary)]">
          Nenhuma sede encontrada.
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-[var(--color-surface)] p-6 rounded-md shadow"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              id="cnpj-sede"
              label="CNPJ Sede"
              type="text"
              value={formatCnpj(sede.cnpj_cpf || '')}
              disabled={true}
            />
            <InputField
              id="razao-social"
              label="Razão Social"
              type="text"
              placeholder="Digite a razão social"
              required
            />
            <InputField
              id="nome-fantasia"
              label="Nome Fantasia"
              type="text"
              placeholder="Digite o nome fantasia"
              required
            />
            <InputField
              id="cnpj"
              label="CNPJ"
              type="text"
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={handleCnpjChange}
              required
            />
            <InputField
              id="inscricao-estadual"
              label="Inscrição Estadual"
              type="text"
              placeholder="Digite a IE"
            />
            <InputField id="data-abertura" label="Data de Abertura" type="date" placeholder="" />
          </div>

          <div className="border-t border-[var(--color-border)] pt-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              Endereço
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CepField
                value={endereco.cep}
                onChange={cep => setEndereco(prev => ({ ...prev, cep }))}
                onAddressFound={handleAddressFound}
              />
              <InputField
                id="logradouro"
                label="Logradouro"
                type="text"
                placeholder="Rua, Avenida..."
                value={endereco.logradouro}
                onChange={handleEnderecoChange}
              />
              <InputField id="numero" label="Número" type="text" placeholder="Nº" />
              <InputField
                id="complemento"
                label="Complemento"
                type="text"
                placeholder="Apto, Sala..."
              />
              <InputField
                id="bairro"
                label="Bairro"
                type="text"
                placeholder="Digite o bairro"
                value={endereco.bairro}
                onChange={handleEnderecoChange}
              />
              <InputField
                id="cidade"
                label="Cidade"
                type="text"
                placeholder="Digite a cidade"
                value={endereco.cidade}
                onChange={handleEnderecoChange}
              />
              <SelectField
                id="uf"
                label="Estado"
                placeholder="Selecione o estado"
                options={ESTADOS_BRASIL}
                value={endereco.uf}
                onChange={handleEstadoChange}
              />
              <InputField
                id="ibge"
                label="Código IBGE"
                placeholder="Digite o código IBGE"
                value={endereco.ibge}
                onChange={handleEnderecoChange}
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
                required
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
              {loading ? 'Cadastrando...' : 'Cadastrar Filial'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
