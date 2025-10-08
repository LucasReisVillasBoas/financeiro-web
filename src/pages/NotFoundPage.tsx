import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg)] text-[var(--color-text)] px-4">
      {/* SVG Ilustrativo */}
      <div className="max-w-md w-full mb-8">
        <svg
          className="w-full h-64 mx-auto"
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="256" cy="256" r="256" fill="var(--color-surface)" />
          <path
            d="M256 128C216.65 128 184 160.65 184 200C184 239.35 216.65 272 256 272C295.35 272 328 239.35 328 200C328 160.65 295.35 128 256 128ZM256 304C208.65 304 128 336 128 384V416H384V384C384 336 303.35 304 256 304Z"
            fill="var(--color-primary)"
          />
        </svg>
      </div>

      {/* Mensagem principal */}
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center">
        404
      </h1>
      <p className="text-lg md:text-xl text-center text-[var(--color-text-secondary)] mb-6">
        Ops! A página que você está procurando não foi encontrada.
      </p>

      {/* Botão de ação */}
      <button
        onClick={() => navigate("/dashboard")}
        className="px-6 py-3 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold rounded-md shadow-md hover:bg-[var(--color-primary-hover)] transition"
      >
        Voltar ao Dashboard
      </button>

      {/* Links secundários */}
      <div className="mt-6 flex flex-col md:flex-row gap-4 text-sm text-[var(--color-text-secondary)]">
        <button
          onClick={() => navigate("/login")}
          className="hover:underline text-[var(--color-link)]"
        >
          Página de Login
        </button>
        <button
          onClick={() => navigate("/register")}
          className="hover:underline text-[var(--color-link)]"
        >
          Criar Conta
        </button>
      </div>
    </div>
  );
}
