# Smart Campus Operations Hub
**IT3030 - Programming Applications and Frameworks (2026)**

## Project Overview
A production-inspired web system to manage university facility bookings and maintenance incident handling.

### Tech Stack
- **Backend:** Spring Boot (Java) REST API 
- **Frontend:** React.js 
- **Database:** [Choice, e.g., MySQL or MongoDB] 
- **Auth:** OAuth 2.0 (Google Sign-in) 
- **CI/CD:** GitHub Actions 

### [cite_start]Team Contribution [cite: 75, 80, 83]
| Member | Assigned Module | Key Endpoints |
| :--- | :--- | :--- |
| Member 1 | Module A: Facilities & Assets  | GET /assets, POST /assets... |
| Member 2 | Module B: Booking Management  | POST /bookings, PUT /bookings... |
| Member 3 | Module C: Maintenance & Incidents  | POST /tickets, PATCH /tickets... |
| Member 4 | Module D & E: Notifications & Auth | GET /notifications... |

## Setup Instructions
1. Clone the repository.
2. **Backend:** Navigate to `/backend`, run `./mvnw spring-boot:run`.
3. **Frontend:** Navigate to `/frontend`, run `npm install` and `npm start`.
