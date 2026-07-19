# Nexus Portal v2 - User Management & Shopping Portal

Nexus Portal is a modern, high-performance microservices application comprising three Spring Boot backend services and a ReactJS frontend. The application features user authentication, role management, a product catalog, a shopping cart, and order history tracking.

---

## 🛠️ Architecture Overview

The system consists of:
1. **User Management Service (`user-service` :8081)**: Manages registrations (defaults all new accounts to `USER`), stores BCrypt-hashed passwords in `user_db`, and exposes endpoints for listing/modifying user roles (secured for `ADMIN` role only).
2. **Auth POJO Service (`auth-service` :8082)**: Validates credentials via `user-service`, generates session-maintaining JWT tokens, and returns them in standard Java POJOs.
3. **Shopping Portal Service (`shopping-service` :8083)**: Manages the product catalog, cart adjustments, and order checkouts. Runs against `shopping_db` using a custom `JwtInterceptor` for authorization.
4. **ReactJS Frontend (:5173)**: A beautiful, glassmorphic dark-theme SPA that integrates all microservices.

For a detailed view of the communication flows, database designs, and architectural patterns, refer to [architecture-v2.md](./architecture-v2.md).

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed locally:
- [PostgreSQL Database](https://www.postgresql.org/) (running on standard port `5432` with username `postgres` and password `password` or `root`)
- [Java Development Kit (JDK) 17+](https://adoptium.net/)
- [Apache Maven](https://maven.org/)
- [Node.js 18+](https://nodejs.org/)

### 1. Database Setup
Before starting the services, you must create the databases in your local PostgreSQL server:
```sql
CREATE DATABASE user_db;
CREATE DATABASE shopping_db;
```
*Note: Flyway will automatically run database schema migrations (creating tables and seeding initial data) when the services start.*

### 2. Running the Application

You can run the entire application using the helper script, or start each service individually:

#### Option A: Run All Services via Startup Script
1. In PowerShell, execute the startup helper script in the project root:
   ```powershell
   .\run-dev.ps1
   ```

#### Option B: Run Services Individually
If you prefer to start the services manually in separate terminals, follow these steps:

1. **User Management Service (`user-service`)**
   ```bash
   cd user-service
   mvn spring-boot:run
   ```

2. **Auth Service (`auth-service`)**
   ```bash
   cd auth-service
   mvn spring-boot:run
   ```

3. **Shopping Service (`shopping-service`)**
   ```bash
   cd shopping-service
   mvn spring-boot:run
   ```

4. **ReactJS Frontend (`frontend`)**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### 3. Accessing the Application
Once the services are running, navigate to:
- **Frontend UI**: [http://localhost:5173](http://localhost:5173)
- **User Service API**: [http://localhost:8081](http://localhost:8081)
- **Auth Service API**: [http://localhost:8082](http://localhost:8082)
- **Shopping Service API**: [http://localhost:8083](http://localhost:8083)

---

## 🧪 Testing Credentials

Default users are automatically seeded into the database during Flyway migration:

| Role | Username | Password |
| :--- | :--- | :--- |
| **Standard User** | `user` | `user123` |
| **Administrator** | `admin` | `admin123` |

---

## 🎭 End-to-End Testing (Playwright)

We have included a comprehensive Playwright automation suite located in the `./playwright-tests` directory.

### Steps to Run:
1. Ensure the databases are created and all services (user-service, auth-service, shopping-service, frontend) are running.
2. In a new terminal, navigate to the test directory:
   ```bash
   cd playwright-tests
   npm install
   npx playwright install chromium
   ```
3. Run the automated test scenarios:
   ```bash
   npm test
   ```
4. To open the interactive UI test runner:
   ```bash
   npm run test:ui
   ```

For more info, see the [Playwright README](./playwright-tests/README.md).

---

## 📡 API Endpoints

### 1. User Service (`:8081`)
- `POST /api/users/register` - Registers a new user (role is forced to `USER`).
- `POST /api/users/verify` - Internal verification of password hash (used by Auth Service).
- `GET /api/users/{username}` - Retrieves user profile info.
- `GET /api/users` - Lists all registered users (Requires `ADMIN` JWT token).
- `PUT /api/users/{id}/role` - Modifies a user's role (Requires `ADMIN` JWT token).

### 2. Auth Service (`:8082`)
- `POST /api/auth/login` - Takes username/password POJO, returns JWT token POJO.
- `POST /api/auth/validate` - Validates JWT token integrity.

### 3. Shopping Service (`:8083`)
- `GET /api/products` - Returns all catalog items.
- `POST /api/products` - Adds a new product (Requires `ADMIN` JWT token).
- `GET /api/cart` - Returns current user's cart (derived from token).
- `POST /api/cart` - Adds or updates cart item quantity.
- `DELETE /api/cart/{productId}` - Removes product from cart.
- `POST /api/orders` - Checkouts cart items, reduces stock, and places an order.
- `GET /api/orders` - Returns logged-in user's past purchases.
