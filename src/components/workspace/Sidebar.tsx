// src/components/workspace/Sidebar.tsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiUsers,
  FiShield,
  FiSettings,
  FiUser,
  FiUserPlus,
  FiDollarSign,
  FiFileText,
  FiRepeat,
  FiPlus,
  FiList,
  FiChevronDown,
} from 'react-icons/fi';
import { GiMoneyStack, GiBank } from 'react-icons/gi';
import { MdOutlineDashboard } from 'react-icons/md';
import { RiBuilding4Line } from 'react-icons/ri';
import { useUserEmpresas } from '../../hooks/useUserEmpresas';

interface MenuItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <MdOutlineDashboard size={16} />,
  },
  {
    label: 'Empresas',
    icon: <RiBuilding4Line size={16} />,
    children: [
      {
        label: 'Listar Empresas',
        path: '/dashboard/empresas/listar',
        icon: <FiList size={14} />,
      },
      {
        label: 'Nova Empresa',
        path: '/dashboard/empresas/nova',
        icon: <FiPlus size={14} />,
      },
    ],
  },
  {
    label: 'Usuarios & Permissões',
    icon: <FiUsers size={16} />,
    children: [
      {
        label: 'Usuários',
        path: '/dashboard/usuarios',
        icon: <FiUser size={14} />,
      },
      {
        label: 'Perfis',
        path: '/dashboard/perfis',
        icon: <FiShield size={14} />,
      },
    ],
  },
  {
    label: 'Cadastro Auxiliares',
    icon: <FiSettings size={16} />,
    children: [
      {
        label: 'Contatos',
        path: '/dashboard/contatos',
        icon: <FiUser size={14} />,
      },
    ],
  },
  {
    label: 'Pessoas',
    icon: <FiUser size={16} />,
    children: [
      {
        label: 'Listar Pessoas',
        path: '/dashboard/pessoas/listar',
        icon: <FiUsers size={14} />,
      },
      {
        label: 'Nova Pessoa',
        path: '/dashboard/pessoas/nova',
        icon: <FiUserPlus size={14} />,
      },
    ],
  },
  {
    label: 'Financeiro',
    icon: <GiMoneyStack size={16} />,
    children: [
      {
        label: 'Contas Bancárias',
        path: '/dashboard/financeiro/bancos',
        icon: <GiBank size={14} />,
      },
      {
        label: 'Contas a Pagar',
        path: '/dashboard/financeiro/pagar',
        icon: <FiFileText size={14} />,
      },
      {
        label: 'Contas a Receber',
        path: '/dashboard/financeiro/receber',
        icon: <FiDollarSign size={14} />,
      },
      {
        label: 'Movimentação Bancária',
        path: '/dashboard/financeiro/movimentacao',
        icon: <FiRepeat size={14} />,
      },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const { hasEmpresas, loading } = useUserEmpresas();

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const getFilteredMenuItems = () => {
    return menuItems.map(item => {
      if (item.label === 'Empresas' && item.children) {
        if (hasEmpresas) {
          return {
            ...item,
            children: item.children.filter(child => child.label !== 'Nova Empresa'),
          };
        }
        return {
          ...item,
          children: item.children.filter(child => child.label !== 'Listar Empresas'),
        };
      }
      return item;
    });
  };

  const filteredMenuItems = loading ? menuItems : getFilteredMenuItems();

  return (
    <aside className="w-64 h-screen bg-[var(--color-sidebar-bg)] shadow-md flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[var(--color-sidebar-border)]">
        <h1 className="font-semibold text-lg tracking-wide text-gray-100">FinSys</h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {filteredMenuItems.map(item => (
          <div key={item.label} className="mb-1">
            {/* Item Pai */}
            {item.path ? (
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 no-underline ${
                    isActive
                      ? 'bg-[var(--color-sidebar-active)] text-white'
                      : 'text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-text-hover)]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? 'text-white' : 'text-[var(--color-sidebar-icon)]'}>
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            ) : (
              <button
                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 border-none bg-transparent cursor-pointer text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-text-hover)]"
                onClick={() => item.children && toggleMenu(item.label)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[var(--color-sidebar-icon)]">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {item.children && (
                  <FiChevronDown
                    size={14}
                    className={`text-[var(--color-sidebar-icon)] transition-transform duration-200 ${
                      openMenus[item.label] ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                )}
              </button>
            )}

            {/* Subitens */}
            {item.children && (
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openMenus[item.label] ? 'max-h-96 mt-1' : 'max-h-0'
                }`}
              >
                <div className="ml-3 pl-3 border-l border-[var(--color-sidebar-border)]">
                  {item.children.map(child => (
                    <NavLink
                      key={child.label}
                      to={child.path || '#'}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 no-underline mb-0.5 ${
                          isActive
                            ? 'bg-[var(--color-sidebar-active)] text-white'
                            : 'text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-text-hover)]'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={isActive ? 'text-white' : 'text-[var(--color-sidebar-icon)]'}
                          >
                            {child.icon}
                          </span>
                          <span className="text-xs font-medium">{child.label}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};
