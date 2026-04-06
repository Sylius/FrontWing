# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Vitest v4 unit test suite — 48 tests across schemas, utilities, and UI components (SPEC-TEST-001)
  - `src/schemas/__tests__/` — auth, account, review schema validation (28 tests)
  - `src/lib/__tests__/` — `formError`, `applyServerErrors`, `clearServerErrors` utilities (6 tests)
  - `src/components/ui/__tests__/` — `FieldError`, `PasswordStrength` components (14 tests)
- Playwright v1.58 E2E test suite with Page Object Model pattern (SPEC-TEST-001)
  - Auth flows: login, register, logout
  - Form validation: inline errors, onBlur/onSubmit behaviour
  - Account pages: profile update, change password
  - Auth fixture with JWT seed via Sylius API (`e2e/fixtures/auth.ts`)
- Docker multi-stage test infrastructure (`docker/Dockerfile.test`) with isolated stages per concern (SPEC-TEST-001)
- `docker/compose.test.yml` — fully self-contained test environment (unit-tests, app-serve, e2e-tests services)
- `docker/compose.yml` — React dev container with hot-reload (node:22-alpine)
- `docker/Dockerfile` — multi-stage app image (dev, builder, production)
- `Makefile` — unified command interface for development, Docker, and all test scenarios
- GitHub Actions CI workflow (`.github/workflows/test.yml`) — unit job (blocking) then E2E job on `main`, `dev`, and `feat/**` branches
- `FieldError` component (`src/components/ui/field-error.tsx`) — accessible inline field error with `id`, `aria-live` (SPEC-UPDATE-001)
- `applyServerErrors` utility — maps Sylius API error payloads to TanStack Form server errors (SPEC-UPDATE-001)
- `clearServerErrors` utility — clears `onServer` errors before re-submission to unblock `canSubmit` (SPEC-UPDATE-001)
- `onBlur` validators on all form fields using the same Zod schemas as `onSubmit` (SPEC-UPDATE-001)
- `aria-describedby` linking all inputs to their `FieldError` component (SPEC-UPDATE-001)

### Changed

- All form fields updated with `aria-invalid` driven by TanStack Form field state (SPEC-UPDATE-001)
- `submitForm()` utility extended to call `clearServerErrors` before submission (SPEC-UPDATE-001)

## [0.4.0] - 2026-03-09

### Added

- `@tanstack/react-form` v1.28.4 and `zod` v3.25.76 as production dependencies (SPEC-REFACTOR-001)
- `src/schemas/` directory with centralized Zod schemas: `auth.ts`, `address.ts`, `account.ts`, `review.ts`, `index.ts`
- `formError()` utility in `src/lib/utils.ts` — safely extracts error message from TanStack Form v1 error values (handles both Zod `ZodIssue` objects and plain strings)
- `noValidate` attribute on all form elements — disables browser-native HTML5 validation in favour of TanStack Form inline errors
- `aria-invalid` attribute on all validated inputs and `SelectTrigger` components across 10 form pages (accessibility improvement)
- Form-level pre-fill timing guard (`canInitialize`) on `AddressPage` — waits for async customer/order data before populating form fields

### Changed

- All 10 form pages migrated from raw `useState` to TanStack Form `useForm` + `form.Field` render-prop pattern (SPEC-REFACTOR-001)
  - Auth pages: `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ResetPasswordPage`
  - Account pages: `ProfilePage`, `ChangePasswordPage`, `AddAddressPage`, `EditAddressPage`
  - Checkout: `AddressPage`
  - Product: `AddReviewPage`
- `AddressForm` refactored to receive TanStack Form field API via render-prop — parent `useForm` instance now controls validation and submission for account address pages
- `AddressPage` nested address fields (`billingAddress.*`, `shippingAddress.*`) validated via form-level `validators.onSubmit` using `addressSchema.safeParse()` with `{ fields: {} }` error map format
- `RegisterPage` password strength indicator and show/hide toggles preserved; strength score computed via `useMemo` from `useStore`-subscribed password value
- Zod schemas replace all hand-written `if` checks, `validateAddress()` function, and `Record<string, string>` form data objects; TypeScript types derived via `z.infer<>` enforce type safety between form values and API payloads

### Removed

- `validateAddress()` ad-hoc validation function (replaced by `addressSchema`)
- All `useState`-based manual field tracking and error state across migrated pages
- `@tanstack/zod-form-adapter` runtime dependency (TanStack Form v1 uses native StandardSchema — adapter installed but not used)

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
