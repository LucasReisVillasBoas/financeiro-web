import React from "react";
import { FiDollarSign, FiCalendar, FiCheckCircle } from "react-icons/fi";

export const ContasReceberSection: React.FC = () => {
  const contas = [
    {
      id: 1,
      descricao: "Venda de Serviços",
      valor: 5000,
      vencimento: "2024-02-20",
      status: "Pendente",
      cliente: "Cliente ABC Ltda",
    },
    {
      id: 2,
      descricao: "Consultoria",
      valor: 8500,
      vencimento: "2024-02-15",
      status: "Pendente",
      cliente: "Empresa XYZ",
    },
    {
      id: 3,
      descricao: "Manutenção",
      valor: 2500,
      vencimento: "2024-02-10",
      status: "Recebida",
      cliente: "Indústria 123",
    },
    {
      id: 4,
      descricao: "Licença Software",
      valor: 1200,
      vencimento: "2024-02-25",
      status: "Pendente",
      cliente: "Tech Solutions",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors">
          Nova Receita
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[var(--color-surface)] rounded-md shadow">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">A Receber</span>
            <FiDollarSign className="text-[var(--color-receivable)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--color-receivable)] mt-2">
            R$ 14.700,00
          </p>
        </div>

        <div className="p-4 bg-[var(--color-surface)] rounded-md shadow">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Recebido este mês</span>
            <FiCheckCircle className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-500 mt-2">
            R$ 2.500,00
          </p>
        </div>

        <div className="p-4 bg-[var(--color-surface)] rounded-md shadow">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Previsão próx. 30 dias</span>
            <FiCalendar className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-500 mt-2">
            R$ 14.700,00
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-[var(--color-surface)] rounded-md shadow">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left p-4 text-[var(--color-text-secondary)]">Descrição</th>
              <th className="text-left p-4 text-[var(--color-text-secondary)]">Cliente</th>
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
                <td className="p-4 text-[var(--color-text)]">{conta.cliente}</td>
                <td className="p-4 text-[var(--color-text)]">
                  R$ {conta.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
                <td className="p-4 text-[var(--color-text)]">
                  {new Date(conta.vencimento).toLocaleDateString("pt-BR")}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    conta.status === "Recebida"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                  }`}>
                    {conta.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    {conta.status === "Pendente" && (
                      <button className="px-3 py-1 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded text-sm hover:bg-[var(--color-primary-hover)] transition-colors">
                        Receber
                      </button>
                    )}
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