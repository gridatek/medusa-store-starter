# Makefile for Medusa Angular E-commerce Development

.PHONY: help services dev stop clean logs status install

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $1, $2}' $(MAKEFILE_LIST)

services: ## Start Docker services (PostgreSQL & Redis)
	@echo "🚀 Starting Docker services..."
	docker compose up -d
	@echo "✅ Services started. Waiting for health checks..."
	@timeout 60s bash -c 'until docker compose ps | grep -q "healthy"; do sleep 2; echo -n "."; done'
	@echo "\n✅ Services are healthy!"

dev: services ## Start development environment
	@echo "🔧 Starting development environment..."
	@make services
	@echo ""
	@echo "🔍 Checking backend configuration..."
	@if [ ! -f backend/.env ]; then \
		echo "⚠️  backend/.env not found!"; \
		if [ -f backend/.env.template ]; then \
			echo "📄 Copying backend/.env.template to backend/.env"; \
			cp backend/.env.template backend/.env; \
			echo "✏️  Please edit backend/.env with your configuration"; \
		else \
			echo "❌ No backend/.env.template found"; \
			echo "📝 Please create backend/.env manually"; \
		fi; \
	else \
		echo "✅ backend/.env found"; \
	fi
	@echo ""
	@echo "🏗️  Next steps - run in separate terminals:"
	@echo "  cd backend && npm run dev"
	@echo "  cd storefront && npm run start"
	@echo ""
	@echo "🌐 Your services will be available at:"
	@echo "  - Backend: http://localhost:9000"
	@echo "  - Storefront: http://localhost:4200"
	@echo "  - PostgreSQL: localhost:5432"
	@echo "  - Redis: localhost:6379"

stop: ## Stop all services
	@echo "🛑 Stopping all services..."
	docker compose down
	@pkill -f "medusa" || true
	@pkill -f "ng serve" || true
	@echo "✅ All services stopped"

clean: stop ## Clean up everything (containers, volumes, processes)
	@echo "🧹 Cleaning up..."
	docker compose down -v
	docker system prune -f
	@echo "✅ Cleanup complete"

logs: ## View Docker service logs
	docker compose logs -f

logs-postgres: ## View PostgreSQL logs
	docker compose logs -f postgres

logs-redis: ## View Redis logs
	docker compose logs -f redis

status: ## Check service status
	@echo "📊 Service Status:"
	@docker compose ps
	@echo ""
	@echo "🌐 Health Checks:"
	@curl -s http://localhost:9000/health > /dev/null && echo "✅ Backend: OK" || echo "❌ Backend: DOWN"
	@curl -s http://localhost:4200 > /dev/null && echo "✅ Storefront: OK" || echo "❌ Storefront: DOWN"

install: ## Install all dependencies
	@echo "📦 Installing dependencies..."
	npm ci
	@echo "✅ Dependencies installed"