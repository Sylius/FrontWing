ARG PNPM_VERSION=10.32.1

# ── Stage 1: base dependencies ────────────────────────────
FROM node:22-alpine AS deps
ARG PNPM_VERSION
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ── Stage 2: development server (source mounted as volume) ─
FROM deps AS dev
EXPOSE 5173
CMD ["pnpm", "dev"]

# ── Stage 3: unit tests ────────────────────────────────────
FROM deps AS unit-tests
COPY . .
CMD ["pnpm", "test:unit", "--run"]

# ── Stage 4: build ─────────────────────────────────────────
FROM deps AS builder
COPY . .
ARG VITE_REACT_APP_API_URL
RUN pnpm build

# ── Stage 5: production (nginx) ────────────────────────────
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

# ── Stage 6: test serve (nginx, port 4174) ─────────────────
FROM nginx:alpine AS app-serve
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/test/nginx.test.conf /etc/nginx/conf.d/default.conf
EXPOSE 4174
HEALTHCHECK --interval=5s --timeout=5s --retries=15 --start-period=20s \
  CMD wget -qO /dev/null http://127.0.0.1:4174 || exit 1

# ── Stage 7: api-proxy (HTTP → Sylius) ─────────────────────
FROM nginx:alpine AS api-proxy
COPY docker/test/nginx.proxy.conf /etc/nginx/conf.d/default.conf

# ── Stage 8: E2E tests (Playwright) ────────────────────────
FROM mcr.microsoft.com/playwright:v1.58.2-noble AS e2e-tests
ARG PNPM_VERSION
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
CMD ["pnpm", "test:e2e"]
