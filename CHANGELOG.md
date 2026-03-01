# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2026-03-01

### Added

- Prettier v3 with `prettier-plugin-tailwindcss` for automatic Tailwind class sorting
- Husky v9 pre-commit git hook running lint-staged automatically
- lint-staged: runs `eslint --fix` + `prettier --write` on staged `.ts/.tsx` files
- `.editorconfig` for consistent editor settings (UTF-8, LF, 2-space indent)
- `pnpm format` script for manual full-codebase formatting

### Changed

- ESLint config updated: added `eslint-config-prettier` (disables formatting rules conflicting with Prettier)
- ESLint config: `react-refresh/only-export-components` disabled for `src/components/ui/` and `src/context/` (legitimate multi-export pattern)
- `react-hooks/exhaustive-deps` warnings fixed in `ProductList.tsx` and `ProductPage.tsx` by moving fetch functions inside `useEffect`/`useCallback`
- Entire codebase reformatted with Prettier baseline (formatting-only, no logic changes)

## [0.2.0] - 2026-03-01

### Added

- TailwindCSS v4 via `@tailwindcss/vite` Vite plugin
- shadcn/ui component library with Base UI (`base-vega` style)
- New UI components: `Button`, `Input`, `Textarea`, `Select`, `Table`, `Badge`, `Alert`, `Checkbox`, `Accordion`, `Breadcrumb`, `Card`, `Sheet`, `NavigationMenu`, `DropdownMenu`, `Separator`, `Label`, `Sonner` toasts
- `@base-ui/react` as the primitives layer (replaces Radix UI)
- Mobile navigation via shadcn/ui `Sheet` component (React-controlled, replaces Bootstrap offcanvas)
- Desktop navigation via shadcn/ui `NavigationMenu` with hover dropdowns
- Flash messages replaced by Sonner toast notifications
- `input-group`, `navigation-menu`, `separator`, `textarea` shadcn/ui components added
- `@theme` block with brand color token `--color-primary: #22B99A` and Bootstrap-compatible `--breakpoint-lg: 992px`
- `.link-reset` utility class ported to Tailwind `@layer components`
- Proper TypeScript types for cart/order product rows (removes all `any` types)
- pnpm as the package manager

### Changed

- All UI styling migrated from Bootstrap 5 to TailwindCSS v4
- All native HTML elements (`<input>`, `<button>`, `<select>`, `<table>`, `<textarea>`, `<input type="checkbox">`) replaced with shadcn/ui components
- Navbar fully migrated to shadcn/ui Sheet (mobile) + NavigationMenu (desktop)
- Bootstrap grid classes replaced with Tailwind equivalents
- ESLint configuration updated to flat config (`eslint.config.js`) with TypeScript and React plugins
- `schema/` directory excluded from ESLint to avoid linting auto-generated files
- `catch (err: any)` patterns replaced with `catch (err: unknown)` for type safety

### Removed

- Bootstrap 5 package and all Bootstrap CSS/JS imports
- `@types/bootstrap` package
- `sass` package and all SCSS files (`main.scss`)
- `@radix-ui/react-*` packages (replaced by `@base-ui/react`)
- `FlashMessages.tsx` component (replaced by Sonner)
- All `data-bs-*` HTML attributes
- All Bootstrap class names (`btn-*`, `col-*`, `form-control`, `d-flex`, etc.)

## [0.1.0] - 2025-01-01

### Added

- Initial headless Sylius frontend implementation
- Product listing, product detail, cart, checkout, and account pages
- TanStack Query for data fetching
- React Router for client-side navigation
- TypeScript support
