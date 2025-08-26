# Single Test Execution Guide

This guide explains how to run individual Playwright tests after setting up all your services locally.

## Prerequisites

Make sure you have all services running before executing individual tests:

1. **Docker services** (PostgreSQL & Redis)
2. **Medusa backend** running on port 9000
3. **Angular storefront** running on port 4200

## Quick Service Setup

If services aren't running yet:

```bash
# Start all services
make dev

# In separate terminals:
cd backend && npm run dev      # Terminal 1
cd storefront && npm run start # Terminal 2
```

Verify services are ready:

```bash
make status
```

## Running Single Tests

### Method 1: Run Specific Test File

To run all tests in a specific file:

```bash
cd e2e

# Run a specific test file
npx playwright test tests/architecture-validation.spec.ts

# Run with headed browser (see the test run)
npx playwright test tests/architecture-validation.spec.ts --headed

# Run with debug mode
npx playwright test tests/architecture-validation.spec.ts --debug
```

### Method 2: Run Specific Test by Name

To run a single test case by its title:

```bash
cd e2e

# Run a test that matches the title
npx playwright test --grep "Backend health check"

# Run multiple tests matching a pattern
npx playwright test --grep "health"
```

### Method 3: Run Tests in Specific Browser

```bash
cd e2e

# Run in specific browser
npx playwright test tests/architecture-validation.spec.ts --project=chromium
npx playwright test tests/architecture-validation.spec.ts --project=firefox
npx playwright test tests/architecture-validation.spec.ts --project=webkit
```

### Method 4: Run with Different Options

```bash
cd e2e

# Run with trace collection
npx playwright test tests/architecture-validation.spec.ts --trace=on

# Run with video recording
npx playwright test tests/architecture-validation.spec.ts --video=on

# Run with maximum workers (parallel execution)
npx playwright test tests/architecture-validation.spec.ts --workers=1

# Run in headed mode with slow motion
npx playwright test tests/architecture-validation.spec.ts --headed --slowmo=1000
```

## Common Test Commands

Here's a quick reference for the most useful single test commands:

```bash
cd e2e

# Basic single test execution
npx playwright test tests/my-test.spec.ts

# Watch mode - reruns test when files change
npx playwright test tests/my-test.spec.ts --watch

# Interactive mode - pick which tests to run
npx playwright test --ui

# Run specific test with full output
npx playwright test tests/my-test.spec.ts --verbose

# Run test and open report afterwards
npx playwright test tests/my-test.spec.ts && npx playwright show-report
```

## Debugging Individual Tests

### Debug Mode

```bash
cd e2e

# Opens browser with developer tools
npx playwright test tests/architecture-validation.spec.ts --debug
```

This will:

- Open browser in headed mode
- Pause before each action
- Allow you to inspect elements
- Step through test execution

### VS Code Integration

If using VS Code, install the Playwright extension:

1. Install **Playwright Test for VSCode** extension
2. Open your test file
3. Click the play button next to individual tests
4. Use breakpoints for debugging

### Test Inspector

For advanced debugging:

```bash
cd e2e

# Launch test inspector
npx playwright test tests/architecture-validation.spec.ts --debug --inspect
```

## Test Filtering Examples

### By Test Name Pattern

```bash
cd e2e

# Run all tests containing "health"
npx playwright test --grep "health"

# Run tests NOT containing "slow"
npx playwright test --grep-invert "slow"

# Use regex patterns
npx playwright test --grep "/API.*connectivity/"
```

### By File Pattern

```bash
cd e2e

# Run all spec files containing "api"
npx playwright test api

# Run tests in specific directory
npx playwright test tests/integration/

# Run multiple specific files
npx playwright test tests/login.spec.ts tests/checkout.spec.ts
```

## Sample Test Structure

Here's an example of how to structure tests for easy single execution:

```typescript
// e2e/tests/user-flows.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test('User can login successfully', async ({ page }) => {
    // Test implementation
  });

  test('User can logout', async ({ page }) => {
    // Test implementation
  });
});

test.describe('Product Browsing', () => {
  test('User can view product list', async ({ page }) => {
    // Test implementation
  });

  test('User can search products', async ({ page }) => {
    // Test implementation
  });
});
```

Then run specific groups:

```bash
cd e2e

# Run all authentication tests
npx playwright test --grep "User Authentication"

# Run specific test
npx playwright test --grep "User can login successfully"

# Run all tests in the file
npx playwright test tests/user-flows.spec.ts
```

## Quick Development Workflow

Perfect workflow for test development:

```bash
# 1. Start all services (one time)
make dev
cd backend && npm run dev      # Keep running
cd storefront && npm run start # Keep running

# 2. Develop/debug single test (iterate quickly)
cd e2e

# Write your test, then run it with debug
npx playwright test tests/my-new-test.spec.ts --debug

# Or run with headed browser for quick feedback
npx playwright test tests/my-new-test.spec.ts --headed

# 3. When test passes, run full suite
npm run test
```

## Troubleshooting Single Tests

### Test Fails But Services Work Manually

```bash
cd e2e

# Check if services are responding
npx playwright test --grep "health check" --headed --slowmo=2000

# Verify network connectivity
curl http://localhost:9000/health
curl http://localhost:4200
```

### Test Times Out

```bash
cd e2e

# Increase timeout for debugging
npx playwright test tests/slow-test.spec.ts --timeout=60000

# Or add to individual test:
# test.setTimeout(60000);
```

### Need Fresh Data

```bash
# Reset database (if needed)
cd backend
npx medusa db:migrate:reset
npm run seed

# Then run your test
cd ../e2e
npx playwright test tests/data-dependent-test.spec.ts
```

## Pro Tips

1. **Use `--headed`** during development to see what's happening
2. **Use `--debug`** to pause and inspect elements
3. **Use `--trace=on`** to get detailed execution traces
4. **Use `--grep`** to run related tests together
5. **Keep services running** between test runs for faster iteration
6. **Use VS Code extension** for integrated test running
7. **Check `make status`** if tests fail unexpectedly

## Quick Reference

```bash
# Most common commands for single test execution
cd e2e

# Basic run
npx playwright test tests/my-test.spec.ts

# Debug run
npx playwright test tests/my-test.spec.ts --debug

# Headed run
npx playwright test tests/my-test.spec.ts --headed

# Pattern match
npx playwright test --grep "test name"

# With report
npx playwright test tests/my-test.spec.ts && npx playwright show-report
```

---

Happy testing! 🧪
