# SLD App Makefile

.PHONY: help install dev build clean deploy test

help: ## Show this help message
	@echo "SLD App - Development Commands"
	@echo "=============================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✅ All dependencies installed"

dev: ## Start development servers
	@echo "Starting development environment..."
	@echo "Backend will run on http://localhost:3001"
	@echo "Frontend will run on React Native Metro"
	cd backend && npm run dev &
	cd frontend && npm start

build: ## Build for production
	@echo "Building backend..."
	cd backend && npm run build
	@echo "Building Android APK..."
	cd frontend && npm run build:android
	@echo "✅ Build completed"

clean: ## Clean build artifacts and node_modules
	@echo "Cleaning backend..."
	cd backend && rm -rf node_modules dist
	@echo "Cleaning frontend..."
	cd frontend && rm -rf node_modules
	@echo "✅ Cleaned"

deploy: ## Deploy using Docker
	@echo "Deploying with Docker Compose..."
	docker-compose up -d --build
	@echo "✅ Deployed at http://localhost:3001"

stop: ## Stop Docker containers
	docker-compose down
	@echo "✅ Containers stopped"

test: ## Run tests
	@echo "Running backend tests..."
	cd backend && npm test
	@echo "Running frontend tests..."
	cd frontend && npm test
	@echo "✅ Tests completed"

logs: ## View Docker logs
	docker-compose logs -f

setup-db: ## Setup MongoDB locally
	@echo "Setting up MongoDB..."
	cd backend && npm run setup-db
	@echo "✅ Database setup completed"

android: ## Run Android app
	cd frontend && npm run android

ios: ## Run iOS app (macOS only)
	cd frontend && npm run ios

lint: ## Run linting
	cd backend && npm run lint
	cd frontend && npm run lint

format: ## Format code
	cd backend && npm run format
	cd frontend && npm run format