import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputField } from '../../components/InputField';
import { SelectField, ESTADOS_BRASIL } from '../../components/SelectField';
import { CepField } from '../../components/CepField';
import { Alert } from '../../components/Alert';
import { onboardingService, OnboardingEmpresaDto } from '../../services/onboarding.service';
import type { CepData } from '../../services/cep.service';
import { useAuth } from '../../context/AuthContext';

interface FormData {
  // Empresa
  razao_social: string;
  nome_fantasia: string;
  cnpj_cpf: string;
  inscricao_estadual: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  codigo_ibge: string;
  telefone: string;
  celular: string;
  email: string;
  data_abertura: string;
  // Contato
  contato_nome: string;
  contato_funcao: string;
  contato_telefone: string;
  contato_celular: string;
  contato_email: string;
}

export const OnboardingEmpresa: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const topRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<FormData>({
    // Empresa
    razao_social: '',
    nome_fantasia: '',
    cnpj_cpf: '',
    inscricao_estadual: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    codigo_ibge: '',
    telefone: '',
    celular: '',
    email: '',
    data_abertura: '',
    // Contato
    contato_nome: '',
    contato_funcao: '',
    contato_telefone: '',
    contato_celular: '',
    contato_email: '',
  });

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  };

  const formatCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return numbers
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    const keyMap: Record<string, keyof FormData> = {
      'razao-social': 'razao_social',
      'nome-fantasia': 'nome_fantasia',
      cnpj: 'cnpj_cpf',
      'inscricao-estadual': 'inscricao_estadual',
      estado: 'uf',
      ibge: 'codigo_ibge',
      'data-abertura': 'data_abertura',
      'contato-nome': 'contato_nome',
      'contato-funcao': 'contato_funcao',
      'contato-telefone': 'contato_telefone',
      'contato-celular': 'contato_celular',
      'contato-email': 'contato_email',
    };

    const formKey = keyMap[id] || (id as keyof FormData);

    let finalValue = value;

    // Aplicar máscaras
    if (
      id === 'telefone' ||
      id === 'celular' ||
      id === 'contato-telefone' ||
      id === 'contato-celular'
    ) {
      finalValue = formatPhone(value);
    } else if (id === 'cnpj') {
      finalValue = formatCpfCnpj(value);
    }

    setFormData(prev => ({
      ...prev,
      [formKey]: finalValue,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    const keyMap: Record<string, keyof FormData> = {
      estado: 'uf',
    };
    const formKey = keyMap[id] || (id as keyof FormData);
    setFormData(prev => ({
      ...prev,
      [formKey]: value,
    }));
  };

  const handleAddressFound = (data: CepData) => {
    setFormData(prev => ({
      ...prev,
      logradouro: data.logradouro || prev.logradouro,
      bairro: data.bairro || prev.bairro,
      cidade: data.cidade || prev.cidade,
      uf: data.uf || prev.uf,
      codigo_ibge: data.ibge || prev.codigo_ibge,
    }));
  };

  const validateForm = (): boolean => {
    const validationErrors: string[] = [];

    // Validações dos dados da empresa
    if (!formData.razao_social || formData.razao_social.trim().length < 3) {
      validationErrors.push('Razão social deve ter no mínimo 3 caracteres');
    }
    if (!formData.nome_fantasia || formData.nome_fantasia.trim().length < 3) {
      validationErrors.push('Nome fantasia deve ter no mínimo 3 caracteres');
    }
    if (!formData.cnpj_cpf || formData.cnpj_cpf.trim().length === 0) {
      validationErrors.push('CNPJ/CPF é obrigatório');
    }

    // Validações do endereço
    if (!formData.cep || formData.cep.trim().length === 0) {
      validationErrors.push('CEP é obrigatório');
    } else {
      const cepNumbers = formData.cep.replace(/\D/g, '');
      if (cepNumbers.length !== 8) {
        validationErrors.push('CEP deve ter 8 dígitos');
      }
    }
    if (!formData.uf || formData.uf.trim().length === 0) {
      validationErrors.push('Estado é obrigatório');
    }

    // Validações de contato da empresa
    if (!formData.email || formData.email.trim().length === 0) {
      validationErrors.push('E-mail da empresa é obrigatório');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      validationErrors.push('E-mail da empresa deve ser um endereço válido');
    }

    // Validações do contato principal
    if (!formData.contato_nome || formData.contato_nome.trim().length < 3) {
      validationErrors.push('Nome do contato deve ter no mínimo 3 caracteres');
    }
    if (!formData.contato_email || formData.contato_email.trim().length === 0) {
      validationErrors.push('E-mail do contato é obrigatório');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contato_email)) {
      validationErrors.push('E-mail do contato deve ser um endereço válido');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      scrollToTop();
      return false;
    }

    setErrors([]);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setErrors([]);
    setLoading(true);

    // Montar payload para o endpoint unificado
    const payload: OnboardingEmpresaDto = {
      empresa: {
        razao_social: formData.razao_social,
        nome_fantasia: formData.nome_fantasia,
        cnpj_cpf: formData.cnpj_cpf.replace(/\D/g, ''),
        inscricao_estadual: formData.inscricao_estadual || undefined,
        cep: formData.cep.replace(/\D/g, ''),
        logradouro: formData.logradouro || undefined,
        numero: formData.numero || undefined,
        complemento: formData.complemento || undefined,
        bairro: formData.bairro || undefined,
        cidade: formData.cidade || undefined,
        uf: formData.uf,
        codigo_ibge: formData.codigo_ibge || undefined,
        telefone: formData.telefone ? formData.telefone.replace(/\D/g, '') : undefined,
        celular: formData.celular ? formData.celular.replace(/\D/g, '') : undefined,
        email: formData.email,
        data_abertura: formData.data_abertura ? new Date(formData.data_abertura) : undefined,
      },
      perfil: {
        nome: 'Administrador',
        permissoes: {
          usuarios: ['criar', 'editar', 'listar'],
          relatorios: ['criar', 'editar', 'listar'],
          empresas: ['criar', 'editar', 'listar'],
        },
      },
      contato: {
        nome: formData.contato_nome,
        funcao: formData.contato_funcao || undefined,
        telefone: formData.contato_telefone
          ? formData.contato_telefone.replace(/\D/g, '')
          : undefined,
        celular: formData.contato_celular ? formData.contato_celular.replace(/\D/g, '') : undefined,
        email: formData.contato_email,
      },
    };

    try {
      await onboardingService.createEmpresa(payload);
      await logout();
      navigate('/login');
    } catch (err: unknown) {
      console.error('Erro no onboarding:', err);
      const error = err as { details?: { message?: string[] }; message?: string };
      const errorMessages = error.details?.message;
      if (Array.isArray(errorMessages)) {
        setErrors(errorMessages);
      } else {
        setErrors([error.message || 'Erro ao cadastrar empresa']);
      }
      scrollToTop();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-12 px-4">
      <div ref={topRef} className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Bem-vindo!</h1>
          <p className="text-[var(--color-text-secondary)]">
            Vamos começar cadastrando sua empresa
          </p>
        </div>

        {errors.length > 0 && (
          <Alert
            messages={errors}
            variant="error"
            title="Corrija os seguintes erros:"
            className="mb-6"
            onDismiss={() => setErrors([])}
          />
        )}

        <div className="bg-[var(--color-surface)] p-8 rounded-xl shadow-lg border border-[var(--color-border)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Dados da Empresa */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
                Dados da Empresa
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  id="razao-social"
                  label="Razão Social"
                  placeholder="Digite a razão social"
                  required
                  value={formData.razao_social}
                  onChange={handleChange}
                />
                <InputField
                  id="nome-fantasia"
                  label="Nome Fantasia"
                  placeholder="Digite o nome fantasia"
                  required
                  value={formData.nome_fantasia}
                  onChange={handleChange}
                />
                <InputField
                  id="cnpj"
                  label="CNPJ/CPF"
                  placeholder="00.000.000/0000-00"
                  required
                  maxLength={18}
                  value={formData.cnpj_cpf}
                  onChange={handleChange}
                />
                <InputField
                  id="inscricao-estadual"
                  label="Inscrição Estadual"
                  placeholder="Digite a IE (opcional)"
                  value={formData.inscricao_estadual}
                  onChange={handleChange}
                />
                <InputField
                  id="data-abertura"
                  label="Data de Abertura"
                  type="date"
                  placeholder=""
                  value={formData.data_abertura}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
                Endereço
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CepField
                  value={formData.cep}
                  onChange={cep => setFormData(prev => ({ ...prev, cep }))}
                  onAddressFound={handleAddressFound}
                  required
                />
                <InputField
                  id="logradouro"
                  label="Logradouro"
                  placeholder="Rua, Avenida..."
                  value={formData.logradouro}
                  onChange={handleChange}
                />
                <InputField
                  id="numero"
                  label="Número"
                  placeholder="Nº"
                  value={formData.numero}
                  onChange={handleChange}
                />
                <InputField
                  id="complemento"
                  label="Complemento"
                  placeholder="Apto, Sala..."
                  value={formData.complemento}
                  onChange={handleChange}
                />
                <InputField
                  id="bairro"
                  label="Bairro"
                  placeholder="Digite o bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                />
                <InputField
                  id="cidade"
                  label="Cidade"
                  placeholder="Digite a cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                />
                <SelectField
                  id="estado"
                  label="Estado"
                  placeholder="Selecione o estado"
                  required
                  options={ESTADOS_BRASIL}
                  value={formData.uf}
                  onChange={handleSelectChange}
                />
                <InputField
                  id="ibge"
                  label="Código IBGE"
                  placeholder=""
                  value={formData.codigo_ibge}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Contato da Empresa */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
                Contato da Empresa
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField
                  id="telefone"
                  label="Telefone"
                  type="tel"
                  placeholder="(00) 0000-0000"
                  maxLength={14}
                  value={formData.telefone}
                  onChange={handleChange}
                />
                <InputField
                  id="celular"
                  label="Celular"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  value={formData.celular}
                  onChange={handleChange}
                />
                <InputField
                  id="email"
                  label="E-mail"
                  type="email"
                  placeholder="empresa@email.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Contato Principal */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
                Contato Principal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  id="contato-nome"
                  label="Nome"
                  placeholder="Nome do responsável"
                  required
                  value={formData.contato_nome}
                  onChange={handleChange}
                />
                <InputField
                  id="contato-funcao"
                  label="Função"
                  placeholder="Cargo ou função"
                  value={formData.contato_funcao}
                  onChange={handleChange}
                />
                <InputField
                  id="contato-telefone"
                  label="Telefone"
                  type="tel"
                  placeholder="(00) 0000-0000"
                  maxLength={14}
                  value={formData.contato_telefone}
                  onChange={handleChange}
                />
                <InputField
                  id="contato-celular"
                  label="Celular"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  value={formData.contato_celular}
                  onChange={handleChange}
                />
                <InputField
                  id="contato-email"
                  label="E-mail"
                  type="email"
                  placeholder="contato@email.com"
                  required
                  value={formData.contato_email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Botão de Submit */}
            <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Cadastrando...' : 'Cadastrar Empresa'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
