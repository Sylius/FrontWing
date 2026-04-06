.DEFAULT_GOAL := help
COMPOSE          := docker compose -f docker/app/compose.yml
COMPOSE_PROD     := docker compose -f docker/app/compose.prod.yml
COMPOSE_TEST     := docker compose -f docker/test/compose.test.yml
ENV_TEST_FILE    := .env.test.local
COMPOSE_TEST_E2E := $(COMPOSE_TEST) $(if $(wildcard $(ENV_TEST_FILE)),--env-file $(ENV_TEST_FILE),)
CERT_KEY         := docker/app/certs/localhost-key.pem
CERT_CRT         := docker/app/certs/localhost.pem
SYLIUS_SSL_DIR   := ../Sylius-Standard/docker/nginx/ssl

# ── Colors ──────────────────────────────────────────────────────────────────
BOLD  := \033[1m
RESET := \033[0m
CYAN  := \033[36m

##@ Development

.PHONY: up
up: ## Start dev container
	$(COMPOSE) up

.PHONY: up-d
up-d: ## Start dev container (detached)
	$(COMPOSE) up -d

.PHONY: stop
stop: ## Stop dev container
	$(COMPOSE) stop

.PHONY: restart
restart: ## Restart dev container
	$(COMPOSE) restart

.PHONY: logs
logs: ## Follow dev container logs
	$(COMPOSE) logs -f

.PHONY: shell
shell: ## Open shell in dev container
	$(COMPOSE) exec app sh

.PHONY: build
build: ## Build Docker image
	$(COMPOSE) build

.PHONY: rebuild
rebuild: ## Rebuild Docker image (no cache)
	$(COMPOSE) build --no-cache

##@ Production

.PHONY: build-prod
build-prod: ## Build production Docker image (requires VITE_REACT_APP_API_URL)
	$(COMPOSE_PROD) build

.PHONY: up-prod
up-prod: ## Start production container
	$(COMPOSE_PROD) up -d

.PHONY: stop-prod
stop-prod: ## Stop production container
	$(COMPOSE_PROD) stop

##@ Code Quality

.PHONY: lint
lint: ## Run ESLint
	$(COMPOSE) run --rm --no-deps tools pnpm lint

.PHONY: lint-fix
lint-fix: ## Run ESLint with auto-fix
	$(COMPOSE) run --rm --no-deps tools pnpm lint:fix

.PHONY: format
format: ## Format code with Prettier
	$(COMPOSE) run --rm --no-deps tools pnpm format

##@ Tests

.PHONY: test
test: test-unit test-e2e ## Run all tests (unit + E2E)

.PHONY: test-unit
test-unit: ## Run unit tests once
	$(COMPOSE_TEST) run --rm unit-tests

.PHONY: test-unit-watch
test-unit-watch: ## Run unit tests in watch mode (local only)
	pnpm test:unit

.PHONY: test-unit-coverage
test-unit-coverage: ## Run unit tests with coverage
	$(COMPOSE_TEST) run --rm unit-tests pnpm test:unit:coverage

.PHONY: test-e2e
test-e2e: ## Run E2E tests (reads .env.test.local)
	$(COMPOSE_TEST_E2E) build api-proxy app e2e-tests
	$(COMPOSE_TEST_E2E) run --rm e2e-tests

.PHONY: test-e2e-report
test-e2e-report: ## Open last Playwright HTML report
	pnpm test:e2e:report

.PHONY: test-build
test-build: ## Build all test Docker images
	$(COMPOSE_TEST) build

.PHONY: test-down
test-down: ## Stop and remove test containers
	$(COMPOSE_TEST) down --remove-orphans

##@ Setup

.PHONY: init
init: certs build ## Initialize project (TLS certificates + Docker image)

.PHONY: certs
certs: ## Generate local TLS certificates with mkcert (also copies to Sylius nginx ssl dir)
	@command -v mkcert >/dev/null 2>&1 || \
		{ echo "mkcert not found. Install: brew install mkcert (macOS) / apt install mkcert (Linux)"; exit 1; }
	@if [ -f $(CERT_KEY) ] && [ -f $(CERT_CRT) ]; then \
		echo "Certificates already exist. Delete $(CERT_KEY) and $(CERT_CRT) to regenerate."; \
	else \
		mkcert -install; \
		mkcert -key-file $(CERT_KEY) -cert-file $(CERT_CRT) localhost 127.0.0.1; \
	fi
	@if [ -d $(SYLIUS_SSL_DIR) ]; then \
		cp $(CERT_KEY) $(SYLIUS_SSL_DIR)/localhost-key.pem; \
		cp $(CERT_CRT) $(SYLIUS_SSL_DIR)/localhost.pem; \
		echo "Certificates copied to $(SYLIUS_SSL_DIR) — restart Sylius nginx to apply."; \
	else \
		echo "Sylius ssl dir not found at $(SYLIUS_SSL_DIR) — skipping Sylius cert copy."; \
	fi

##@ Utilities

.PHONY: clean
clean: ## Remove build artifacts and test outputs
	rm -rf dist coverage playwright-report test-results e2e/.auth

.PHONY: help
help: ## Show this help
	@awk 'BEGIN {FS = ":.*##"; printf "\n$(BOLD)Usage:$(RESET)\n  make $(CYAN)<target>$(RESET)\n"} \
	/^[a-zA-Z0-9_-]+:.*?##/ { printf "  $(CYAN)%-28s$(RESET) %s\n", $$1, $$2 } \
	/^##@/ { printf "\n$(BOLD)%s$(RESET)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
