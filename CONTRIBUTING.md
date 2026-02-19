# Contributing to Sylius Shop TS

## Branching Strategy
We use a dual-branch workflow to ensure stability:
- **main**: Production-ready code. No direct commits allowed.
- **dev**: Primary integration branch. All work starts here.

### Workflow:
1. Always branch off from `dev`.
2. Create a new branch: `git checkout -b type/branch-name`.
3. Open a Pull Request (PR) against the `dev` branch.
4. Once tested, `dev` is merged into `main` for releases.

## Branch Naming Conventions
- `feat/` for new features (e.g., `feat/ai-chat-integration`)
- `fix/` for bug fixes (e.g., `fix/router-imports`)
- `chore/` for maintenance (e.g., `chore/migrate-to-pnpm`)
- `docs/` for documentation changes

## Commit Message Conventions
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
`type(scope): description`

**Common types:**
- **feat**: A new feature
- **fix**: A bug fix
- **chore**: Changes to the build process or auxiliary tools
- **docs**: Documentation only changes

**Examples:**
- `feat(ai): integrate MOAI SDK`
- `fix(router): import BrowserRouter from react-router-dom`
- `chore(deps): update all dependencies to latest`

## Development Environment
The project is containerized using Docker and managed with pnpm.

1. **Install dependencies locally:**
   ```bash
   pnpm install