# Nexus Portal - Playwright E2E Integration Tests

This directory contains a suite of end-to-end (E2E) integration tests for the Nexus Portal application. 

The tests run sequentially to cover the complete lifecycle of a user:
1. **User Registration and Login**: Verifies a new account is registered (defaulting to the `USER` role), redirects, and successfully establishes a logged-in session.
2. **Catalog and Checkout**: Tests adding a product to the cart, modifying its quantity, checking out, and verifying order insertion in the `orders` list as `PENDING`.
3. **Admin and RBAC**: Logs in as the administrator, inserts a new product into the catalog, promotes the newly created test user to `ADMIN`, logs out, and validates that the promoted user now has admin authorization and access to admin navbar directories.

---

## 🚀 How to Run the Tests

### 1. Ensure the Application is Running
Before running the tests, ensure your local PostgreSQL server and all application services are running:
- **Frontend UI**: [http://localhost:5173](http://localhost:5173)
- **User Service**: [http://localhost:8081](http://localhost:8081)
- **Auth Service**: [http://localhost:8082](http://localhost:8082)
- **Shopping Service**: [http://localhost:8083](http://localhost:8083)

*Note: The default `admin` / `admin123` account must be present in the database.*

### 2. Install Playwright Dependencies
Open a terminal in the `playwright-tests` directory and run:
```bash
# 1. Install Node modules
npm install

# 2. Download Playwright browser binaries
npx playwright install chromium
```

### 3. Execute the Tests
- **Headless mode** (Run tests in background):
  ```bash
  npm test
  ```
- **UI Mode** (Interactive test runner):
  ```bash
  npm run test:ui
  ```
- **Debug Mode** (Step-by-step inspector):
  ```bash
  npm run test:debug
  ```
