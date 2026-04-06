# Contributing to FrontWing

## Branching Strategy

We use a dual-branch workflow to ensure stability:

- **main**: Production-ready code. No direct commits allowed.
- **dev**: Primary integration branch. All work starts here.

### Workflow

1. Always branch off from `dev`.
2. Create a new branch: `git checkout -b type/branch-name`.
3. Open a Pull Request (PR) against the `dev` branch.
4. Once tested, `dev` is merged into `main` for releases.

---

## Branch Naming Conventions

- `feat/` — new features (e.g., `feat/product-search`)
- `fix/` — bug fixes (e.g., `fix/cart-quantity`)
- `chore/` — maintenance (e.g., `chore/update-dependencies`)
- `docs/` — documentation changes

---

## Commit Message Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description
```

**Common types:** `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `ci`

**Examples:**

```
feat(cart): add coupon code support
fix(auth): clear server errors before re-submit
test(schemas): add birthday validation edge cases
chore(deps): update pnpm to v10.30
```

---

## Development Environment

**Requirements:** Node.js v22+, pnpm v10+, Docker (optional)

### Local setup

```bash
pnpm install
pnpm dev         # http://localhost:5173
```

### Docker setup

```bash
make up       # Start dev container with hot-reload
make logs     # Follow logs
make shell    # Open shell inside the container
make stop     # Stop container
make rebuild  # Rebuild after dependency changes
```

> Copy `.env.example` to `.env` and set `VITE_REACT_APP_API_URL` to your Sylius API URL.

---

## Running Tests

### Unit tests

```bash
make test-unit           # Run once (CI mode)
make test-unit-coverage  # With coverage report
```

### E2E tests

Requires a running Sylius API and a valid test account. Copy `.env.test.example` to `.env.test.local` and fill in your credentials:

```bash
make test-e2e            # Build and run E2E tests
make test-e2e-report     # Open last HTML report
```

### All tests

```bash
make test    # Unit + E2E
```

### All available commands

```bash
make help
```

---

## Code Quality

Before submitting a PR, ensure your changes pass all checks:

```bash
make lint          # ESLint
make format        # Prettier
make test-unit     # Unit tests
```

The pre-commit hook (Husky + lint-staged) runs ESLint and Prettier automatically on staged files.

---

## CI

GitHub Actions runs on every push to `main`, `dev`, and `feat/**` branches:

1. **unit** — Vitest (blocking)
2. **e2e** — Playwright (requires unit to pass, uploads HTML report on failure)

Required repository secrets: `PLAYWRIGHT_BASE_URL`, `PLAYWRIGHT_TEST_EMAIL`, `PLAYWRIGHT_TEST_PASSWORD`, `VITE_REACT_APP_API_URL`.
