# Architectural Design Document v2: Nexus Portal

This document describes the architectural layout, communication patterns, database schema designs, and data flows of the Nexus Portal.

---

## 1. System Overview

Nexus Portal is a distributed microservice system designed to decouple user operations, credential checking/session issuance, and ecommerce checkout workflows. By splitting these functions into specialized services, we achieve independent scalability, database boundary enforcement, and technology agility.

```
       +---------------------------------------------+
       |             ReactJS Frontend                |
       |                (Port 5173)                  |
       +-------+--------------+---------------+------+
               |              |               |
  Auth requests| Register     | Products,     | Products (Admin) &
  (JWT token)  | requests     | Cart, Orders  | User RBAC updates
               v              v               v
       +-------+------+  +----+---------+  +--+--------------+
       | Auth Service |  | User Service |  | Shopping Service|
       | (Port 8082)  |  | (Port 8081)  |  | (Port 8083)     |
       +-------+------+  +----+---------+  +--+--------------+
               |              |               |
               | Verify       | JPA           | JPA
               | Credentials  |               |
               v              v               v
               +------------->|          +----+----+
                              |          |         |
                              v          v         v
                         [user_db]   [shopping_db]
                         (Local DB)   (Local DB)
```

---

## 2. Service Boundaries & Responsibilities

### 2.1 User Management Service (`user-service`)
- **Domain**: User Identity & Directory Roles (RBAC).
- **Responsibilities**:
  - Handles registering new usernames and emails, enforcing unique database constraints. All new registrations default strictly to the `USER` role.
  - Encrypts passwords using BCrypt standard strength (10 rounds) before inserting into database.
  - Exposes an internal verification endpoint `/api/users/verify` accepting username and raw password, matching the BCrypt hash.
  - Exposes admin-only management endpoints: `GET /api/users` (list users) and `PUT /api/users/{id}/role` (modify user role). Senders must supply an `Authorization` header with a valid `ADMIN` JWT token, which is decoded and validated directly.
- **Data Persistence**: Connects to local database `user_db` with a single schema table `users`.

### 2.2 Auth/Session POJO Service (`auth-service`)
- **Domain**: Authentication and Session State.
- **Responsibilities**:
  - Exposes `/api/auth/login` to authenticate users. It serves as the **POJO service** to maintain sessions.
  - Acts as a gateway for credentials: maps incoming JSON body to a `LoginRequest` POJO, calls the internal verify API of `user-service` via a Spring `RestTemplate`, and parses the result.
  - If valid, generates a signed JSON Web Token (JWT) containing user ID, username, and role claims.
  - Returns a `LoginResponse` POJO containing the token, user credentials, and token expiration milliseconds back to the frontend.
  - Serves as stateless session manager: requires no active database connection.

### 2.3 Shopping Portal Service (`shopping-service`)
- **Domain**: Catalog, Inventory, Cart, and Checkouts.
- **Responsibilities**:
  - Exposes products retrieval and lets admins create products.
  - Manages active user cart items, validating stock levels before adding items.
  - Handles checkout: deducts product stock, logs order details, saves itemized lines, and empties the cart in a single `@Transactional` database wrapper.
  - Intercepts requests using a custom `JwtInterceptor`. The interceptor extracts the `Authorization: Bearer <token>` header, parses claims using the shared secret key, and injects request attributes (`userId`, `role`, `username`). This ensures request context is available to controller layers without database lookups.
- **Data Persistence**: Connects to local database `shopping_db`, managing tables: `products`, `cart_items`, `orders`, and `order_items`.

---

## 3. Database Design & Schema Migrations

Each service connects to its respective database schema. The schemas are managed independently via **Flyway Migrations**, ensuring table structures stay synchronized with backend class entities automatically.

### 3.1 `user_db` Schema (User Service)
#### `users` Table
Stores registered accounts and security credentials.
- `id` (BIGSERIAL PRIMARY KEY)
- `username` (VARCHAR(50), UNIQUE, NOT NULL)
- `password` (VARCHAR(100), NOT NULL) - BCrypt-encrypted hash
- `email` (VARCHAR(100), UNIQUE, NOT NULL)
- `full_name` (VARCHAR(100))
- `role` (VARCHAR(20)) - Default value is `'USER'`
- `created_at` (TIMESTAMP)

