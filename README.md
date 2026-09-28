# 🛠️ ServiceDesk Pro

**ServiceDesk Pro** is an enterprise-style **IT Service Desk and Support Management System** designed to manage customer support tickets, users, agents, roles, ticket assignments, comments, status transitions, and ticket history.

The application is built using **Java Spring Boot** with a layered architecture following industry-standard backend development practices.

---

## 📌 Project Overview

ServiceDesk Pro provides a centralized platform for organizations to manage IT support requests.

Customers can raise support tickets and track their progress, while administrators and support agents can manage, assign, update, and resolve tickets through a controlled ticket lifecycle.

The project demonstrates practical implementation of:

* RESTful APIs
* Object-Oriented Programming
* Spring Boot
* Spring Data JPA
* Hibernate ORM
* PostgreSQL
* Spring Security
* JWT Authentication
* Role-Based Access Control
* Layered Architecture
* Database Relationships
* Validation
* Exception Handling
* Git & GitHub

---

## 🚀 Key Features

### 👤 User Management

* User registration
* User login
* User roles
* Customer and Admin/Agent access
* Role-based authorization
* Secure password handling

### 🎫 Ticket Management

* Create support tickets
* View tickets
* Update ticket details
* Assign tickets to agents
* Track ticket status
* Resolve tickets
* Close resolved tickets
* Ticket lifecycle management

### 🔄 Ticket Status Lifecycle

Tickets follow a controlled workflow:

```text
OPEN
  ↓
ASSIGNED
  ↓
IN_PROGRESS
  ↓
RESOLVED
  ↓
CLOSED
```

The system controls which users can perform specific status transitions.

### 💬 Comments

Users and support staff can add comments to tickets.

Comments provide communication between customers and support agents while maintaining the ticket's discussion history.

### 📜 Status History

Every important status transition can be recorded as history.

Example:

```text
OPEN → IN_PROGRESS
IN_PROGRESS → RESOLVED
RESOLVED → CLOSED
```

This provides traceability for ticket activities.

### 🔐 Authentication & Authorization

The backend uses Spring Security to protect application resources.

Authentication verifies the user's identity, while authorization determines what actions the user is allowed to perform.

Example:

```text
Customer
   ↓
Create / View Own Tickets
   ↓
Add Comments

Agent
   ↓
View / Manage Assigned Tickets
   ↓
Update Ticket Status
   ↓
Resolve Tickets

Admin
   ↓
Manage Users
   ↓
Manage Tickets
   ↓
Assign Agents
   ↓
Administrative Operations
```

---

# 🏗️ Architecture

ServiceDesk Pro follows a layered architecture:

```text
                Client / Frontend
                       │
                       ▼
                REST Controller
                       │
                       ▼
                    Service
                       │
                       ▼
                   Repository
                       │
                       ▼
                  JPA / Hibernate
                       │
                       ▼
                   PostgreSQL
```

### Controller Layer

Handles HTTP requests and responses.

Example:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/tickets
POST /api/tickets
PUT  /api/tickets/{id}
```

### Service Layer

Contains the application's business logic.

Examples:

* Ticket status validation
* Role-based operations
* Ticket assignment
* User registration
* Comment handling

### Repository Layer

Communicates with the database using Spring Data JPA.

Example:

```java
public interface UserRepository extends JpaRepository<User, Long> {
}
```

### Entity Layer

Represents database tables as Java objects.

Examples:

```text
User
Role
Ticket
Comment
StatusHistory
```

---

# 🧰 Technology Stack

| Technology      | Purpose                        |
| --------------- | ------------------------------ |
| Java 21         | Programming language           |
| Spring Boot     | Backend framework              |
| Spring Web      | REST API development           |
| Spring Data JPA | Database persistence           |
| Hibernate       | ORM                            |
| Spring Security | Authentication & authorization |
| PostgreSQL      | Relational database            |
| Maven           | Dependency & build management  |
| Lombok          | Boilerplate reduction          |
| Git             | Version control                |
| GitHub          | Source code management         |
| Postman         | API testing                    |

---

# 🗄️ Database

ServiceDesk Pro uses **PostgreSQL** as its relational database.

The application uses JPA/Hibernate to map Java entities to database tables.

Basic relationship:

```text
Role
 │
 │ 1
 │
 │
 ▼
User
 │
 │
 ├───────────────┐
 │               │
 ▼               ▼
Ticket         Comment
 │
 │
 ▼
Status History
```

### Example User–Role Relationship

A user belongs to a role.

```java
@ManyToOne
@JoinColumn(name = "role_id")
private Role role;
```

This creates a relationship between the `users` and `roles` tables.

---

# 📁 Project Structure

```text
ServiceDesk_Pro/
│
├── servicedesk-backend/
│   │
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/
│   │   │   │       └── servicedesk/
│   │   │   │           └── servicedesk_backend/
│   │   │   │
│   │   │   │               ├── controller/
│   │   │   │               ├── service/
│   │   │   │               ├── repository/
│   │   │   │               ├── entity/
│   │   │   │               ├── security/
│   │   │   │               └── ...
│   │   │   │
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   │
│   │   └── test/
│   │
│   ├── pom.xml
│   └── ...
│
├── .gitignore
└── README.md
```

---

# ⚙️ Getting Started

## Prerequisites

Make sure the following are installed:

* Java JDK 21+
* Maven
* PostgreSQL
* Git
* Postman (recommended)

Verify Java:

```bash
java -version
```

Verify Maven:

```bash
mvn -version
```

---

## 📥 Clone the Repository

```bash
git clone https://github.com/Indraik/ServiceDesk_Pro.git
```

Move into the backend project:

```bash
cd ServiceDesk_Pro/servicedesk-backend
```

---

# 🗃️ Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE servicedesk_db;
```

