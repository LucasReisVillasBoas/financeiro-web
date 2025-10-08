
📌 PROMPT.md — Estrutura do Projeto
🎯 Objetivo

Criar um frontend leve, moderno e ágil utilizando React + Rspack + TailwindCSS + shadcn/ui, com suporte a temas dinâmicos (dark/light) e possibilidade de trocar toda a identidade visual a partir de um único arquivo.

📂 Estrutura de Pastas
src/
 ├─ pages/          # Páginas da aplicação (rotas principais)
 │   └─ Home.tsx    # Exemplo de página inicial
 │
 ├─ providers/      # Providers globais (Theme, QueryClient, etc.)
 │   └─ ThemeProvider.tsx
 │
 ├─ theme/          # Sistema de temas centralizado
 │   ├─ index.ts    # Exporta o tema padrão
 │   └─ tokens.ts   # Definição de cores, espaçamentos e variáveis globais
 │
 ├─ components/     # Componentes compartilhados e UI custom
 │   └─ ui/         # Sobrescritas ou extensões do shadcn/ui
 │
 ├─ hooks/          # Hooks customizados
 │
 ├─ lib/            # Configurações, libs e utils
 │
 ├─ styles/         # Estilos globais
 │   └─ globals.css # Tailwind base + resets
 │
 └─ main.tsx        # Ponto de entrada da aplicação

🎨 Tema e Dark Mode

Toda a identidade visual fica em src/theme/tokens.ts.

Alterar variáveis nesse arquivo altera o sistema inteiro.

ThemeProvider controla dark/light mode via classe dark do Tailwind.

Possível adicionar novos temas facilmente.

Exemplo (tokens.ts):

export const tokens = {
  colors: {
    primary: "#2563eb", // azul padrão
    secondary: "#9333ea",
    background: "#ffffff",
    backgroundDark: "#0f172a",
  },
  radius: {
    default: "0.5rem",
    full: "9999px",
  },
};

🚀 Padrões de Desenvolvimento

Pages: representações de rotas (usando react-router-dom futuramente).

Components: blocos reutilizáveis (botões, inputs, cards).

Providers: contexto global da aplicação.

Theme: camada isolada para customização de design.

Hooks: lógica compartilhada.

Lib: integrações externas e utilitários.

✅ Roadmap Futuro

Adicionar react-router-dom → navegação entre páginas.

Adicionar tanstack/react-query → gerenciamento de dados e cache.

Expandir theme/tokens.ts → cores semânticas (success, error, warning).

Configurar aliases de import (@/pages, @/components, etc.).

👉 Esse documento deve ser seguido como guia base de arquitetura.
O foco é agilidade, facilidade de layout e customização rápida.