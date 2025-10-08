import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputField } from "../../components/InputField";
import { empresaService } from "../../services/empresa.service";
import { CreateEmpresaDto } from "../../types/api.types";
import { useAuth } from "../../context/AuthContext";

export const OnboardingEmpresa: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { getClienteId } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const clienteId = getClienteId();
    if (!clienteId) {
      setError("Erro ao obter informações do usuário. Faça login novamente.");
      setLoading(false);
      return;
    }

    const dto: CreateEmpresaDto = {
      cliente_id: clienteId,
      razao_social: formData.get("razao-social") as string,
      nome_fantasia: formData.get("nome-fantasia") as string,
      cnpj_cpf: formData.get("cnpj") as string,
      inscricao_estadual: formData.get("inscricao-estadual") as string,
      cep: formData.get("cep") as string,
      logradouro: formData.get("logradouro") as string,
      numero: formData.get("numero") as string,
      complemento: formData.get("complemento") as string,
      bairro: formData.get("bairro") as string,
      cidade: formData.get("cidade") as string,
      uf: formData.get("estado") as string,
      telefone: formData.get("telefone") as string,
      email: formData.get("email") as string,
    };

    try {
      await empresaService.create(dto);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Erro ao cadastrar empresa");
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

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            <div className={`h-2 w-16 rounded ${step >= 1 ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`} />
            <div className={`h-2 w-16 rounded ${step >= 2 ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`} />
            <div className={`h-2 w-16 rounded ${step >= 3 ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`} />
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
            {/* Passo 1: Dados da Empresa */}
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
                  />
                  <InputField
                    id="nome-fantasia"
                    label="Nome Fantasia"
                    placeholder="Digite o nome fantasia"
                    required
                  />
                  <InputField
                    id="cnpj"
                    label="CNPJ/CPF"
                    placeholder="00.000.000/0000-00"
                    required
                  />
                  <InputField
                    id="inscricao-estadual"
                    label="Inscrição Estadual"
                    placeholder="Digite a IE (opcional)"
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

            {/* Passo 2: Endereço */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                  Endereço
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    id="cep"
                    label="CEP"
                    placeholder="00000-000"
                  />
                  <InputField
                    id="logradouro"
                    label="Logradouro"
                    placeholder="Rua, Avenida..."
                  />
                  <InputField
                    id="numero"
                    label="Número"
                    placeholder="Nº"
                  />
                  <InputField
                    id="complemento"
                    label="Complemento"
                    placeholder="Apto, Sala..."
                  />
                  <InputField
                    id="bairro"
                    label="Bairro"
                    placeholder="Digite o bairro"
                  />
                  <InputField
                    id="cidade"
                    label="Cidade"
                    placeholder="Digite a cidade"
                  />
                  <InputField
                    id="estado"
                    label="Estado"
                    placeholder="UF"
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

            {/* Passo 3: Contato */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                  Contato
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    id="telefone"
                    label="Telefone"
                    type="tel"
                    placeholder="(00) 0000-0000"
                  />
                  <InputField
                    id="email"
                    label="E-mail"
                    type="email"
                    placeholder="empresa@email.com"
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
                    {loading ? "Cadastrando..." : "Finalizar"}
                  </button>
                </div>
              </div>
            )}
          </form>

          {step === 3 && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
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
