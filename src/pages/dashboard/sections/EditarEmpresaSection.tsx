import React, { useEffect, useState } from 'react';
import { InputField } from '../../../components/InputField';
import { SelectField, ESTADOS_BRASIL } from '../../../components/SelectField';
import { CepField } from '../../../components/CepField';
import { empresaService } from '../../../services/empresa.service';
import type { Empresa, Filial, FilialContato } from '../../../types/api.types';
import { useAuth } from '../../../context/AuthContext';
import type { CepData } from '../../../services/cep.service';

interface EditarEmpresaSectionProps {
  empresaId: string;
  tipo?: 'sede' | 'filial';
  sedeId?: string;
  onNavigate: (section: string) => void;
}

export const EditarEmpresaSection: React.FC<EditarEmpresaSectionProps> = ({
  empresaId,
  tipo = 'sede',
  sedeId,
  onNavigate,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [telefone, setTelefone] = useState('');
  const [celular, setCelular] = useState('');
  const [empresaData, setEmpresaData] = useState<Empresa | null>(null);
  const [filialData, setFilialData] = useState<Filial | null>(null);
  const { getClienteId } = useAuth();

  // Estado para campos editáveis
  const [dadosEmpresa, setDadosEmpresa] = useState({
    razao_social: '',
    nome_fantasia: '',
    inscricao_estadual: '',
    inscricao_municipal: '',
    data_abertura: '',
    cnpj_cpf: '',
    email: '',
  });

  // Estado para campos de endereço
  const [endereco, setEndereco] = useState({
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    ibge: '',
  });

  // Estado para contatos (filial)
  const [contatos, setContatos] = useState<FilialContato[]>([]);

  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{0,3})/, '$1-$2').replace(/-$/, '');
  };

  const formatCnpjCpf = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (numbers.length === 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return value;
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

  useEffect(() => {
    const fetchData = async () => {
      if (!empresaId) return;

      try {
        setLoadingData(true);

        if (tipo === 'filial' && sedeId) {
          // Buscar filial
          const filiais = await empresaService.listFiliais(sedeId);
          const filial = filiais.find(f => f.id === empresaId);

          if (filial) {
            setFilialData(filial);

            setDadosEmpresa({
              razao_social: filial.razao_social || '',
              nome_fantasia: filial.nome_fantasia || '',
              inscricao_estadual: filial.inscricao_estadual || '',
              inscricao_municipal: filial.inscricao_municipal || '',
              data_abertura: filial.data_abertura
                ? new Date(filial.data_abertura).toISOString().split('T')[0]
                : '',
              cnpj_cpf: filial.cnpj_cpf ? formatCnpjCpf(filial.cnpj_cpf) : '',
              email: filial.email || '',
            });

            if (filial.telefone) setTelefone(formatPhone(filial.telefone));
            if (filial.celular) setCelular(formatPhone(filial.celular));

            setEndereco({
              cep: filial.cep ? formatCep(filial.cep) : '',
              logradouro: filial.logradouro || '',
              numero: filial.numero || '',
              complemento: filial.complemento || '',
              bairro: filial.bairro || '',
              cidade: filial.cidade || '',
              uf: filial.uf || '',
              ibge: filial.codigo_ibge || '',
            });

            if (filial.contatos) {
              setContatos(filial.contatos);
            }
          }
        } else {
          // Buscar empresa/sede
          const data = await empresaService.findOne(empresaId);
          setEmpresaData(data);

          setDadosEmpresa({
            razao_social: data.razao_social || '',
            nome_fantasia: data.nome_fantasia || '',
            inscricao_estadual: data.inscricao_estadual || '',
            inscricao_municipal: data.inscricao_municipal || '',
            data_abertura: data.data_abertura
              ? new Date(data.data_abertura).toISOString().split('T')[0]
              : '',
            cnpj_cpf: data.cnpj_cpf ? formatCnpjCpf(data.cnpj_cpf) : '',
            email: data.email || '',
          });

          if (data.telefone) setTelefone(formatPhone(data.telefone));
          if (data.celular) setCelular(formatPhone(data.celular));

          setEndereco({
            cep: data.cep ? formatCep(data.cep) : '',
            logradouro: data.logradouro || '',
            numero: data.numero || '',
            complemento: data.complemento || '',
            bairro: data.bairro || '',
            cidade: data.cidade || '',
            uf: data.uf || '',
            ibge: data.codigo_ibge || '',
          });
        }
      } catch {
        setError('Erro ao buscar dados');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [empresaId, tipo, sedeId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const clienteId = getClienteId();
    if (!clienteId) {
      setError('Erro ao obter informações do usuário. Faça login novamente.');
      setLoading(false);
      return;
    }

    if (!empresaId) {
      setError('ID não encontrado.');
      setLoading(false);
      return;
    }

    const dto = {
      cliente_id: clienteId,
      razao_social: dadosEmpresa.razao_social,
      nome_fantasia: dadosEmpresa.nome_fantasia,
      cnpj_cpf: (tipo === 'filial' ? filialData?.cnpj_cpf : empresaData?.cnpj_cpf) || '',
      inscricao_estadual: dadosEmpresa.inscricao_estadual || undefined,
      inscricao_municipal: dadosEmpresa.inscricao_municipal || undefined,
      cep: endereco.cep.replace(/\D/g, '') || undefined,
      logradouro: endereco.logradouro || undefined,
      numero: endereco.numero || undefined,
      complemento: endereco.complemento || undefined,
      bairro: endereco.bairro || undefined,
      cidade: endereco.cidade || undefined,
      uf: endereco.uf || undefined,
      telefone: telefone.replace(/\D/g, '') || undefined,
      celular: celular.replace(/\D/g, '') || undefined,
      email: dadosEmpresa.email || undefined,
      codigo_ibge: endereco.ibge || undefined,
      data_abertura: dadosEmpresa.data_abertura ? new Date(dadosEmpresa.data_abertura) : undefined,
    };

    try {
      if (tipo === 'filial') {
        await empresaService.updateFilial(empresaId, dto);
        setSuccess('Filial atualizada com sucesso!');
      } else {
        await empresaService.update(empresaId, dto);
        setSuccess('Empresa atualizada com sucesso!');
      }

      setTimeout(() => {
        onNavigate('empresas-listar');
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onNavigate('empresas-listar');
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatPhone(e.target.value));
  };

  const handleCelularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCelular(formatPhone(e.target.value));
  };

  const handleDadosEmpresaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const fieldMap: Record<string, string> = {
      'razao-social': 'razao_social',
      'nome-fantasia': 'nome_fantasia',
      'inscricao-estadual': 'inscricao_estadual',
      'inscricao-municipal': 'inscricao_municipal',
      'data-abertura': 'data_abertura',
      'email': 'email',
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

  if (loadingData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-8 text-[var(--color-text-secondary)]">
          Carregando dados...
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

      {/* Badge indicando tipo */}
      <div className="mb-4">
        <span className={`px-3 py-1 rounded text-sm font-medium ${
          tipo === 'sede' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
        }`}>
          Editando {tipo === 'sede' ? 'Sede' : 'Filial'}
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-[var(--color-surface)] p-6 rounded-md shadow"
      >
        {/* Dados Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            id="razao-social"
            label="Razão Social"
            type="text"
            placeholder="Digite a razão social"
            value={dadosEmpresa.razao_social}
            onChange={handleDadosEmpresaChange}
            required
          />
          <InputField
            id="nome-fantasia"
            label="Nome Fantasia"
            type="text"
            placeholder="Digite o nome fantasia"
            value={dadosEmpresa.nome_fantasia}
            onChange={handleDadosEmpresaChange}
            required
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
            id="inscricao-municipal"
            label="Inscrição Municipal"
            type="text"
            placeholder="Digite a IM"
            value={dadosEmpresa.inscricao_municipal}
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

        {/* Endereço */}
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
              value={endereco.numero}
              onChange={handleEnderecoChange}
            />
            <InputField
              id="complemento"
              label="Complemento"
              type="text"
              placeholder="Apto, Sala..."
              value={endereco.complemento}
              onChange={handleEnderecoChange}
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

        {/* Contato da Empresa */}
        <div className="border-t border-[var(--color-border)] pt-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            Contato da {tipo === 'sede' ? 'Empresa' : 'Filial'}
          </h3>
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
              value={dadosEmpresa.email}
              onChange={handleDadosEmpresaChange}
            />
          </div>
        </div>

        {/* Pessoas de Contato (somente filial) */}
        {tipo === 'filial' && contatos.length > 0 && (
          <div className="border-t border-[var(--color-border)] pt-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              Pessoas de Contato
            </h3>
            <div className="space-y-4">
              {contatos.map((contato, index) => (
                <div key={contato.id} className="bg-[var(--color-bg)] p-4 rounded-md">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-[var(--color-text-primary)]">
                      {contato.nome}
                    </span>
                    {contato.funcao && (
                      <span className="px-2 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded text-xs">
                        {contato.funcao}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-[var(--color-text-secondary)]">E-mail:</span>{' '}
                      <span className="text-[var(--color-text)]">{contato.email || 'Não informado'}</span>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-secondary)]">Telefone:</span>{' '}
                      <span className="text-[var(--color-text)]">{contato.telefone || 'Não informado'}</span>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-secondary)]">Celular:</span>{' '}
                      <span className="text-[var(--color-text)]">{contato.celular || 'Não informado'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botões */}
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
