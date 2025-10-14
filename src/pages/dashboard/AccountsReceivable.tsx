export default function AccountsReceivable() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="p-4 bg-[var(--color-surface)] rounded-md shadow">
        Total Recebível:{" "}
        <span className="font-bold text-[var(--color-receivable)]">
          R$ 50.000
        </span>
      </div>
      <div className="p-4 bg-[var(--color-surface)] rounded-md shadow">
        Total a Pagar:{" "}
        <span className="font-bold text-[var(--color-payable)]">R$ 20.000</span>
      </div>
      <div className="p-4 bg-[var(--color-surface)] rounded-md shadow">
        Contas Quitadas:{" "}
        <span className="font-bold text-[var(--color-settled)]">
          R$ 100.000
        </span>
      </div>
    </div>
  );
}
