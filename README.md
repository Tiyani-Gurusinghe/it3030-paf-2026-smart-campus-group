# Smart Campus Management System

## Project Structure

- `backend/` - Spring Boot REST API
- `frontend/` - React application
- `docs/` - diagrams, API notes, team contributions

## Team Workflow

- `main` is always kept stable
- Each member creates a feature branch from `main`
- Open a Pull Request before merging

# Smart Campus Backend (IT3030 - PAF 2026)

This is the backend service for the Smart Campus system, built using **Spring Boot** and following a **layered architecture with RESTful APIs**.

The project is structured to support multiple independent features while maintaining consistency and scalability.

---

## 📌 Overview of backend

This backend follows a **three-tier architecture**:

- **Controller Layer** → Handles HTTP requests/responses
- **Service Layer** → Business logic
- **Repository Layer** → Database access

This separation improves maintainability, scalability, and security  [oai_citation:0‡4 - Web Application Architecture - An Overview.pdf](sediment://file_00000000b84c71fa9fe783f170a19f19)

---

## 🚀 Tech Stack

- Java + Spring Boot
- Maven
- JPA / Hibernate
- REST APIs (JSON-based)
- MySQL / H2 (depending on config)
- Swagger (OpenAPI)

---

## 📁 Project Structure

```
backend/
├── src/main/java/lk/sliit/smartcampus/
```
### 🔹 Root Package

- `SmartCampusApplication.java` → Entry point of the application

---

## ⚙️ Configuration Layer (`config/`)

Handles global configurations.

- `CorsConfig.java` → Cross-Origin settings
- `OpenApiConfig.java` → Swagger documentation setup
- `SecurityConfig.java` → Authentication & authorization setup

---

## 🧰 Common Utilities (`common/`)

Reusable components across all features.

### DTOs
- `ApiSuccessResponse.java`
- `ApiErrorResponse.java`

### Enums
- `RoleType.java`
- `StatusType.java`

### Utilities
- `DateTimeUtil.java`

---

## ❗ Exception Handling (`exception/`)

Global error handling mechanism.

- `GlobalExceptionHandler.java` → Centralized exception handler
- Custom exceptions:
  - `ResourceNotFoundException`
  - `ConflictException`
  - `BadRequestException`
  - `UnauthorizedException`

---

## 🔐 Authentication Feature (`auth/`)

Handles login and user authentication.

- `AuthController.java` → Login endpoints
- `AuthService.java` → Authentication logic
- DTOs:
  - `LoginResponseDto`
  - `UserProfileDto`

---

## 👤 User Management (`user/`)

Manages users in the system.
- `UserController.java` → API endpoints
- `UserService / UserServiceImpl.java`
- `UserRepository.java` → DB access
- `User.java` → Entity
- DTOs for create/update/response
- `UserMapper.java` → Entity ↔ DTO conversion

---

## 🏫 Resource Management (`resource/`)

Handles campus resources (rooms, labs, etc.)

Key files:
- `ResourceController.java`
- `ResourceServiceImpl.java`
- `ResourceRepository.java`
- `Resource.java`

Supports:
- Create / Update / Search resources

---

## 📅 Booking System (`booking/`)

Handles resource bookings.

Key files:
- `BookingController.java`
- `BookingServiceImpl.java`
- `BookingRepository.java`
- `Booking.java`

Supports:
- Create bookings
- Update booking status
- Search bookings

---

## 🎫 Ticket System (`ticket/`)

Handles issue reporting and tracking.

Key files:
- `TicketController.java`
- `TicketServiceImpl.java`
- `Ticket.java`
- `TicketComment.java`

Supports:
- Ticket creation
- Status updates
- Comments

---

## 🔔 Notification System (`notification/`)

Handles system notifications.

Key files:
- `NotificationController.java`
- `NotificationServiceImpl.java`
- `Notification.java`

---

## 🗄️ Resources & Database (`resources/`)
- `migration/` → Database schema setup
- `seed/` → Initial data

---

## 🧪 Testing (`test/`)

Unit tests for controllers.

- `ResourceControllerTest.java`
- `BookingControllerTest.java`
- `TicketControllerTest.java`
- `NotificationControllerTest.java`

---

## 🔄 How Features Are Structured

Each feature follows the same pattern:
👉 This ensures consistency across all modules.

---

## 🌐 API Design

- Follows REST principles:
  - Uses HTTP methods (`GET`, `POST`, `PUT`, `DELETE`)
  - Returns JSON responses
  - Stateless communication  [oai_citation:1‡5 - REST APIs.pdf](sediment://file_000000006bd071fabbefb90eca9adc70)

---

## ▶️ Running the Application

### 1. Navigate to backend
### 2. Run using Maven Wrapper
### 3. Access APIs
```bash
cd backend/smartcampus
./mvnw spring-boot:run
http://localhost:8080
```
