import { useState, useEffect } from 'react';
import { FiArrowLeft, FiSave, FiUser } from 'react-icons/fi';
import type { CreatePessoaDto, Empresa } from '../../../types/api.types';
import { TipoPessoa, TipoContribuinte } from '../../../types/api.types';
import { pessoaService, empresaService } from '../../../services';
import { useAuth } from '../../../context/AuthContext';
import { CepField } from '../../../components/CepField';
import type { CepData } from '../../../services/cep.service';

interface NovaPessoaSectionProps {
  onNavigate: (section: string, params?: Record<string, unknown>) => void;
}

export const NovaPessoaSection: React.FC<NovaPessoaSectionProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [filiais, setFiliais] = useState<Empresa[]>([]);

  const [formData, setFormData] = useState({
    empresaId: '',
    filialId: '',
    tipo: 'Física' as 'Física' | 'Jurídica',
    nome: '',
    cpf_cnpj: '',
    ieRg: '',
    im: '',
    tipoContribuinte: '',
    dataNascimento: '',
    email: '',
    telefone: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    ativo: true,
  });

  useEffect(() => {
    loadEmpresas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadEmpresas = async () => {
    try {
      if (user?.clienteId) {
        const data = await empresaService.findByCliente(user.clienteId);
        setEmpresas(data || []);
        if (data && data.length > 0) {
          setFormData(prev => ({ ...prev, empresaId: data[0].id }));
          // Carregar filiais (empresas que não são sede)
          setFiliais(data || []);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar empresas:', err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTipoChange = (novoTipo: 'Física' | 'Jurídica') => {
    setFormData(prev => ({
      ...prev,
      tipo: novoTipo,
      cpf_cnpj: '',
      ieRg: '',
      im: '',
      tipoContribuinte: '',
      dataNascimento: '',
    }));
  };

  const formatCpf = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      return cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value;
  };

  const formatCnpj = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 14) {
      return cleaned
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
    return value;
  };

  const formatCep = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 8) {
      return cleaned.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
    }
    return value;
  };

  const formatTelefone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d{1,4})$/, '$1-$2');
    } else {
      return cleaned
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
        .slice(0, 15);
    }
  };

  const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formData.tipo === 'Física' ? formatCpf(value) : formatCnpj(value);
    setFormData(prev => ({ ...prev, cpf_cnpj: formatted }));
  };

  const _handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setFormData(prev => ({ ...prev, cep: formatted }));
  };

  const handleAddressFound = (data: CepData) => {
    setFormData(prev => ({
      ...prev,
      logradouro: data.logradouro || prev.logradouro,
      bairro: data.bairro || prev.bairro,
      cidade: data.cidade || prev.cidade,
      uf: data.uf || prev.uf,
    }));
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formatted = formatTelefone(value);
    setFormData(prev => ({ ...prev, [name]: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const payload: CreatePessoaDto & { aniversario?: string } = {
        clienteId: user?.clienteId || '',
        tipos: [TipoPessoa.CLIENTE],
        tipo: formData.tipo,
        nome: formData.nome,
        cpf_cnpj: formData.cpf_cnpj ? formData.cpf_cnpj.replace(/\D/g, '') : '',
        ieRg: formData.ieRg || undefined,
        im: formData.im || undefined,
        tipoContribuinte: formData.tipoContribuinte || undefined,
        filialId: formData.filialId || undefined,
        email: formData.email || undefined,
        telefone: formData.telefone ? formData.telefone.replace(/\D/g, '') : undefined,
        cep: formData.cep ? formData.cep.replace(/\D/g, '') : '',
        logradouro: formData.logradouro || '',
        numero: formData.numero || '',
        complemento: formData.complemento || undefined,
        bairro: formData.bairro || '',
        cidade: formData.cidade || '',
        uf: formData.uf || '',
        ativo: formData.ativo,
      };

      if (formData.tipo === 'Física' && formData.dataNascimento) {
        payload.aniversario = formData.dataNascimento;
      }

      await pessoaService.create(payload);
      setSuccess(true);
      setTimeout(() => {
        onNavigate('pessoas-listar');
      }, 1500);
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Erro ao cadastrar pessoa:', err);
      setError(error.message || 'Erro ao cadastrar pessoa');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onNavigate('pessoas-listar');
  };

  const estados = [
    'AC',
    'AL',
    'AP',
    'AM',
    'BA',
    'CE',
    'DF',
    'ES',
    'GO',
    'MA',
    'MT',
    'MS',
    'MG',
    'PA',
    'PB',
    'PR',
    'PE',
    'PI',
    'RJ',
    'RN',
    'RS',
    'RO',
    'RR',
    'SC',
    'SP',
    'SE',
    'TO',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleCancel}
          className="p-2 hover:bg-[var(--color-bg)] rounded-md transition-colors"
        >
          <FiArrowLeft size={24} className="text-[var(--color-text)]" />
        </button>
        <div className="flex items-center gap-3">
          <FiUser size={24} className="text-[var(--color-primary)]" />
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Nova Pessoa</h1>
        </div>
      </div>

      {/* Mensagens */}
      {error && (
        <div className="p-4 bg-red-600 dark:bg-red-700 text-white rounded-md font-medium border border-red-700 dark:border-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-600 dark:bg-green-700 text-white rounded-md font-medium border border-green-700 dark:border-green-800">
          Pessoa cadastrada com sucesso! Redirecionando...
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-[var(--color-surface)] p-6 rounded-md shadow space-y-4">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
            Informações Básicas
          </h2>

          {/* Empresa */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Empresa *
            </label>
            <select
              name="empresaId"
              value={formData.empresaId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="">Selecione uma empresa</option>
              {empresas.map(empresa => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nome_fantasia} - {empresa.cnpj_cpf}
                </option>
              ))}
            </select>
          </div>

          {/* Filial (opcional) */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Filial (opcional)
            </label>
            <select
              name="filialId"
              value={formData.filialId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="">Nenhuma filial</option>
              {filiais.map(filial => (
                <option key={filial.id} value={filial.id}>
                  {filial.nome_fantasia} - {filial.cnpj_cpf}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              Selecione uma filial se esta pessoa pertencer a uma filial específica
            </p>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Tipo de Pessoa *
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleTipoChange('Física')}
                className={`flex-1 px-4 py-3 rounded-md border-2 transition-colors ${
                  formData.tipo === 'Física'
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium'
                    : 'border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)]/50'
                }`}
              >
                Pessoa Física
              </button>
              <button
                type="button"
                onClick={() => handleTipoChange('Jurídica')}
                className={`flex-1 px-4 py-3 rounded-md border-2 transition-colors ${
                  formData.tipo === 'Jurídica'
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium'
                    : 'border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)]/50'
                }`}
              >
                Pessoa Jurídica
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                {formData.tipo === 'Física' ? 'Nome Completo' : 'Razão Social'} *
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                required
                maxLength={60}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder={formData.tipo === 'Física' ? 'Ex: João da Silva' : 'Ex: Empresa LTDA'}
              />
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                Máximo 60 caracteres ({formData.nome.length}/60)
              </p>
            </div>

            {/* CPF/CNPJ */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                {formData.tipo === 'Física' ? 'CPF' : 'CNPJ'}
              </label>
              <input
                type="text"
                name="cpf_cnpj"
                value={formData.cpf_cnpj}
                onChange={handleCpfCnpjChange}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder={formData.tipo === 'Física' ? '000.000.000-00' : '00.000.000/0000-00'}
                maxLength={formData.tipo === 'Física' ? 14 : 18}
              />
            </div>

            {/* Data de Nascimento (apenas para Pessoa Física) */}
            {formData.tipo === 'Física' && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            )}

            {/* IE/RG */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                {formData.tipo === 'Física' ? 'RG' : 'Inscrição Estadual'}
              </label>
              <input
                type="text"
                name="ieRg"
                value={formData.ieRg}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder={formData.tipo === 'Física' ? 'Digite o RG' : 'Digite a IE ou ISENTO'}
              />
            </div>

            {/* IM (apenas para Pessoa Jurídica) */}
            {formData.tipo === 'Jurídica' && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Inscrição Municipal
                </label>
                <input
                  type="text"
                  name="im"
                  value={formData.im}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="Digite a IM ou ISENTO"
                />
              </div>
            )}

            {/* Tipo Contribuinte (apenas para Pessoa Jurídica) */}
            {formData.tipo === 'Jurídica' && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Tipo de Contribuinte (SEFAZ)
                </label>
                <select
                  name="tipoContribuinte"
                  value={formData.tipoContribuinte}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="">Selecione...</option>
                  <option value={TipoContribuinte.CONTRIBUINTE_ICMS}>1 - Contribuinte ICMS</option>
                  <option value={TipoContribuinte.CONTRIBUINTE_ISENTO}>
                    2 - Contribuinte Isento
                  </option>
                  <option value={TipoContribuinte.NAO_CONTRIBUINTE}>9 - Não Contribuinte</option>
                </select>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  Classificação fiscal conforme tabela SEFAZ
                </p>
              </div>
            )}

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Status *
              </label>
              <select
                name="ativo"
                value={formData.ativo ? 'true' : 'false'}
                onChange={e => setFormData(prev => ({ ...prev, ativo: e.target.value === 'true' }))}
                required
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contato */}
        <div className="bg-[var(--color-surface)] p-6 rounded-md shadow space-y-4">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
            Contato
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="exemplo@email.com"
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Telefone
              </label>
              <input
                type="text"
                name="telefone"
                value={formData.telefone}
                onChange={handleTelefoneChange}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="(00) 0000-0000"
                maxLength={15}
              />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="bg-[var(--color-surface)] p-6 rounded-md shadow space-y-4">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
            Endereço
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* CEP */}
            <CepField
              value={formData.cep}
              onChange={cep => setFormData(prev => ({ ...prev, cep }))}
              onAddressFound={handleAddressFound}
            />

            {/* Logradouro */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Logradouro
              </label>
              <input
                type="text"
                name="logradouro"
                value={formData.logradouro}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="Rua, Avenida, etc."
              />
            </div>

            {/* Número */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Número
              </label>
              <input
                type="text"
                name="numero"
                value={formData.numero}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="123"
              />
            </div>

            {/* Complemento */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Complemento
              </label>
              <input
                type="text"
                name="complemento"
                value={formData.complemento}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="Apto, Bloco, etc."
              />
            </div>

            {/* Bairro */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Bairro
              </label>
              <input
                type="text"
                name="bairro"
                value={formData.bairro}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="Centro"
              />
            </div>

            {/* Cidade */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Cidade
              </label>
              <input
                type="text"
                name="cidade"
                value={formData.cidade}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="São Paulo"
              />
            </div>

            {/* UF */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">UF</label>
              <select
                name="uf"
                value={formData.uf}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">Selecione</option>
                {estados.map(estado => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface)] transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvando...
              </>
            ) : (
              <>
                <FiSave size={18} />
                Cadastrar Pessoa
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
