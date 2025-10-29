import React, { useState } from 'react';
import LoginPage from './LoginPage';
import { InputField } from '../../components/InputField';
import { ToggleLink } from '../../components/ToggleLink';
import { usuarioService } from '../../services/usuario.service';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const nome = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const telefone = (form.elements.namedItem('telefone') as HTMLInputElement)?.value || '';
    const cargo = (form.elements.namedItem('cargo') as HTMLInputElement)?.value || 'Proprietário';

    try {
      const user = await usuarioService.create({
        nome,
        email,
        login: email,
        senha: password,
        telefone,
        cargo,
        ativo: true,
      });
      await login(email, password);

      sessionStorage.setItem('onboarding_clienteId', user.id);
      window.location.href = '/onboarding/empresa';
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (showLogin) return <LoginPage />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="w-full max-w-md p-8 rounded-xl shadow-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
        <h1 className="text-3xl font-bold text-center mb-6">Criar Conta</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100/30 text-red-800 rounded-md text-sm">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleRegister}>
          <InputField id="name" label="Nome completo" placeholder="Seu nome" required />
          <InputField id="email" label="Email" placeholder="seu@email.com" type="email" required />
          <InputField id="telefone" label="Telefone" placeholder="(00) 00000-0000" type="tel" />
          <InputField id="cargo" label="Cargo" placeholder="Ex: Proprietário, Gerente..." />
          <InputField id="password" label="Senha" placeholder="********" type="password" required />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold hover:bg-[var(--color-primary-hover)] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <ToggleLink
          text="Já possui uma conta?"
          actionText="Entrar"
          onClick={() => setShowLogin(true)}
        />
      </div>
    </div>
  );
}
