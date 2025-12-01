import React from 'react';
import { InputField } from './InputField';

interface AuthFormProps {
  isRegister?: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ isRegister = false, onSubmit }) => {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {isRegister && <InputField id="name" label="Nome completo" placeholder="Seu nome" />}
      <InputField id="email" label="Email" placeholder="seu@email.com" type="email" />
      <InputField id="password" label="Senha" placeholder="********" type="password" />

      <button
        type="submit"
        className="w-full py-2 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold hover:bg-[var(--color-primary-hover)] transition"
      >
        {isRegister ? 'Criar Conta' : 'Entrar'}
      </button>
    </form>
  );
};
