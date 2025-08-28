# Makefile for Medusa Angular E-commerce Development

.PHONY: help services dev stop clean logs status install setup-env build-backend migrate seed create-admin start-backend generate-key start-frontend full-setup

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	@echo "Installing dependencies..."
	npm ci

clean-deps: ## Clean all node_modules
	@echo "Cleaning node_modules..."
	rm -rf node_modules backend/node_modules storefront/node_modules e2e/node_modules

services: ## Start Docker services (PostgreSQL & Redis)
	@echo "Starting Docker services..."
	docker compose up -d
	@echo "Waiting for health checks..."
	@timeout 60s bash -c 'until [ $$(docker compose ps | grep -c "healthy") -eq 2 ]; do sleep 2; echo -n "."; done'
	@echo "\nServices are healthy!"

setup-env: ## Setup backend environment files
	@echo "Setting up backend environment..."
	@if [ ! -f backend/.env.development ]; then \
		echo "Creating backend/.env.development..."; \
		echo "DATABASE_URL=postgres://postgres:postgres@localhost:5432/medusa-store" > backend/.env.development; \
		echo "REDIS_URL=redis://localhost:6379" >> backend/.env.development; \
		echo "JWT_SECRET=supersecret" >> backend/.env.development; \
		echo "COOKIE_SECRET=supersecret" >> backend/.env.development; \
		echo "NODE_ENV=development" >> backend/.env.development; \
		echo "PORT=9000" >> backend/.env.development; \
		echo "STORE_CORS=http://localhost:4200" >> backend/.env.development; \
		echo "ADMIN_CORS=http://localhost:9000" >> backend/.env.development; \
		echo "AUTH_CORS=http://localhost:9000" >> backend/.env.development; \
	fi
	@cp backend/.env.development backend/.env
	@echo "Backend environment configured"

build-backend: setup-env ## Build the backend
	@echo "Building backend..."
	cd backend && npm run build

migrate: build-backend ## Run database migrations
	@echo "Running database migrations..."
	cd backend && npx medusa db:migrate

seed: migrate ## Seed the database
	@echo "Seeding database..."
	cd backend && (npm run seed || echo "No seed script found, skipping")

create-admin: seed ## Create admin user
	@echo "Creating admin user..."
	cd backend && npx medusa user -e admin@example.com -p supersecret || echo "Admin user might already exist"

start-backend: create-admin ## Start the backend server
	@echo "Starting Medusa backend..."
	cd backend && npm run start &
	@echo "Waiting for backend to start..."
	@timeout 60s bash -c 'until curl -f -s http://localhost:9000/health > /dev/null; do sleep 2; echo -n "."; done'
	@echo "\nBackend is ready at http://localhost:9000"

generate-key: ## Generate publishable API key and storefront config
	@echo "Generating publishable API key..."
	@./scripts/generate-api-key.sh admin@example.com supersecret

start-frontend: generate-key ## Start the Angular storefront
	@echo "Starting Angular storefront..."
	cd storefront && npm run start &
	@echo "Storefront will be available at http://localhost:4200"

dev: services ## Quick start - just services and environment
	@make services
	@make setup-env
	@echo ""
	@echo "Next steps - run in separate terminals:"
	@echo "  make start-backend"
	@echo "  make start-frontend"

full-setup: clean-all install services setup-env build-backend migrate seed create-admin generate-key ## Complete setup from scratch
	@echo ""
	@echo "Setup complete! You can now:"
	@echo "1. Start backend: make start-backend"
	@echo "2. Start frontend: make start-frontend"
	@echo ""
	@echo "Services will be available at:"
	@echo "  - Backend: http://localhost:9000"
	@echo "  - Admin: http://localhost:9000/app"
	@echo "  - Storefront: http://localhost:4200"

clean-all: ## Clean everything (Docker, node_modules, volumes)
	@echo "Cleaning everything..."
	docker compose down -v 2>/dev/null || true
	docker system prune -f 2>/dev/null || true
	rm -rf node_modules backend/node_modules storefront/node_modules e2e/node_modules
	@echo "Cleanup complete"

stop: ## Stop all services and processes
	@echo "Stopping all services..."
	docker compose down
	@pkill -f "medusa" || true
	@pkill -f "ng serve" || true
	@echo "All services stopped"

logs: ## View Docker service logs
	docker compose logs -f

logs-postgres: ## View PostgreSQL logs
	docker compose logs -f postgres

logs-redis: ## View Redis logs
	docker compose logs -f redis

status: ## Check service status
	@echo "Service Status:"
	@docker compose ps
	@echo ""
	@echo "Health Checks:"
	@curl -s http://localhost:9000/health > /dev/null && echo "Backend: OK" || echo "Backend: DOWN"
	@curl -s http://localhost:4200 > /dev/null && echo "Storefront: OK" || echo "Storefront: DOWN"