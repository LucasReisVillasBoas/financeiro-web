import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { InputField } from '../../components/InputField';
import { empresaService } from '../../services/empresa.service';
import type { CreateEmpresaDto } from '../../types/api.types';
import { usuarioService } from '../../services/usuario.service';
import { perfilService } from '../../services/perfil.service';
import { contatoService } from '../../services/contato.service';
import { cidadeService } from '../../services/cidade.service';

type EmpresaFormData = Omit<CreateEmpresaDto, 'cliente_id'>;

export const OnboardingEmpresa: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState<EmpresaFormData>({
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
    telefone: '',
    celular: '',
    email: '',
    codigo_ibge: '',
    data_abertura: undefined,
  });

  const [bacen, setBacen] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    const keyMap: Record<string, keyof EmpresaFormData> = {
      'razao-social': 'razao_social',
      'nome-fantasia': 'nome_fantasia',
      cnpj: 'cnpj_cpf',
      'inscricao-estadual': 'inscricao_estadual',
      estado: 'uf',
      ibge: 'codigo_ibge',
      'data-abertura': 'data_abertura',
    };

    const dtoKey = keyMap[id] || (id as keyof EmpresaFormData);

    setFormData(prev => ({
      ...prev,
      [dtoKey]: value,
    }));
  };

  const handleBacenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBacen(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const clienteId =
      sessionStorage.getItem('onboarding_clienteId') ||
      (location.state as { clienteId?: string })?.clienteId;

    if (!clienteId) {
      setError('Erro ao obter informações do usuário. Faça login novamente.');
      setLoading(false);
      return;
    }

    const dto: CreateEmpresaDto = {
      cliente_id: clienteId,
      ...formData,
    };

    try {
      const empresa = await empresaService.create(dto);
      await perfilService.create({
        clienteId: clienteId,
        nome: 'Administrador',
        permissoes: {
          usuarios: ['criar', 'editar', 'listar'],
          relatorios: ['criar', 'editar', 'listar'],
          empresas: ['criar', 'editar', 'listar'],
        },
      });
      await contatoService.create({
        clienteId: clienteId,
        filialId: empresa.id,
        funcao: 'Contato Principal',
        celular: dto.celular || '',
        nome: dto.nome_fantasia,
        email: dto.email || '',
        telefone: dto.telefone || '',
      });
      await cidadeService.create({
        clienteId: clienteId,
        filialId: empresa.id,
        codigoIbge: formData.codigo_ibge || '',
        uf: dto.uf || '',
        pais: 'Brasil',
        nome: dto.cidade || '',
        codigoBacen: bacen || '',
      });
      await usuarioService.associarEmpresaFilial(clienteId, {
        empresaId: empresa.id,
      });
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Erro no onboarding:', err);
      setError(err.message || 'Erro ao cadastrar empresa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            Bem-vindo! 🎉
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Vamos começar cadastrando sua empresa
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            <div
              className={`h-2 w-16 rounded ${step >= 1 ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}
            />
            <div
              className={`h-2 w-16 rounded ${step >= 2 ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}
            />
            <div
              className={`h-2 w-16 rounded ${step >= 3 ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}
            />
          </div>
          <p className="text-center text-sm text-[var(--color-text-secondary)] mt-2">
            Passo {step} de 3
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-[var(--color-surface)] p-8 rounded-xl shadow-lg border border-[var(--color-border)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
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
                    value={formData.data_abertura ? new Date(formData.data_abertura).toISOString().split('T')[0] : ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Endereço</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    id="cep"
                    label="CEP"
                    placeholder="00000-000"
                    value={formData.cep}
                    onChange={handleChange}
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
                  <InputField
                    id="estado"
                    label="Estado"
                    placeholder="UF"
                    value={formData.uf}
                    onChange={handleChange}
                  />

                  <InputField
                    id="ibge"
                    label="Código IBGE"
                    placeholder=""
                    value={formData.codigo_ibge}
                    onChange={handleChange}
                  />

                  <InputField
                    id="codigo-bacen"
                    label="Código BACEN"
                    placeholder=""
                    value={bacen}
                    onChange={handleBacenChange}
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-md hover:bg-[var(--color-bg)] transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-6 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Contato</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    id="telefone"
                    label="Telefone"
                    type="tel"
                    placeholder="(00) 0000-0000"
                    value={formData.telefone}
                    onChange={handleChange}
                  />
                  <InputField
                    id="celular"
                    label="Celular"
                    type="tel"
                    placeholder="(00) 0000-0000"
                    value={formData.celular}
                    onChange={handleChange}
                  />
                  <InputField
                    id="email"
                    label="E-mail"
                    type="email"
                    placeholder="empresa@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-md hover:bg-[var(--color-bg)] transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Cadastrando...' : 'Finalizar'}
                  </button>
                </div>
              </div>
            )}
          </form>

          {step === 3 && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] underline"
              >
                Pular por enquanto
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
