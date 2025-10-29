# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a financial management web application built with React 19, TypeScript, and Rsbuild. The application provides multi-company (sede/filial) management capabilities with role-based access control, authentication, and various financial modules including accounts payable/receivable, contacts, and user management.

## Development Commands

```bash
# Install dependencies (uses pnpm)
pnpm install

# Start development server (runs on port 3001)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint code
pnpm lint              # with auto-fix
pnpm check:lint        # check only

# Format code
pnpm format            # with auto-write
pnpm check:format      # check only
```

## Architecture

### Application Structure

The app uses a **single-page workspace architecture** rather than traditional routing for the main dashboard. After authentication, users land in `MainWorkspace` which manages section navigation internally via state rather than URL routes.

#### Key Architectural Components

1. **Authentication Flow**
   - JWT-based authentication stored in localStorage
   - Token contains user data including `clienteId` (company ID)
   - `AuthContext` (src/context/AuthContext.tsx) provides auth state globally
   - `ProtectedRoute` and `PublicRoute` guard route access

2. **Workspace Navigation Pattern**
   - `MainWorkspace` (src/pages/dashboard/MainWorkspace.tsx) acts as the main container
   - Uses internal state (`activeSection`) to switch between sections
   - Navigation is handled by `NavigationSidebar` which triggers section changes
   - Section rendering is done via a large switch statement in `renderContent()`
   - `sectionParams` object passes data between sections (e.g., IDs for editing)
   - The `onNavigate(section, params)` callback pattern is used throughout sections

3. **Service Layer Architecture**
   - All API calls go through `apiService` (src/services/api.service.ts)
   - Centralized base URL configuration via `VITE_API_URL` env variable
   - Automatic JWT token injection in request headers
   - Domain services (auth, empresa, usuario, contato, etc.) wrap apiService methods
   - Standard response format: `{ message, statusCode, data }`

4. **Theme System**
   - CSS custom properties (CSS variables) define colors
   - `ThemeProvider` manages light/dark mode via localStorage and system preference
   - Tailwind configured to use CSS variables for theming
   - Dark mode uses `class` strategy (`darkMode: 'class'` in tailwind.config.js)

### Important Patterns

- **Section Components**: All dashboard sections live in `src/pages/dashboard/sections/`
  - Sections receive `onNavigate` callback to trigger navigation to other sections
  - Use `onNavigate('section-name', { paramName: value })` to pass data
  - Common pattern: list → edit → back to list

- **Multi-Company (Sede/Filial) Support**
  - Users belong to a "cliente" (client/company group)
  - Companies can be "sede" (headquarters) or "filial" (branch)
  - `clienteId` from JWT token determines data scope
  - Separate sections for creating sede vs filial

- **Onboarding Flow**
  - New users go through `/onboarding/empresa` to create their first company
  - After onboarding, redirected to main workspace

### Configuration Files

- **rsbuild.config.ts**: Dev server runs on port 3001 (not default 3000)
- **tsconfig.json**: Strict mode enabled, bundler module resolution
- **tailwind.config.js**: Dark mode via class, extends with CSS variable colors
- **.env**: Set `VITE_API_URL` to backend API endpoint

## Key Files to Know

- `src/index.tsx` - App entry point with provider setup
- `src/routes/AppRoutes.tsx` - Top-level route definitions
- `src/context/AuthContext.tsx` - Authentication state management
- `src/services/api.service.ts` - HTTP client with auth headers
- `src/pages/dashboard/MainWorkspace.tsx` - Main workspace container and section router
- `src/components/workspace/NavigationSidebar.tsx` - Main navigation menu

## Adding New Sections

To add a new section to the workspace:

1. Create section component in `src/pages/dashboard/sections/`
2. Add section key to `sectionTitles` object in `MainWorkspace.tsx`
3. Add case to `renderContent()` switch statement
4. Add navigation item to `NavigationSidebar.tsx`
5. If section needs params, handle in `sectionParams` object

## Working with the API

All services follow this pattern:
```typescript
import { apiService } from './api.service';

export const myService = {
  getAll: () => apiService.get<MyType[]>('/endpoint'),
  getById: (id: string) => apiService.get<MyType>(`/endpoint/${id}`),
  create: (data: CreateDto) => apiService.post<MyType>('/endpoint', data),
  update: (id: string, data: UpdateDto) => apiService.put<MyType>(`/endpoint/${id}`, data),
  delete: (id: string) => apiService.delete(`/endpoint/${id}`),
};
```

The API expects and returns responses with `{ message, statusCode, data }` structure.

## Styling Approach

- TailwindCSS utility classes for layout and spacing
- CSS variables for theme colors (defined in src/index.css)
- Use `var(--color-*)` in className strings for theme-aware colors
- Common pattern: `bg-[var(--color-bg)]` for backgrounds