### 3.2 `shopping_db` Schema (Shopping Service)
#### `products` Table
Inventory table for catalog items.
- `id` (BIGSERIAL PRIMARY KEY)
- `name` (VARCHAR(100), NOT NULL)
- `description` (TEXT)
- `price` (DECIMAL(10,2), NOT NULL)
- `stock` (INT, NOT NULL)
- `image_url` (VARCHAR(255))

#### `cart_items` Table
Temporary user shopping cart contents.
- `id` (BIGSERIAL PRIMARY KEY)
- `user_id` (BIGINT, NOT NULL)
- `product_id` (BIGINT REFERENCES products(id) ON DELETE CASCADE)
- `quantity` (INT, NOT NULL)
- *Constraint*: `UNIQUE (user_id, product_id)` to prevent duplicate product lines.

#### `orders` Table
Stores header information for checkout purchases.
- `id` (BIGSERIAL PRIMARY KEY)
- `user_id` (BIGINT, NOT NULL)
- `total_amount` (DECIMAL(10,2), NOT NULL)
- `status` (VARCHAR(20)) - E.g. `'PENDING'`, `'SHIPPED'`
- `created_at` (TIMESTAMP)

#### `order_items` Table
Itemized lines purchased during checkout.
- `id` (BIGSERIAL PRIMARY KEY)
- `order_id` (BIGINT REFERENCES orders(id) ON DELETE CASCADE)
- `product_id` (BIGINT REFERENCES products(id))
- `quantity` (INT, NOT NULL)
- `price` (DECIMAL(10,2), NOT NULL) - Captures unit price at the time of order placement.

---

## 4. Key Workflows

### 4.1 Authentication & Session Maintenance Flow
1. User enters credentials on the Login page.
2. React client POSTs credentials to `auth-service` `/api/auth/login`.
3. `auth-service` validates input and POSTs a `CredentialVerificationRequest` to `user-service` `/api/users/verify`.
4. `user-service` queries the `users` table in `user_db`, matches BCrypt passwords, and returns user details.
5. Upon successful validation, `auth-service` generates a JWT token containing claims (`userId`, `username`, `role`).
6. `auth-service` maps the token to a `LoginResponse` POJO and sends it back to the React client.
7. React client stores the JWT and user metadata in `localStorage` under `nexus_token` and `nexus_user` keys, maintaining session state.
8. For subsequent secure requests, the React client attaches this token in the `Authorization: Bearer <token>` header.

### 4.2 User Management & RBAC Flow
1. A logged-in administrator visits the **User Directory** navigation item in the frontend.
2. React client makes a `GET` request to `user-service` at `/api/users` with the `Authorization` header.
3. `user-service` controller intercepts the request, decodes the JWT, verifies the role is `ADMIN`, and returns the list of all user DTOs.
4. When the administrator changes a user's role from the dropdown, React client makes a `PUT` request to `/api/users/{id}/role` sending the new role in the request body.
5. `user-service` validates the caller's admin privileges, updates the selected user's role column in the DB, and returns the updated `UserDTO`.

---

## 5. End-to-End Testing (Playwright)

To validate cross-service integrations and transaction rollback logic, the application includes a Playwright E2E automation runner located under the `./playwright-tests` directory.

### 5.1 Test Execution Suite Configuration
- **Browser target**: Chromium (Desktop Chrome).
- **Execution mode**: Serial (Sequential). Sequential runs are enforced because tests simulate a continuous user lifecycle:
  1. *Registration & Login*: Registers a new dynamic profile (`pw_user_*`) and establishes a session.
  2. *Shopping & Checkout*: Adds a product, increments quantity to 2, checkouts, and validates database order mapping.
  3. *Admin & RBAC Promotion*: Logs in as admin, inserts a new product, searches for the dynamic user profile, promotes it to `ADMIN`, logs out, and finally logs back in as the dynamic user to verify that admin control interfaces are now visible and operational.
- **Reporting**: Generates a standard HTML dashboard showing action logs and trace screenshots.
