# FrontWing — Headless Sylius Frontend

A modern, headless React 19 frontend for [Sylius](https://sylius.com) e-commerce platform, built with Vite 7, TypeScript 5.9, TailwindCSS v4, and shadcn/ui.

> ℹ️ **Status**: This project is in active development. Core e-commerce features are implemented and functional, with ongoing improvements and optimizations.

---

## Tech Stack

- **React** 19 — UI library
- **Vite** 7 — Build tool and development server
- **TypeScript** 5.9 — Type-safe development
- **TailwindCSS** v4 — Utility-first CSS with `@tailwindcss/vite` plugin
- **shadcn/ui** — Component library with Base UI (`base-vega` style) primitives
- **TanStack Form** v1 + **Zod** v3 — Form state management and schema validation
- **TanStack Query** — Server state management
- **react-router-dom** — Client-side routing
- **pnpm** — Package manager
- **Sonner** — Toast notifications
- **Vitest** v4 — Unit testing
- **Playwright** v1.58 — End-to-end testing

---

## Features

- 🧩 Component-driven architecture with shadcn/ui
- ⚡ Lightning-fast Vite development with HMR
- 🎨 TailwindCSS v4 styling + shadcn/ui components
- 🛒 Full Sylius API v2 integration:
  - Homepage and category listing
  - Product detail pages with reviews
  - Shopping cart with discount support
  - Multi-step checkout flow
  - Customer account (dashboard, order history, profile, address book)
- 📝 Accessible form validation (onBlur + onSubmit, `aria-invalid`, `aria-describedby`)
- 📱 Responsive mobile-first design
- ♿ Accessibility-focused component patterns
- 🔄 Client-side routing with React Router
- 🧪 Unit tests (Vitest) and E2E tests (Playwright)

---

## UI Library

This project uses **shadcn/ui** component library backed by **Base UI** (`base-vega` style) primitives, providing production-ready components with full TypeScript support and accessibility out of the box. Available components include Button, Input, Textarea, Select, Table, Badge, Alert, Checkbox, Accordion, Breadcrumb, Card, Sheet (mobile navigation), NavigationMenu (desktop navigation), DropdownMenu, Separator, Label, and Sonner for toast notifications.

---

## Getting Started

**Requirements:** Docker, make

Set `VITE_REACT_APP_API_URL` in your environment or `.env` file, then:

```bash
make up
```

Open https://localhost:5173 in your browser. The dev container runs Vite with hot-reload over HTTPS.

**First-time setup (one-time per machine):**

```bash
brew install mkcert   # macOS
# apt install mkcert  # Linux

make init             # generates TLS certificates + builds Docker image
```

`make init` runs `make certs` then `make build`. The certificates are generated locally, trusted by your browser, and gitignored. Without them, Vite falls back to a self-signed certificate (`@vitejs/plugin-basic-ssl`).

**Sylius API — trusted HTTPS (optional but recommended):**

If your Sylius backend runs on `https://localhost`, its nginx must also use a mkcert certificate to avoid `ERR_CERT_AUTHORITY_INVALID` errors in the browser.

`make certs` handles this automatically: after generating the FrontWing dev certificate it copies both files to `../Sylius-Standard/docker/nginx/ssl/`. You then need to restart the Sylius nginx container once:

```bash
make certs   # generates certs + copies to Sylius ssl dir
cd ../Sylius-Standard && docker compose restart nginx
```

> The copy is skipped silently if `../Sylius-Standard/docker/nginx/ssl/` does not exist (e.g. Sylius is hosted elsewhere). You can override the path with `make certs SYLIUS_SSL_DIR=/path/to/ssl`.

**Common commands:**

```bash
make up-d       # Start in background
make logs       # Follow container logs
make shell      # Open shell in container
make stop       # Stop container
make rebuild    # Rebuild image (after dependency changes)
```

> **IDE IntelliSense (TypeScript, ESLint):** install Node.js v22+ and pnpm v10+ locally, then run `pnpm install`. The app still runs in Docker — the local `node_modules` is only needed for editor tooling.

---

## Production

FrontWing ships a multi-stage Dockerfile with a `production` target: Vite compiles the static assets, then nginx serves them on port 80.

> **Important:** `VITE_REACT_APP_API_URL` is embedded at **build time** by Vite. It must be set before building the image — it cannot be changed at runtime.

**Quick start:**

```bash
VITE_REACT_APP_API_URL=https://api.myshop.com make build-prod
make up-prod   # serves on http://localhost:80
```

Or with an `.env` file:

```bash
cp .env.example .env
# set VITE_REACT_APP_API_URL=https://api.myshop.com in .env
make build-prod
make up-prod
```

**Production commands:**

```bash
make build-prod   # Build production image
make up-prod      # Start production container (detached)
make stop-prod    # Stop production container
```

The production nginx config (`docker/app/nginx.conf`) serves the SPA on port 80 with gzip, security headers, and SPA fallback routing. SSL termination is expected to be handled by an upstream reverse proxy (e.g., Traefik, Caddy, cloud load balancer).

> **Note:** mkcert certificates are only needed for local development. In production, the Sylius API is expected to be served with a valid public certificate.

---

## Code Quality

```bash
make lint       # Run ESLint
make lint-fix   # Run ESLint with auto-fix
make format     # Format code with Prettier
```

These commands run inside Docker — no local pnpm installation required.

---

## Testing

All tests run in Docker.

### Unit tests (Vitest)

```bash
make test-unit           # Run once
make test-unit-coverage  # With coverage report
```

### E2E tests (Playwright)

E2E tests use an isolated Docker stack: the app is built and served over HTTP (port 4174) and requests to the Sylius API go through a reverse proxy on the internal Docker network.

```bash
make test-e2e         # Build and run E2E tests
make test-e2e-report  # Open last HTML report
```

**Environment variables required for E2E:**

| Variable                   | Description           | Docker default     |
| -------------------------- | --------------------- | ------------------ |
| `PLAYWRIGHT_TEST_EMAIL`    | Test account email    | —                  |
| `PLAYWRIGHT_TEST_PASSWORD` | Test account password | —                  |
| `VITE_REACT_APP_API_URL`   | Sylius API base URL   | `http://api-proxy` |
| `PLAYWRIGHT_BASE_URL`      | Frontend URL          | `http://app:4174`  |

Copy `.env.test.example` to `.env.test.local` and fill in your credentials — the Makefile picks it up automatically:

```bash
cp .env.test.example .env.test.local
# edit .env.test.local
make test-e2e
```

### All tests

```bash
make test       # Unit + E2E
make help       # Full list of available commands
```

---

## Development Roadmap

Planned features and improvements:

- [ ] Server-side rendering (SSR) optimization
- [ ] Internationalization (i18n) and multilingual support
- [ ] API query optimization
- [ ] Performance monitoring and analytics
- [ ] Extended test coverage — pages, hooks, and deeper E2E scenarios

---

## Community

Have questions or want to contribute? Join the Sylius Slack community in the `#react-front` channel:

👉 https://sylius.com/slack

---

## License

FrontWing is released under the [MIT License](https://github.com/Sylius/Sylius/blob/master/LICENSE).

## Contributing

Contributions are welcome! Feel free to:

- Open an issue for bugs or feature requests
- Submit pull requests with improvements
- Share feedback and ideas

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full contribution guide.
