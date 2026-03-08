# Smart Campus Operations Hub
**IT3030 - Programming Applications and Frameworks (2026)**

## Project Overview
[cite_start]A production-inspired web system to manage university facility bookings and maintenance incident handling[cite: 18, 19].

### Tech Stack
- [cite_start]**Backend:** Spring Boot (Java) REST API [cite: 11, 16]
- [cite_start]**Frontend:** React.js [cite: 11, 17]
- [cite_start]**Database:** [Insert Choice, e.g., MySQL or MongoDB] [cite: 71]
- [cite_start]**Auth:** OAuth 2.0 (Google Sign-in) [cite: 48]
- [cite_start]**CI/CD:** GitHub Actions [cite: 62]

### [cite_start]Team Contribution [cite: 75, 80, 83]
| Member | Assigned Module | Key Endpoints |
| :--- | :--- | :--- |
| Member 1 | [cite_start]Module A: Facilities & Assets [cite: 76] | GET /assets, POST /assets... |
| Member 2 | [cite_start]Module B: Booking Management [cite: 77] | POST /bookings, PUT /bookings... |
| Member 3 | [cite_start]Module C: Maintenance & Incidents [cite: 78] | POST /tickets, PATCH /tickets... |
| Member 4 | [cite_start]Module D & E: Notifications & Auth [cite: 79] | GET /notifications... |

## Setup Instructions
1. Clone the repository.
2. **Backend:** Navigate to `/backend`, run `./mvnw spring-boot:run`.
3. **Frontend:** Navigate to `/frontend`, run `npm install` and `npm start`.
