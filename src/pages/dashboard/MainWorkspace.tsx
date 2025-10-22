import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavigationSidebar } from '../../components/workspace/NavigationSidebar';
import { Header } from '../../components/workspace/Header';
import { DashboardSection } from './sections/DashboardSection';
import { EmpresasListSection } from './sections/EmpresasListSection';
import { NovaEmpresaSection } from './sections/NovaEmpresaSection';
import { ContasPagarSection } from './sections/ContasPagarSection';
import { ContasReceberSection } from './sections/ContasReceberSection';
import { UsuariosSection } from './sections/UsuariosSection';
import { useAuth } from '../../context/AuthContext';
import { UsuariosPerfisSection } from './sections/UsuariosPerfisSection';
import { ContatosSection } from './sections/ContatosSection';
import { EditarEmpresaSection } from './sections/EditarEmpresaSection';

const sectionTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  'empresas-listar': 'Listar Empresas',
  'empresas-nova': 'Nova Empresa',
  'empresas-editar': 'Editar Empresa',
  'usuarios-listar': 'Usuários',
  'usuarios-perfis': 'Perfis de Acesso',
  'auxiliares-contatos': 'Contatos',
  'pessoas-listar': 'Listar Pessoas',
  'pessoas-nova': 'Nova Pessoa',
  'financeiro-bancos': 'Contas Bancárias',
  'financeiro-pagar': 'Contas a Pagar',
  'financeiro-receber': 'Contas a Receber',
  'financeiro-movimentacao': 'Movimentação Bancária',
};

export const MainWorkspace: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [sectionParams, setSectionParams] = useState<Record<string, any>>({});
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (activeSection === 'sair') {
      logout();
      navigate('/login');
    }
  }, [activeSection, logout, navigate]);

  const handleNavigate = (section: string, params?: Record<string, any>) => {
    setActiveSection(section);
    if (params) {
      setSectionParams(params);
    } else {
      setSectionParams({});
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection />;
      case 'empresas-listar':
        return <EmpresasListSection onNavigate={handleNavigate} />;
      case 'empresas-nova':
        return <NovaEmpresaSection onNavigate={handleNavigate} />;
      case 'empresas-editar':
        return (
          <EditarEmpresaSection empresaId={sectionParams.empresaId} onNavigate={handleNavigate} />
        );
      case 'financeiro-pagar':
        return <ContasPagarSection />;
      case 'financeiro-receber':
        return <ContasReceberSection />;
      case 'usuarios-listar':
        return <UsuariosSection />;
      case 'usuarios-perfis':
        return <UsuariosPerfisSection />;
      case 'auxiliares-contatos':
        return <ContatosSection />;
      case 'pessoas-listar':
        return (
          <div className="p-6 bg-[var(--color-surface)] rounded-md shadow">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Listar Pessoas</h2>
            <p className="text-[var(--color-text-secondary)] mt-4">
              Seção de listagem de pessoas em desenvolvimento...
            </p>
          </div>
        );
      case 'pessoas-nova':
        return (
          <div className="p-6 bg-[var(--color-surface)] rounded-md shadow">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Nova Pessoa</h2>
            <p className="text-[var(--color-text-secondary)] mt-4">
              Formulário de cadastro de pessoa em desenvolvimento...
            </p>
          </div>
        );
      case 'financeiro-bancos':
        return (
          <div className="p-6 bg-[var(--color-surface)] rounded-md shadow">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Contas Bancárias
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-4">
              Seção de contas bancárias em desenvolvimento...
            </p>
          </div>
        );
      case 'financeiro-movimentacao':
        return (
          <div className="p-6 bg-[var(--color-surface)] rounded-md shadow">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Movimentação Bancária
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-4">
              Seção de movimentação bancária em desenvolvimento...
            </p>
          </div>
        );
      default:
        return (
          <div className="p-6 bg-[var(--color-surface)] rounded-md shadow">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Seção não encontrada
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-4">
              A seção solicitada não foi encontrada.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[var(--color-bg)] dark:bg-[var(--color-bg)]">
      <NavigationSidebar activeItem={activeSection} onItemSelect={setActiveSection} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={sectionTitles[activeSection] || 'Dashboard'} />
        <main className="flex-1 p-6 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  );
};
