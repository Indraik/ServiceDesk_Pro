# ServiceDesk Pro — Enterprise Service & Support Management Platform

A full-stack IT service management application for creating, assigning, tracking, and resolving support tickets through role-based workflows.

**Live application:** https://servicedesk-frontend.vercel.app  
**Backend API:** https://servicedesk-backend-7v17.onrender.com  
**GitHub repository:** https://github.com/Indraik/ServiceDesk_Pro

## Overview

IT support teams need a structured way to manage service requests, assign work to engineers, track progress, and maintain accountability. ServiceDesk Pro provides a centralized ticket management platform with separate experiences for customers, agents, and administrators.

The application combines a React frontend, a Spring Boot REST API, JWT-based authentication, role-based authorization, and a PostgreSQL database.

## Features

### Customer
- Register and sign in securely.
- Create support tickets with descriptions, categories, and priorities.
- View personal tickets and their progress.
- Add comments and review ticket updates.
- Verify completed resolutions and close tickets where permitted.

### Agent
- View assigned support tickets.
- Work on tickets through the supported status workflow.
- Add comments and update ticket progress.

### Administrator
- View and manage support tickets.
- Assign tickets to agents.
- Manage user roles.
- Review ticket status and assignment history.
- Access administrative ticket management features.

### Ticket management
- Ticket status and priority management.
- Search, filtering, sorting, and pagination.
- Ticket comments and activity history.
- Validation and structured API error responses.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, Axios |
| Backend | Java, Spring Boot, Spring Security |
| API | REST |
| Authentication | JWT, BCrypt password hashing |
| Persistence | Spring Data JPA, Hibernate |
| Database | PostgreSQL |
| Database migrations | Flyway |
| Testing | Maven, JUnit-based tests |
| Deployment | Vercel, Render, Neon |
| Tools | Git, GitHub, Postman |

## Architecture

```text
Customer / Agent / Admin
          |
          v
   React + Vite Frontend
          |
       HTTPS / REST
          |
          v
   Spring Boot Backend
          |
     Spring Security
          |
    JWT Authentication
          |
     Controller Layer
          |
      Service Layer
          |
    Repository Layer
          |
     JPA / Hibernate
          |
          v
     Neon PostgreSQL
```

The frontend communicates with the backend through REST endpoints. The backend validates requests, authenticates users, enforces access rules, applies business logic, and persists data in PostgreSQL.

## Ticket Lifecycle

The supported ticket statuses are:

`OPEN → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED`

The application also supports `CANCELLED` for applicable cancellation flows. Valid transitions are enforced by the backend rather than relying only on frontend controls.

## Security

- Passwords are stored using BCrypt hashing.
- JWTs authenticate protected API requests.
- Role-based access control distinguishes CUSTOMER, AGENT, and ADMIN.
- Registration assigns the CUSTOMER role by default.
- Administrative role changes are protected by backend authorization and safeguards.
- Production credentials and JWT secrets are supplied through environment variables.
- CORS is configured for the deployed frontend origin.
- Flyway manages the production database schema.

## Database

The application uses PostgreSQL and includes tables for the principal entities:

- `users` and `roles`
- `tickets`
- `comments`
- `ticket_status_history`
- `ticket_assignment_history`
- `flyway_schema_history` for migration tracking

Flyway validates and applies versioned schema migrations in the production environment.

## API

The backend exposes REST endpoints under `/api`.

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/register` | POST | Register a customer account |
| `/api/auth/login` | POST | Authenticate and receive a JWT |
| `/api/users/agents` | GET | Retrieve the agent list, subject to authorization |
| `/api/tickets` | Various | Ticket operations, subject to the implemented routes and permissions |

Protected endpoints require a valid JWT in the `Authorization: Bearer <token>` header. Refer to the controllers in the repository for the complete endpoint list, request schemas, and access requirements.

## Local Development

### Prerequisites

- JDK 21 or compatible configured Java environment
- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Indraik/ServiceDesk_Pro.git
cd ServiceDesk_Pro
```

### 2. Configure the backend

Set the required environment variables before starting the backend:

```text
DB_URL=jdbc:postgresql://localhost:5432/servicedesk_db
DB_USERNAME=your_local_database_username
DB_PASSWORD=your_local_database_password
JWT_SECRET=your_generated_jwt_secret
JWT_EXPIRATION=3600000
APP_CORS_ALLOWED_ORIGIN=http://localhost:5173
```

Use a local development database and locally generated secrets. Never commit real credentials.

### 3. Run the backend

From the `servicedesk-backend` directory:

```bash
./mvnw spring-boot:run
```

On Windows PowerShell, use:

```powershell
.\mvnw.cmd spring-boot:run
```

### 4. Run the frontend

From the `servicedesk-frontend` directory:

```bash
npm install
npm run dev
```

Configure `VITE_API_BASE_URL` in the frontend environment to point to the local API:

```text
VITE_API_BASE_URL=http://localhost:8080/api
```

### 5. Run tests and build

Backend tests:

```powershell
cd servicedesk-backend
.\mvnw.cmd clean test
```

Frontend production build:

```powershell
cd servicedesk-frontend
npm run build
```

## Production Deployment

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| PostgreSQL database | Neon |

The production backend uses the `prod` Spring profile and Flyway-managed schema migrations. Configure database credentials, JWT secrets, and allowed frontend origins in the hosting platform's environment settings.

The frontend uses `VITE_API_BASE_URL` to select the API endpoint. Redeploy the frontend after changing build-time environment variables.

## Verification

The deployment workflow has been verified for:

- Backend automated tests: 13 tests passed with zero failures or errors.
- Frontend production build: completed successfully.
- Production database connection and Flyway schema validation.
- Customer registration with the default CUSTOMER role.
- Login and JWT issuance.
- Role-based denial of an unauthorized customer request.

These checks establish a baseline; they do not replace comprehensive security, load, and end-to-end testing.

## Future Improvements

- Expand automated authorization and integration tests.
- Add monitoring, structured logging, and operational alerts.
- Improve API documentation and request examples.
- Add comprehensive end-to-end regression testing.
- Review production backup, recovery, and availability requirements.

## Author

**V. Indra Kumar**  
Computer Science and Engineering — Cyber Security

GitHub: https://github.com/Indraik
