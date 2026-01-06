import React, { useEffect, useState } from 'react';
import { InputField } from '../../../components/InputField';
import { SelectField, ESTADOS_BRASIL } from '../../../components/SelectField';
import { CepField } from '../../../components/CepField';
import { empresaService } from '../../../services/empresa.service';
import type { Empresa } from '../../../types/api.types';
import { useAuth } from '../../../context/AuthContext';
import type { CepData } from '../../../services/cep.service';

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

  // Estado para campos editáveis
  const [dadosEmpresa, setDadosEmpresa] = useState({
    razao_social: '',
    nome_fantasia: '',
    inscricao_estadual: '',
    data_abertura: '',
    cnpj_cpf: '', // Apenas para exibição formatada
  });

  // Estado para campos de endereço
  const [endereco, setEndereco] = useState({
    cep: '',
    logradouro: '',
    bairro: '',
    cidade: '',
    uf: '',
    ibge: '',
  });

  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{0,3})/, '$1-$2').replace(/-$/, '');
  };

  const formatCnpjCpf = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 11) {
      // CPF: 000.000.000-00
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (numbers.length === 14) {
      // CNPJ: 00.000.000/0000-00
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return value;
  };

  useEffect(() => {
    const fetchEmpresaData = async () => {
      if (!empresaId) return;

      try {
        const data = await empresaService.findOne(empresaId);
        setEmpresaData(data);

        // Preencher dados da empresa
        setDadosEmpresa({
          razao_social: data.razao_social || '',
          nome_fantasia: data.nome_fantasia || '',
          inscricao_estadual: data.inscricao_estadual || '',
          data_abertura: data.data_abertura
            ? new Date(data.data_abertura).toISOString().split('T')[0]
            : '',
          cnpj_cpf: data.cnpj_cpf ? formatCnpjCpf(data.cnpj_cpf) : '',
        });

        if (data.telefone) {
          setTelefone(formatPhone(data.telefone));
        }
        if (data.celular) {
          setCelular(formatPhone(data.celular));
        }
        // Preencher estado do endereço
        setEndereco({
          cep: data.cep ? formatCep(data.cep) : '',
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.cidade || '',
          uf: data.uf || '',
          ibge: data.codigo_ibge || '',
        });
      } catch {
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

    const dto = {
      cliente_id: clienteId,
      razao_social: dadosEmpresa.razao_social,
      nome_fantasia: dadosEmpresa.nome_fantasia,
      cnpj_cpf: empresaData?.cnpj_cpf || '', // Mantém o original sem formatação
      inscricao_estadual: dadosEmpresa.inscricao_estadual || undefined,
      cep: endereco.cep.replace(/\D/g, '') || undefined,
      logradouro: endereco.logradouro || undefined,
      numero: (formData.get('numero') as string) || undefined,
      complemento: (formData.get('complemento') as string) || undefined,
      bairro: endereco.bairro || undefined,
      cidade: endereco.cidade || undefined,
      uf: endereco.uf || undefined,
      telefone: telefone.replace(/\D/g, '') || undefined,
      celular: celular.replace(/\D/g, '') || undefined,
      email: (formData.get('email') as string) || undefined,
      codigo_ibge: endereco.ibge || undefined,
      data_abertura: dadosEmpresa.data_abertura ? new Date(dadosEmpresa.data_abertura) : undefined,
    };

    try {
      await empresaService.update(empresaId, dto);

      setSuccess('Empresa atualizada com sucesso!');
      onNavigate('empresas-listar');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar empresa');
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

  const handleDadosEmpresaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const fieldMap: Record<string, string> = {
      'razao-social': 'razao_social',
      'nome-fantasia': 'nome_fantasia',
      'inscricao-estadual': 'inscricao_estadual',
      'data-abertura': 'data_abertura',
    };
    const fieldName = fieldMap[id] || id;
    setDadosEmpresa(prev => ({ ...prev, [fieldName]: value }));
  };

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
            id="razao-social"
            label="Razão Social"
            type="text"
            placeholder="Digite a razão social"
            value={dadosEmpresa.razao_social}
            onChange={handleDadosEmpresaChange}
          />
          <InputField
            id="nome-fantasia"
            label="Nome Fantasia"
            type="text"
            placeholder="Digite o nome fantasia"
            value={dadosEmpresa.nome_fantasia}
            onChange={handleDadosEmpresaChange}
          />
          <InputField
            id="cnpj"
            label="CNPJ/CPF"
            type="text"
            disabled={true}
            placeholder="00.000.000/0000-00"
            value={dadosEmpresa.cnpj_cpf}
          />
          <InputField
            id="inscricao-estadual"
            label="Inscrição Estadual"
            type="text"
            placeholder="Digite a IE"
            value={dadosEmpresa.inscricao_estadual}
            onChange={handleDadosEmpresaChange}
          />
          <InputField
            id="data-abertura"
            label="Data de Abertura"
            type="date"
            placeholder=""
            value={dadosEmpresa.data_abertura}
            onChange={handleDadosEmpresaChange}
          />
        </div>

        <div className="border-t border-[var(--color-border)] pt-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Endereço</h3>
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
