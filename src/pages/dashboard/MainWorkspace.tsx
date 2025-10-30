import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavigationSidebar } from '../../components/workspace/NavigationSidebar';
import { Header } from '../../components/workspace/Header';
import { DashboardSection } from './sections/DashboardSection';
import { EmpresasListSection } from './sections/EmpresasListSection';
import { ContasPagarSection } from './sections/ContasPagarSection';
import { ContasReceberSection } from './sections/ContasReceberSection';
import { UsuariosSection } from './sections/UsuariosSection';
import { useAuth } from '../../context/AuthContext';
import { UsuariosPerfisSection } from './sections/UsuariosPerfisSection';
import { EditarPerfilSection } from './sections/EditarPerfilSection';
import { ContatosSection } from './sections/ContatosSection';
import { NovoContatoSection } from './sections/NovoContatoSection';
import { EditarContatoSection } from './sections/EditarContatoSection';
import { EditarEmpresaSection } from './sections/EditarEmpresaSection';
import { EditarUsuarioSection } from './sections/EditarUsuarioSection';
import { ResetarSenhaUsuarioSection } from './sections/ResetarSenhaUsuarioSection';
import { NovoUsuarioSection } from './sections/NovoUsuarioSection';
import { NovaSedeSection } from './sections/NovaSedeSection';
import { NovaFilialSection } from './sections/NovaFilialSection';
import { ContasBancariasSection } from './sections/ContasBancariasSection';
import { MovimentacoesBancariasSection } from './sections/MovimentacoesBancariasSection';

const sectionTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  'empresas-listar': 'Listar Empresas',
  'empresas-nova': 'Nova Empresa (sede)',
  'empresas-nova-filial': 'Nova Filial',
  'empresas-editar': 'Editar Empresa',
  'usuarios-listar': 'Usuários',
  'usuarios-novo': 'Novo Usuário',
  'usuarios-editar': 'Editar Usuário',
  'usuarios-resetar-senha': 'Resetar Senha',
  'usuarios-perfis': 'Perfis de Acesso',
  'usuarios-perfis-editar': 'Editar Perfil',
  'auxiliares-contatos': 'Contatos',
  'auxiliares-contatos-novo': 'Novo Contato',
  'auxiliares-contatos-editar': 'Editar Contato',
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
        return <NovaSedeSection onNavigate={handleNavigate} />;
      case 'empresas-nova-filial':
        return <NovaFilialSection onNavigate={handleNavigate} />;
      case 'empresas-editar':
        return (
          <EditarEmpresaSection empresaId={sectionParams.empresaId} onNavigate={handleNavigate} />
        );
      case 'financeiro-pagar':
        return <ContasPagarSection />;
      case 'financeiro-receber':
        return <ContasReceberSection />;
      case 'usuarios-listar':
        return <UsuariosSection onNavigate={handleNavigate} />;
      case 'usuarios-novo':
        return <NovoUsuarioSection onNavigate={handleNavigate} />;
      case 'usuarios-editar':
        return (
          <EditarUsuarioSection usuarioId={sectionParams.usuarioId} onNavigate={handleNavigate} />
        );
      case 'usuarios-resetar-senha':
        return (
          <ResetarSenhaUsuarioSection
            usuarioId={sectionParams.usuarioId}
            onNavigate={handleNavigate}
          />
        );
      case 'usuarios-perfis':
        return <UsuariosPerfisSection onNavigate={handleNavigate} />;
      case 'usuarios-perfis-editar':
        return (
          <EditarPerfilSection perfilId={sectionParams.perfilId} onNavigate={handleNavigate} />
        );
      case 'auxiliares-contatos':
        return <ContatosSection onNavigate={handleNavigate} />;
      case 'auxiliares-contatos-novo':
        return <NovoContatoSection onNavigate={handleNavigate} />;
      case 'auxiliares-contatos-editar':
        return (
          <EditarContatoSection contatoId={sectionParams.contatoId} onNavigate={handleNavigate} />
        );
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
        return <ContasBancariasSection />;
      case 'financeiro-movimentacao':
        return <MovimentacoesBancariasSection />;
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
    <div className="flex h-screen bg-[var(--color-bg)]">
      <NavigationSidebar activeItem={activeSection} onItemSelect={setActiveSection} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={sectionTitles[activeSection] || 'Dashboard'} />
        <main className="flex-1 p-6 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  );
};
