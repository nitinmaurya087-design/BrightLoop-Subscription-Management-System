# BRIGHTLOOP — Enterprise Subscription Management & Recurring Billing Platform

BrightLoop is a production-grade, full-stack enterprise Subscription Management and Billing Platform built for SaaS businesses, software providers, and subscription-driven organizations.

Designed with an enterprise interface inspired by Stripe Dashboard and Linear, BrightLoop delivers complete lifecycle subscription billing, automated invoicing, customer self-service, payment reconciliation, discount rule evaluation, tax snapshot preservation, and real-time financial telemetry.

---

## 🌟 Key Highlights & Architectural Features

- **End-to-End Functional Stack**: Zero mock databases or dummy buttons. Every page and action connects to real Spring Boot REST APIs and relational database persistence.
- **Relational Integrity with Flyway Migrations**: Clean schema versioning (`V1__init_schema.sql` and `V2__seed_data.sql`) with foreign keys, compound indexes, unique constraints, and audit logging.
- **Strict Role-Based Access Control (RBAC)**:
  - `ADMIN`: Complete system access, staff account creation, catalog configuration, tax and billing controls, reports.
  - `STAFF`: Day-to-day operations, customer accounts, quotation generation, subscription management, payment records.
  - `CUSTOMER`: Strict data isolation to customer self-service portal (subscriptions, invoices, payments, profile).
- **Dynamic Product Variant Pricing**:
  $$\text{Final Unit Price} = \text{Base Product Price} + \text{Selected Variant Additional Price}$$
  *Example*: Business Software (Base ₹2,000) + Odoo Variant (+₹560) = ₹2,560 unit price.
- **Lifecycle State Machine**:
  `DRAFT` $\rightarrow$ `QUOTATION` $\rightarrow$ `CONFIRMED` $\rightarrow$ `ACTIVE` $\rightleftharpoons$ `PAUSED` $\rightarrow$ `CLOSED` / `CANCELLED`
- **Automated Recurring Billing Engine**:
  - Nightly cron scheduler (`0 0 1 * * ?`) plus on-demand manual trigger.
  - **Idempotency & Duplicate Prevention**: Validates existing invoices within the cycle to prevent double billing.
  - Calculates tax and discount rules, generates historical invoice line snapshots, and advances `nextBillingDate`.
- **OpenPDF Invoice & Quotation Generation**: Generates high-fidelity PDF documents using OpenPDF (LibrePDF 1.3.40).
- **Payment Settlement & Overpayment Prevention**: Prevents overpayments exceeding `balanceDue` and generates printable payment receipts.
- **Financial Analytics & CSV Exports**: Recharts visualization of Monthly Revenue, ARR, MRR, Subscription Growth, Product Revenue, and one-click CSV export for all reporting ledgers.

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS & Lucide React icons
- **State & Server Query**: TanStack Query (React Query) & React Context API
- **HTTP Client**: Axios with JWT request/response interceptors
- **Visual Analytics**: Recharts (Area, Bar, Pie/Donut charts)
- **Forms & Validation**: React Hook Form with Zod validation

### Backend
- **Framework**: Java 21 / 25, Spring Boot 3.3.4
- **Security**: Spring Security 6, Stateless JWT Token Authentication, BCrypt Password Hashing
- **ORM & Data**: Spring Data JPA, Hibernate ORM
- **Database Migrations**: Flyway
- **Scheduler**: Spring Scheduler (`@Scheduled`, `@Async`)
- **PDF Generation**: OpenPDF (LibrePDF 1.3.40)
- **Email Dispatch**: Spring Mail (SMTP with development console fallback)
- **Testing**: JUnit 5, Spring Boot Test, Mockito (100% passing test suite)

### Database
- **Development**: Embedded H2 in MySQL compatibility mode (`MODE=MySQL`) with full Flyway migration compatibility for zero-setup local startup.
- **Production / Docker**: MySQL 8.0 relational database with indexed queries.

---

## 👥 Seed Demo Credentials

| Role | Email | Password | Scope & Permissions |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@brightloop.com` | `Admin@12345` | Full Administrative Access & Staff Management |
| **STAFF** | `staff@brightloop.com` | `Staff@12345` | Operational Management (Customers, Quotations, Subscriptions, Payments) |
| **CUSTOMER** | `customer@brightloop.com` | `Customer@12345` | Self-Service Portal (Personal Subscriptions, Invoices, Receipts) |

*Note: The Login screen includes one-click demo login buttons for each role for rapid testing.*

---

## 🚀 Running the Project Locally

### Option 1: Quick Local Run (No Docker required)

#### 1. Start Backend (Spring Boot):
```bash
cd backend
./mvnw spring-boot:run
```
*The backend starts at `http://localhost:8080`. Flyway automatically executes migrations V1 and V2 on initial startup.*

#### 2. Start Frontend (Vite + React):
```bash
cd frontend
npm run dev
```
*The frontend starts at `http://localhost:5173` and proxies `/api` requests seamlessly to `http://localhost:8080`.*

---

### Option 2: Docker Compose (MySQL 8 + Backend + Frontend)

To launch the full production environment containerized:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- MySQL 8: `localhost:3306`

---

## 🧪 Running Automated Tests

BrightLoop includes end-to-end integration and unit tests covering authentication, RBAC, pricing calculations, quotation conversion, lifecycle transitions, billing execution, and payment settlement:

```bash
cd backend
./mvnw test -o
```

**Test Execution Summary**:
```
[INFO] Tests run: 8, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## 📁 Repository Structure

```
odoo.project2/
├── Dockerfile.backend               # Multi-stage Dockerfile for Spring Boot
├── Dockerfile.frontend              # Multi-stage Dockerfile for React + Nginx
├── docker-compose.yml               # Complete stack deployment
├── backend/
│   ├── mvnw                         # Maven wrapper
│   ├── pom.xml                      # Spring Boot dependencies & plugins
│   └── src/
│       ├── main/
│       │   ├── java/com/brightloop/
│       │   │   ├── config/          # Security, JWT, CORS configurations
│       │   │   ├── controller/      # 15 REST API Controllers
│       │   │   ├── dto/             # Request & Response DTOs
│       │   │   ├── entity/          # 23 JPA Entities
│       │   │   ├── repository/      # 21 Spring Data JPA Repositories
│       │   │   ├── scheduler/       # Recurring billing cron jobs
│       │   │   └── service/         # Core business logic, pricing & PDF services
│       │   └── resources/
│       │       ├── application.yml  # Application properties
│       │       └── db/migration/    # Flyway V1 (schema) & V2 (seed data)
│       └── test/                    # Comprehensive integration tests
└── frontend/
    ├── package.json                 # React dependencies
    ├── vite.config.ts               # Vite bundler & reverse proxy config
    ├── tailwind.config.js           # Modern SaaS theme palette
    └── src/
        ├── api/                     # Typed Axios API service modules
        ├── types/                   # TypeScript interfaces
        ├── context/                 # AuthContext & ToastContext
        ├── components/              # Buttons, Cards, Tables, Modals, Badges
        └── pages/                   # Auth, Dashboard, Customers, Products, Plans,
                                     # Quotations, Subscriptions, Invoices, Payments,
                                     # Discounts, Reports, Staff, Portal, Settings
```

---

## 📄 License
BrightLoop is developed for enterprise subscription management and hackathon evaluation. All rights reserved.
