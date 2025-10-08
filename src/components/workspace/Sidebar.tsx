// src/components/workspace/Sidebar.tsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
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

interface MenuItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <MdOutlineDashboard size={20} />,
  },
  {
    label: "Empresas",
    icon: <RiBuilding4Line size={20} />,
    children: [
      {
        label: "Listar Empresas",
        path: "/dashboard/empresas/listar",
        icon: <FiList size={16} />,
      },
      {
        label: "Nova Empresa",
        path: "/dashboard/empresas/nova",
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
    label: "Usuarios & Permissões",
    icon: <FiUsers size={20} />,
    children: [
      {
        label: "Usuários",
        path: "/dashboard/usuarios",
        icon: <FiUser size={16} />,
      },
      {
        label: "Perfis",
        path: "/dashboard/perfis",
        icon: <FiShield size={16} />,
      },
    ],
  },
  {
    label: "Cadastro Auxiliares",
    icon: <FiSettings size={20} />,
    children: [
      {
        label: "Contatos",
        path: "/dashboard/contatos",
        icon: <FiUser size={16} />,
      },
    ],
  },
  {
    label: "Pessoas",
    icon: <FiUser size={20} />,
    children: [
      {
        label: "Listar Pessoas",
        path: "/dashboard/pessoas/listar",
        icon: <FiUsers size={16} />,
      },
      {
        label: "Nova Pessoa",
        path: "/dashboard/pessoas/nova",
        icon: <FiUserPlus size={16} />,
      },
    ],
  },
  {
    label: "Financeiro",
    icon: <GiMoneyStack size={20} />,
    children: [
      {
        label: "Contas Bancárias",
        path: "/dashboard/financeiro/bancos",
        icon: <GiBank size={16} />,
      },
      {
        label: "Contas a Pagar",
        path: "/dashboard/financeiro/pagar",
        icon: <FiFileText size={16} />,
      },
      {
        label: "Contas a Receber",
        path: "/dashboard/financeiro/receber",
        icon: <FiDollarSign size={16} />,
      },
      {
        label: "Movimentação Bancária",
        path: "/dashboard/financeiro/movimentacao",
        icon: <FiRepeat size={16} />,
      },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className="w-64 h-screen bg-[var(--color-surface)] dark:bg-[var(--color-bg)] shadow-md flex flex-col">
      <div className="p-6 font-bold text-xl text-[var(--color-text-primary)]">
        FinSys
      </div>

      <nav className="flex flex-col">
        {menuItems.map((item) => (
          <div key={item.label} className="relative">
            {/* Item Pai */}
            <button
              className={`w-full flex items-center justify-between gap-3 px-4 py-4 rounded-md text-[var(--color-text)] hover:bg-[var(--color-primary-hover)] border-b border-b-[var(--color-border)] transition-colors duration-200`}
              onClick={() => item.children && toggleMenu(item.label)}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.children && (
                <span
                  className={`transition-transform duration-300 ${openMenus[item.label] ? "rotate-180" : "rotate-0"}`}
                >
                  <FiChevronDown size={18} />
                </span>
              )}
            </button>

            {/* Subitens */}
            {item.children && (
              <div
                className={`flex flex-col ml-6 overflow-hidden transition-all duration-300 ${
                  openMenus[item.label] ? "max-h-96 mt-1" : "max-h-0"
                }`}
              >
                {item.children.map((child) => (
                  <NavLink
                    key={child.label}
                    to={child.path || "#"}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-md text-[var(--color-text)] bg-[var(--color-surface)] dark:bg-[var(--color-surface)] hover:bg-[var(--color-bg)] hover:text-[var(--color-primary)] transition-colors duration-200 ${
                        isActive
                          ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                          : ""
                      }`
                    }
                  >
                    {child.icon}
                    <span>{child.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};
