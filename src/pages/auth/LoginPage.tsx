import React, { useState } from 'react';
import { AuthForm } from '../../components/AuthForm';
import { ToggleLink } from '../../components/ToggleLink';
import RegisterPage from './RegisterPage';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [showRegister, setShowRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  if (showRegister) return <RegisterPage />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="w-full max-w-md p-8 rounded-xl shadow-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
        <h1 className="text-3xl font-bold text-center mb-6">Entrar</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100/30 text-red-800 rounded-md text-sm">{error}</div>
        )}
        <AuthForm onSubmit={handleLogin} />
        {loading && (
          <div className="text-center mt-4 text-sm text-[var(--color-text-secondary)]">
            Carregando...
          </div>
        )}
        <ToggleLink
          text="Não tem uma conta?"
          actionText="Criar Conta"
          onClick={() => setShowRegister(true)}
        />
      </div>
    </div>
  );
}
