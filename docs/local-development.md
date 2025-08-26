# Local Development Guide

This guide will help you set up and run the Medusa Angular E-commerce starter locally.

## Architecture Overview

Our e-commerce starter uses a modern npm workspace structure with:

- **Backend**: Medusa.js (Node.js e-commerce platform)
- **Frontend**: Angular storefront
- **Testing**: Playwright for E2E tests
- **Services**: PostgreSQL and Redis via Docker Compose

## Prerequisites

Before you start, make sure you have the following installed:

- **Node.js** v20+ ([Download](https://nodejs.org/))
- **npm** v8+ (comes with Node.js)
- **Docker** and **Docker Compose** ([Download](https://docs.docker.com/get-docker/))
- **Git** ([Download](https://git-scm.com/downloads))

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/gridatek/medusa-store-starter.git
cd medusa-store-starter

# Install all workspace dependencies
npm install
```

### 2. Start Development Environment

```bash
# Start Docker services and check configuration
make dev
```

This command will:

- ✅ Start PostgreSQL and Redis containers
- 🔍 Check if backend/.env exists
- 📄 Auto-copy from .env.template if needed
- 📝 Provide next steps

### 3. Configure Backend Environment

If this is your first time running the project, you'll need to edit your backend environment file:

```bash
# Edit the backend configuration
nano backend/.env
# or
code backend/.env
```

Make sure your `.env` contains at least:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/medusa-store
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret-here
COOKIE_SECRET=your-cookie-secret-here
NODE_ENV=development
PORT=9000
```

### 4. Start Backend (Terminal 1)

```bash
cd backend

# Run database migrations
npm run build
npx medusa db:migrate

# Seed database (optional)
npm run seed

# Start development server
npm run dev
```

Your Medusa backend will be available at: **http://localhost:9000**

### 5. Start Storefront (Terminal 2)

```bash
cd storefront

# Start Angular development server
npm run start
```

Your Angular storefront will be available at: **http://localhost:4200**

## Available Make Commands

We provide convenient Make commands for development:

```bash
make help          # Show all available commands
make services      # Start Docker services only
make dev           # Start development environment with checks
make stop          # Stop all services (Docker + running processes)
make clean         # Clean up everything (containers, volumes)
make logs          # View Docker service logs
make status        # Check service status
make install       # Install all npm dependencies
```

## Manual Docker Commands

If you prefer not to use Make:

```bash
# Start services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f

# Stop services
docker compose down
```

## Workspace Structure

```
medusa-store-starter/
├── docs/                  # Documentation
├── backend/               # Medusa backend
│   ├── package.json
│   ├── .env.template
│   └── src/
├── storefront/            # Angular frontend
│   ├── package.json
│   ├── angular.json
│   └── src/
├── e2e/                   # Playwright tests
│   ├── package.json
│   ├── playwright.config.ts
│   └── tests/
├── compose.yml            # Docker services
├── Makefile              # Development commands
└── package.json          # Workspace root
```

## Service URLs

Once everything is running:

| Service         | URL                       | Description         |
| --------------- | ------------------------- | ------------------- |
| Storefront      | http://localhost:4200     | Angular frontend    |
| Backend API     | http://localhost:9000     | Medusa API          |
| Admin Dashboard | http://localhost:9000/app | Medusa Admin        |
| PostgreSQL      | localhost:5432            | Database            |
| Redis           | localhost:6379            | Cache/Session store |

## Creating Admin User

To access the Medusa admin dashboard:

```bash
cd backend

# Create an admin user
npx medusa user -e admin@example.com -p password123 -i admin
```

Then visit http://localhost:9000/app and log in.

## Running Tests

### E2E Tests with Playwright

```bash
cd e2e

# Install Playwright browsers (first time only)
npx playwright install

# Run tests
npm run test

# Run tests with UI
npm run test:headed

# Debug tests
npm run test:debug
```

## Troubleshooting

### Common Issues

**Backend won't start:**

- Check if `.env` file exists and is properly configured
- Ensure Docker services are running: `make services`
- Verify database connection: `docker compose logs postgres`

**Storefront won't start:**

- Make sure you're in the `storefront` directory
- Check if all dependencies are installed: `npm install`
- Verify Angular CLI is working: `npx ng version`

**Docker services not starting:**

- Check if ports 5432 and 6379 are available
- Restart Docker: `docker compose down && docker compose up -d`
- Check Docker logs: `make logs`

**Tests failing:**

- Make sure both backend and storefront are running
- Check if services are healthy: `make status`
- Clear Playwright cache: `npx playwright install --force`

### Checking Service Status

```bash
# Quick status check
make status

# Manual checks
curl http://localhost:9000/health    # Backend health
curl http://localhost:4200           # Storefront
docker compose ps                    # Docker services
```

### Clearing Everything

If you need to start fresh:

```bash
# Stop and clean everything
make clean

# Remove node_modules (optional)
rm -rf node_modules backend/node_modules storefront/node_modules e2e/node_modules

# Start over
npm install
make dev
```

## Development Workflow

1. **Start your day:**

   ```bash
   make dev
   ```

2. **Start backend and frontend** in separate terminals

3. **Make your changes** and see them reflected automatically

4. **Run tests** when needed:

   ```bash
   cd e2e && npm run test
   ```

5. **Stop everything** when done:
   ```bash
   make stop
   ```

## Getting Help

- **Medusa Documentation**: https://docs.medusajs.com/
- **Angular Documentation**: https://angular.io/docs
- **Playwright Documentation**: https://playwright.dev/
- **Issues**: Create an issue on GitHub if you encounter problems

---

Happy coding! 🚀
