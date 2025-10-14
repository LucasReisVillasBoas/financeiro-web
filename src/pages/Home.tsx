import { useTheme } from "../providers/ThemeProvider";

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">Rsbuild + React + Tailwind ⚡</h1>
      <button
        onClick={toggleTheme}
        className="mt-4 px-4 py-2 rounded bg-primary text-primary-foreground"
      >
        Mudar para {theme === "light" ? "Dark" : "Light"} Mode
      </button>
      <div className="bg-receivable text-white p-4 rounded">Recebimento</div>
      <div className="bg-payable text-white p-4 rounded">Conta a pagar</div>
      <div className="bg-settled text-white p-4 rounded">Quitado</div>
    </div>
  );
}
