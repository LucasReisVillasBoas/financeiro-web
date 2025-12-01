import React from 'react';
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
  FiLogOut,
  FiGrid,
  FiTrendingUp,
  FiBarChart2,
} from 'react-icons/fi';
import { GiMoneyStack, GiBank } from 'react-icons/gi';
import { MdOutlineDashboard } from 'react-icons/md';
import { RiBuilding4Line } from 'react-icons/ri';
import { useUserEmpresas } from '../../hooks/useUserEmpresas';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <MdOutlineDashboard size={16} />,
  },
  {
    id: 'empresas',
    label: 'Empresas',
    icon: <RiBuilding4Line size={16} />,
    children: [
      {
        id: 'empresas-listar',
        label: 'Listar Empresas',
        icon: <FiList size={14} />,
      },
      {
        id: 'empresas-nova',
        label: 'Nova Empresa',
        icon: <FiPlus size={14} />,
      },
    ],
  },
  {
    id: 'usuarios',
    label: 'Usuarios & Permissões',
    icon: <FiUsers size={16} />,
    children: [
      {
        id: 'usuarios-listar',
        label: 'Usuários',
        icon: <FiUser size={14} />,
      },
      {
        id: 'usuarios-perfis',
        label: 'Perfis',
        icon: <FiShield size={14} />,
      },
    ],
  },
  {
    id: 'auxiliares',
    label: 'Cadastro Auxiliares',
    icon: <FiSettings size={16} />,
    children: [
      {
        id: 'auxiliares-contatos',
        label: 'Contatos',
        icon: <FiUser size={14} />,
      },
    ],
  },
  {
    id: 'pessoas',
    label: 'Pessoas',
    icon: <FiUser size={16} />,
    children: [
      {
        id: 'pessoas-listar',
        label: 'Listar Pessoas',
        icon: <FiUsers size={14} />,
      },
      {
        id: 'pessoas-nova',
        label: 'Nova Pessoa',
        icon: <FiUserPlus size={14} />,
      },
    ],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: <GiMoneyStack size={16} />,
    children: [
      {
        id: 'financeiro-bancos',
        label: 'Contas Bancárias',
        icon: <GiBank size={14} />,
      },
      {
        id: 'financeiro-pagar',
        label: 'Contas a Pagar',
        icon: <FiFileText size={14} />,
      },
      {
        id: 'financeiro-receber',
        label: 'Contas a Receber',
        icon: <FiDollarSign size={14} />,
      },
      {
        id: 'financeiro-movimentacao',
        label: 'Movimentação Bancária',
        icon: <FiRepeat size={14} />,
      },
      {
        id: 'financeiro-plano-contas',
        label: 'Plano de Contas',
        icon: <FiGrid size={14} />,
      },
      {
        id: 'financeiro-dre',
        label: 'DRE',
        icon: <FiTrendingUp size={14} />,
      },
    ],
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    icon: <FiBarChart2 size={16} />,
    children: [
      {
        id: 'relatorios',
        label: 'Relatórios Gerais',
        icon: <FiBarChart2 size={14} />,
      },
      {
        id: 'relatorios-contas-receber',
        label: 'Contas a Receber',
        icon: <FiDollarSign size={14} />,
      },
      {
        id: 'relatorios-contas-pagar',
        label: 'Contas a Pagar',
        icon: <FiFileText size={14} />,
      },
      {
        id: 'relatorios-fluxo-caixa',
        label: 'Fluxo de Caixa',
        icon: <FiTrendingUp size={14} />,
      },
      {
        id: 'relatorios-dre',
        label: 'DRE',
        icon: <FiBarChart2 size={14} />,
      },
      {
        id: 'relatorios-dre-fluxo-comparativo',
        label: 'DRE x Fluxo (Comparativo)',
        icon: <FiBarChart2 size={14} />,
      },
    ],
  },
  {
    id: 'sair',
    label: 'Sair',
    icon: <FiLogOut size={16} />,
  },
];

interface NavigationSidebarProps {
  activeItem: string;
  onItemSelect: (itemId: string) => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeItem,
  onItemSelect,
}) => {
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({});
  const { hasEmpresas, loading } = useUserEmpresas();

  const toggleMenu = (itemId: string) => {
    setOpenMenus(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.children) {
      toggleMenu(item.id);
    } else {
      onItemSelect(item.id);
    }
  };

  const getFilteredMenuItems = () => {
    return menuItems.map(item => {
      if (item.id === 'empresas' && item.children) {
        if (hasEmpresas) {
          return {
            ...item,
            children: item.children.filter(child => child.id !== 'empresas-nova'),
          };
        }
        return {
          ...item,
          children: item.children.filter(child => child.id !== 'empresas-listar'),
        };
      }
      return item;
    });
  };

  const filteredMenuItems = loading ? menuItems : getFilteredMenuItems();

  return (
    <aside className="w-64 h-screen bg-[var(--color-sidebar-bg)] shadow-md flex flex-col">
      <div className="px-6 py-5 border-b border-[var(--color-sidebar-border)]">
        <h1 className="font-semibold text-lg tracking-wide text-gray-100">FinSys</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {filteredMenuItems.map(item => (
          <div key={item.id} className="mb-1">
            <button
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                activeItem === item.id && !item.children
                  ? 'bg-[var(--color-sidebar-active)] text-white'
                  : 'text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-text-hover)]'
              }`}
              onClick={() => handleItemClick(item)}
            >
              <div className="flex items-center gap-3">
                <span
                  className={
                    activeItem === item.id && !item.children
                      ? 'text-white'
                      : 'text-[var(--color-sidebar-icon)]'
                  }
                >
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {item.children && (
                <span
                  className={`transition-transform duration-200 ${
                    openMenus[item.id] ? 'rotate-180' : 'rotate-0'
                  }`}
                >
                  <FiChevronDown size={14} />
                </span>
              )}
            </button>

            {item.children && (
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openMenus[item.id] ? 'max-h-96 mt-1' : 'max-h-0'
                }`}
              >
                <div className="ml-3 pl-3 border-l border-[var(--color-sidebar-border)]">
                  {item.children.map(child => (
                    <button
                      key={child.id}
                      onClick={() => onItemSelect(child.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 mb-0.5 ${
                        activeItem === child.id
                          ? 'bg-[var(--color-sidebar-active)] text-white'
                          : 'text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-sidebar-text-hover)]'
                      }`}
                    >
                      <span
                        className={
                          activeItem === child.id
                            ? 'text-white'
                            : 'text-[var(--color-sidebar-icon)]'
                        }
                      >
                        {child.icon}
                      </span>
                      <span className="text-xs font-medium">{child.label}</span>
                    </button>
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
