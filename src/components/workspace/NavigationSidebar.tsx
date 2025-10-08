import React from "react";
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
} from "react-icons/fi";
import { GiMoneyStack, GiBank } from "react-icons/gi";
import { MdOutlineDashboard } from "react-icons/md";
import { RiBuilding4Line } from "react-icons/ri";

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <MdOutlineDashboard size={20} />,
  },
  {
    id: "empresas",
    label: "Empresas",
    icon: <RiBuilding4Line size={20} />,
    children: [
      {
        id: "empresas-listar",
        label: "Listar Empresas",
        icon: <FiList size={16} />,
      },
      {
        id: "empresas-nova",
        label: "Nova Empresa",
        icon: (
          <FiPlus
            size={16}
            className="bg-red-500 text-white rounded-full p-1"
          />
        ),
      },
    ],
  },
  {
    id: "usuarios",
    label: "Usuarios & Permissões",
    icon: <FiUsers size={20} />,
    children: [
      {
        id: "usuarios-listar",
        label: "Usuários",
        icon: <FiUser size={16} />,
      },
      {
        id: "usuarios-perfis",
        label: "Perfis",
        icon: <FiShield size={16} />,
      },
    ],
  },
  {
    id: "auxiliares",
    label: "Cadastro Auxiliares",
    icon: <FiSettings size={20} />,
    children: [
      {
        id: "auxiliares-contatos",
        label: "Contatos",
        icon: <FiUser size={16} />,
      },
    ],
  },
  {
    id: "pessoas",
    label: "Pessoas",
    icon: <FiUser size={20} />,
    children: [
      {
        id: "pessoas-listar",
        label: "Listar Pessoas",
        icon: <FiUsers size={16} />,
      },
      {
        id: "pessoas-nova",
        label: "Nova Pessoa",
        icon: <FiUserPlus size={16} />,
      },
    ],
  },
  {
    id: "financeiro",
    label: "Financeiro",
    icon: <GiMoneyStack size={20} />,
    children: [
      {
        id: "financeiro-bancos",
        label: "Contas Bancárias",
        icon: <GiBank size={16} />,
      },
      {
        id: "financeiro-pagar",
        label: "Contas a Pagar",
        icon: <FiFileText size={16} />,
      },
      {
        id: "financeiro-receber",
        label: "Contas a Receber",
        icon: <FiDollarSign size={16} />,
      },
      {
        id: "financeiro-movimentacao",
        label: "Movimentação Bancária",
        icon: <FiRepeat size={16} />,
      },
    ],
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

  const toggleMenu = (itemId: string) => {
    setOpenMenus((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.children) {
      toggleMenu(item.id);
    } else {
      onItemSelect(item.id);
    }
  };

  return (
    <aside className="w-64 h-screen bg-[var(--color-surface)] dark:bg-[var(--color-bg)] shadow-md flex flex-col">
      <div className="p-6 font-bold text-xl text-[var(--color-text-primary)]">
        FinSys
      </div>

      <nav className="flex flex-col">
        {menuItems.map((item) => (
          <div key={item.id} className="relative">
            <button
              className={`w-full flex items-center justify-between gap-3 px-4 py-4 rounded-md text-[var(--color-text)] hover:bg-[var(--color-primary-hover)] border-b border-b-[var(--color-border)] transition-colors duration-200 ${
                activeItem === item.id && !item.children
                  ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                  : ""
              }`}
              onClick={() => handleItemClick(item)}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.children && (
                <span
                  className={`transition-transform duration-300 ${
                    openMenus[item.id] ? "rotate-180" : "rotate-0"
                  }`}
                >
                  <FiChevronDown size={18} />
                </span>
              )}
            </button>

            {item.children && (
              <div
                className={`flex flex-col ml-6 overflow-hidden transition-all duration-300 ${
                  openMenus[item.id] ? "max-h-96 mt-1" : "max-h-0"
                }`}
              >
                {item.children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => onItemSelect(child.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-[var(--color-text)] bg-[var(--color-surface)] dark:bg-[var(--color-surface)] hover:bg-[var(--color-bg)] hover:text-[var(--color-primary)] transition-colors duration-200 ${
                      activeItem === child.id
                        ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                        : ""
                    }`}
                  >
                    {child.icon}
                    <span>{child.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};