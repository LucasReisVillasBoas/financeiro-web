import React from "react";
import { FiDollarSign, FiCalendar, FiAlertCircle } from "react-icons/fi";

export const ContasPagarSection: React.FC = () => {
  const contas = [
    {
      id: 1,
      descricao: "Aluguel",
      valor: 3500,
      vencimento: "2024-02-10",
      status: "Pendente",
      fornecedor: "Imobiliária ABC",
    },
    {
      id: 2,
      descricao: "Energia Elétrica",
      valor: 890.50,
      vencimento: "2024-02-15",
      status: "Pendente",
      fornecedor: "Companhia de Energia",
    },
    {
      id: 3,
      descricao: "Internet",
      valor: 199.90,
      vencimento: "2024-02-05",
      status: "Vencida",
      fornecedor: "Provedor XYZ",
    },
    {
      id: 4,
      descricao: "Material de Escritório",
      valor: 450,
      vencimento: "2024-01-30",
      status: "Paga",
      fornecedor: "Papelaria Central",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Contas a Pagar
        </h2>
        <button className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors">
          Nova Conta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[var(--color-surface)] rounded-md shadow">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Total Pendente</span>
            <FiDollarSign className="text-[var(--color-payable)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--color-payable)] mt-2">
            R$ 4.589,40
          </p>
        </div>

        <div className="p-4 bg-[var(--color-surface)] rounded-md shadow">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Vencidas</span>
            <FiAlertCircle className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-500 mt-2">
            R$ 199,90
          </p>
        </div>

        <div className="p-4 bg-[var(--color-surface)] rounded-md shadow">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Pagas este mês</span>
            <FiCalendar className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-500 mt-2">
            R$ 450,00
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-[var(--color-surface)] rounded-md shadow">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left p-4 text-[var(--color-text-secondary)]">Descrição</th>
              <th className="text-left p-4 text-[var(--color-text-secondary)]">Fornecedor</th>
              <th className="text-left p-4 text-[var(--color-text-secondary)]">Valor</th>
              <th className="text-left p-4 text-[var(--color-text-secondary)]">Vencimento</th>
              <th className="text-left p-4 text-[var(--color-text-secondary)]">Status</th>
              <th className="text-center p-4 text-[var(--color-text-secondary)]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {contas.map((conta) => (
              <tr key={conta.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg)]">
                <td className="p-4 text-[var(--color-text)]">{conta.descricao}</td>
                <td className="p-4 text-[var(--color-text)]">{conta.fornecedor}</td>
                <td className="p-4 text-[var(--color-text)]">
                  R$ {conta.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
                <td className="p-4 text-[var(--color-text)]">
                  {new Date(conta.vencimento).toLocaleDateString("pt-BR")}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    conta.status === "Paga"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : conta.status === "Vencida"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                  }`}>
                    {conta.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button className="px-3 py-1 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded text-sm hover:bg-[var(--color-primary-hover)] transition-colors">
                      Pagar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};