Configure the database in:

```text
src/main/resources/application.properties
```

Example:

```properties
spring.application.name=servicedesk-backend

spring.datasource.url=jdbc:postgresql://localhost:5432/servicedesk_db
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

Replace:

```text
YOUR_PASSWORD
```

with your PostgreSQL password.

---

# ▶️ Running the Application

Using Maven:

```bash
mvn spring-boot:run
```

Or run the main Spring Boot application class from your IDE.

The backend will start on:

```text
http://localhost:8080
```

---

# 🔌 API Structure

The application follows RESTful API principles.

Typical API structure:

```text
/api/auth
/api/users
/api/tickets
/api/comments
```

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Tickets

```text
GET    /api/tickets
GET    /api/tickets/{id}
POST   /api/tickets
PUT    /api/tickets/{id}
DELETE /api/tickets/{id}
```

### Comments

```text
POST /api/tickets/{id}/comments
GET  /api/tickets/{id}/comments
```

> Endpoint availability depends on the current implementation of the corresponding controller.

---

# 🔐 Security

Security is implemented using **Spring Security**.

The application separates:

### Authentication

Determines:

> "Who are you?"

### Authorization

Determines:

> "What are you allowed to do?"

Role-based access can be represented as:

```text
ROLE_ADMIN
ROLE_AGENT
ROLE_CUSTOMER
```

This prevents unauthorized users from performing restricted operations.

---

# 🧩 Core Spring Concepts Used

The project demonstrates several important Spring concepts.

### Dependency Injection

Dependencies are injected through constructors instead of manually creating objects.

```java
public TicketController(TicketService ticketService) {
    this.ticketService = ticketService;
}
```

### REST Controller

```java
@RestController
@RequestMapping("/api/tickets")
```

### Service Layer

```java
@Service
```

### Repository

```java
@Repository
```

or Spring Data JPA repository interfaces.

### Entity Mapping

```java
@Entity
@Table(name = "users")
```

### Relationships

```java
@ManyToOne
@JoinColumn(name = "role_id")
```

---

# 🧪 Testing

API endpoints can be tested using **Postman**.

Example workflow:

```text
Register User
      ↓
Login
      ↓
Receive Authentication Token
      ↓
Send Token in Request
      ↓
Create Ticket
      ↓
Assign Ticket
      ↓
Update Status
      ↓
Add Comment
      ↓
Resolve Ticket
      ↓
Close Ticket
```

---

# 📊 Ticket Lifecycle

The ticket lifecycle is one of the core parts of ServiceDesk Pro.

```text
              ┌─────────────┐
              │    OPEN     │
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │  ASSIGNED   │
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │ IN_PROGRESS │
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │  RESOLVED   │
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │   CLOSED    │
              └─────────────┘
```

Status transitions are validated according to the application's business rules and user roles.

---

# 🎯 Project Objectives

The primary objectives of ServiceDesk Pro are:

* Build a real-world enterprise backend
* Implement RESTful API architecture
* Understand Spring Boot development
* Implement database relationships using JPA/Hibernate
* Implement authentication and authorization
* Apply role-based access control
* Implement ticket lifecycle management
* Maintain ticket activity history
* Follow layered architecture
* Practice clean backend development
* Gain experience with PostgreSQL and Git

---

# 📚 Concepts Demonstrated

This project provides practical exposure to:

```text
Java
 │
 ├── OOP
 │   ├── Encapsulation
 │   ├── Inheritance
 │   ├── Polymorphism
 │   └── Abstraction
 │
 ├── Collections
 ├── Exception Handling
 └── Interfaces

Spring Boot
 │
 ├── REST APIs
 ├── Dependency Injection
 ├── IoC
 ├── Controllers
 ├── Services
 └── Configuration

Database
 │
 ├── PostgreSQL
 ├── SQL
 ├── JPA
 ├── Hibernate
 └── Entity Relationships

Security
 │
 ├── Spring Security
 ├── Authentication
 ├── Authorization
 └── Role-Based Access Control

Development
 │
 ├── Maven
 ├── Git
 ├── GitHub
 └── Postman
```

---

# 🔮 Future Enhancements

Potential future improvements include:

* Email notifications
* File attachments
* Search and filtering
* Pagination and sorting
* SLA management
* Dashboard and analytics
* Audit logging
* Docker deployment
* Cloud deployment
* Automated testing
* API documentation using Swagger/OpenAPI
* Frontend integration

---

# 👨‍💻 Author

**Indra Kumar V**

Computer Science Engineering — Cyber Security

GitHub:
https://github.com/indraik

---

# 📄 License

This project is developed for educational, portfolio, and learning purposes.

---

## ⭐ ServiceDesk Pro

A practical enterprise-style Service Desk backend built to demonstrate **Java + Spring Boot + PostgreSQL + REST API + Security + JPA/Hibernate** development.
