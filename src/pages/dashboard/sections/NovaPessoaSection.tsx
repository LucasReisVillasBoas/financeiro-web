import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiSave, FiUser } from 'react-icons/fi';
import type { CreatePessoaDto, Empresa } from '../../../types/api.types';
import { pessoaService, empresaService } from '../../../services';
import { useAuth } from '../../../context/AuthContext';

interface NovaPessoaSectionProps {
  onNavigate: (section: string, params?: Record<string, any>) => void;
}

export const NovaPessoaSection: React.FC<NovaPessoaSectionProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  const [formData, setFormData] = useState({
    empresaId: '',
    tipo: 'Física' as 'Física' | 'Jurídica',
    nome: '',
    cpf_cnpj: '',
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
  }, []);

  const loadEmpresas = async () => {
    try {
      if (user?.clienteId) {
        const data = await empresaService.findByCliente(user.clienteId);
        setEmpresas(data || []);
        if (data && data.length > 0) {
          setFormData(prev => ({ ...prev, empresaId: data[0].id }));
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

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatCep(value);
    setFormData(prev => ({ ...prev, cep: formatted }));
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
      const payload: CreatePessoaDto = {
        clienteId: user?.clienteId || '',
        // empresaId: formData.empresaId,
        razao_nome: formData.nome,
        nome: formData.nome,
        cpf_cnpj: formData.cpf_cnpj ? formData.cpf_cnpj.replace(/\D/g, '') : '',
        email: formData.email || '',
        telefone: formData.telefone ? formData.telefone.replace(/\D/g, '') : '',
        cep: formData.cep ? formData.cep.replace(/\D/g, '') : '',
        logradouro: formData.logradouro || '',
        numero: formData.numero || '',
        complemento: formData.complemento || '',
        bairro: formData.bairro || '',
        cidade: formData.cidade || '',
        uf: formData.uf || '',
        ativo: formData.ativo,
        criado_por_id: user?.clienteId || '',
        atualizado_por_id: user?.clienteId || '',
        tipo: formData.tipo,
      };

      if (formData.tipo === 'Física' && formData.dataNascimento) {
        payload.aniversario = formData.dataNascimento;
      }

      await pessoaService.create(payload);
      setSuccess(true);
      setTimeout(() => {
        onNavigate('pessoas-listar');
      }, 1500);
    } catch (err: any) {
      console.error('Erro ao cadastrar pessoa:', err);
      setError(err.message || 'Erro ao cadastrar pessoa');
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
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">CEP</label>
              <input
                type="text"
                name="cep"
                value={formData.cep}
                onChange={handleCepChange}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="00000-000"
                maxLength={9}
              />
            </div>

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
