# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Financial management web application (FinSys) built with React 19, TypeScript, and Rsbuild. Provides multi-company (sede/filial) management with role-based access control, accounts payable/receivable, bank reconciliation, chart of accounts, DRE reports, and cash flow analysis. The UI language is **Brazilian Portuguese**.

## Development Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Dev server (port 3003, opens browser)
pnpm build            # Production build
pnpm lint             # ESLint with auto-fix
pnpm check:lint       # ESLint check only
pnpm format           # Prettier with auto-write
pnpm check:format     # Prettier check only

# Tests (Vitest + jsdom + MSW)
pnpm test             # Interactive watch mode
pnpm test:run         # Single run (CI)
pnpm test:run -- src/tests/services/api.service.test.ts  # Run single test file
pnpm test:coverage    # Coverage report (70% threshold)
```

## Architecture

### Single-Page Workspace (no client-side routing for dashboard)

After authentication, the entire app lives inside `MainWorkspace` (`src/pages/dashboard/MainWorkspace.tsx`). Navigation between sections is managed by **internal state** (`activeSection` string + `sectionParams` object), NOT by URL routes. The only real routes are:

- `/login`, `/register` — public
- `/onboarding/empresa` — first-time company setup
- `/dashboard` — the workspace (guarded by `RequiresEmpresaRoute`)

**Navigation flow:** `NavigationSidebar` calls `onItemSelect(sectionId)` → `MainWorkspace` sets `activeSection` → `renderContent()` switch renders the section component.

### Section Components

All sections live in `src/pages/dashboard/sections/`. Each receives an `onNavigate` callback:

```typescript
interface SectionProps {
  onNavigate: (section: string, params?: Record<string, unknown>) => void;
}
```

Sections that need data from the caller (e.g., edit sections) receive it via `sectionParams`:
```typescript
// From a list section:
onNavigate('empresas-editar', { empresaId: empresa.id, tipo: 'sede' })

// The edit section receives:
interface EditarEmpresaSectionProps {
  empresaId: string;
  tipo: string;
  onNavigate: (section: string, params?: Record<string, unknown>) => void;
}
```

**Section naming convention:** `{domain}-{action}` → e.g., `empresas-listar`, `empresas-editar`, `financeiro-pagar`, `relatorios-fluxo-caixa`.

### Adding a New Section

1. Create the component in `src/pages/dashboard/sections/NewSection.tsx`
2. In `MainWorkspace.tsx`:
   - Import the component
   - Add entry to `sectionTitles` Record (maps section key → display title)
   - Add `case` in `renderContent()` switch
3. In `NavigationSidebar.tsx`:
   - Add `MenuItem` entry to `menuItems` array (with id matching the section key)
4. If section needs params from other sections, type them in props and pass from `sectionParams`

### Service Layer

All API calls go through `ApiService` class (`src/services/api.service.ts`):
- Base URL from `VITE_API_URL` env variable (defaults to `http://localhost:3002`)
- Automatic Bearer token injection from `localStorage.getItem('token')`
- Auto-redirect to `/login` on 401; throws with friendly message on 403
- Standard response: `{ message: string, statusCode: number, data?: T }`
- Also supports `postFormData()` (file uploads) and `getBlob()` (downloads)

Domain services are **class instances** exported as singletons:

```typescript
// src/services/contato.service.ts
class ContatoService {
  async findAll(): Promise<Contato[]> {
    const response: ApiResponse<Contato[]> = await apiService.get('/contatos');
    return response.data || [];
  }
  // ...
}
export const contatoService = new ContatoService();
```

All services are re-exported from `src/services/index.ts`.

**Note:** Some services use `class` + singleton pattern (most), while `planoContasService` and `dreService` use `export default` pattern. Follow existing pattern when modifying.

### Types

All API types, DTOs, and enums are centralized in `src/types/api.types.ts`. This is a large file — types follow the pattern:
- `Entity` (response type) → `CreateEntityDto` → `UpdateEntityDto` (usually `Partial<CreateDto>`)
- Enums for statuses and types (e.g., `StatusContaPagar`, `TipoPessoa`, `TipoPlanoContas`)

### Authentication & Permissions

- JWT stored in `localStorage` as `token`; decoded client-side via `src/utils/jwt.utils.ts`
- `AuthContext` provides: `user`, `permissoes`, `login()`, `logout()`, `getClienteId()`, `hasModuleAccess(module)`, `hasPermission(module, action)`
- Permissions structure: `Record<string, string[]>` — module name → array of allowed actions
- `NavigationSidebar` filters menu items based on `hasModuleAccess()`
- The `clienteId` from the JWT token scopes all data queries

### Multi-Company Model

- **Cliente** = company group (from JWT `clienteId`/`sub`)
- **Empresa** = headquarters (sede)
- **Filial** = branch office (linked to an empresa)
- Many entities have `empresaId` and/or `filialId` fields for scoping

### Reusable Components

- `InputField`, `SelectField`, `CepField` — themed form fields in `src/components/`
- `Alert` — multi-variant alert component (error/warning/success/info)
- `SortableTableHeader`, `PaginationControls` — report table helpers in `src/components/reports/`
- `useReportFilters` hook — provides sorting + pagination state for data tables
- `useUserEmpresas` hook — fetches empresas for the current user's cliente

### Styling

- **TailwindCSS 3** with CSS custom properties for theming
- Theme variables defined in `src/theme/theme.css` (light mode only currently, no dark mode variables)
- Standard pattern: `className="bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)]"`
- Key variables: `--color-bg`, `--color-surface`, `--color-text`, `--color-text-primary`, `--color-text-secondary`, `--color-primary`, `--color-border`, `--color-sidebar-*`
- Tailwind extends colors in `tailwind.config.js` mapping to CSS variables
- Base font: 14px mobile, 16px desktop (768px breakpoint)

### Utilities

`src/utils/validators.ts` provides Brazilian document validators and formatters:
- `validarCPF()`, `validarCNPJ()`, `validarCpfCnpj()`
- `formatarCPF()`, `formatarCNPJ()`, `formatarCpfCnpj()`
- `formatarTelefone()`, `formatarCEP()`, `formatarMoeda()`, `parseMoeda()`
- `formatarData()` (ISO → DD/MM/YYYY), `dataParaISO()` (DD/MM/YYYY → ISO)

### Testing

- **Vitest** with jsdom environment and **MSW** (Mock Service Worker) for API mocking
- Setup file: `src/tests/setup.ts` (mocks localStorage, matchMedia, configures MSW)
- Mock handlers: `src/tests/mocks/handlers.ts` — comprehensive API mock responses
- Test location: `src/tests/services/` for service tests, `src/tests/utils/` for utility tests
- Coverage threshold: 70% (statements, branches, functions, lines)

### ESLint Rules to Know

- `no-console`: warn (only `console.warn` and `console.error` allowed)
- `@typescript-eslint/no-explicit-any`: warn
- `@typescript-eslint/no-unused-vars`: warn (prefix with `_` to ignore)
- `prettier/prettier`: error (formatting enforced)
- Strict TypeScript: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`

### Key Conventions

- Component files use PascalCase: `EditarContatoSection.tsx`
- Service files use kebab-case: `conta-bancaria.service.ts`
- All section components are `React.FC` with explicit props interface
- Forms use `e.currentTarget` with `FormData` or direct field access
- Loading/error/success state pattern: `const [loading, setLoading] = useState(false)` etc.
- Modals are inline (no portal), using fixed positioning with `z-50`
- Icons from `react-icons` (primarily `fi` = Feather Icons, `gi`, `md`, `ri`)
