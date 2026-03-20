## Database Setup

The project uses **MySQL** as the relational database.  
To keep the database consistent for all team members, the schema and seed data are version-controlled in the repository.

### Database Structure
- **schema.sql** → contains all table definitions (users, roles, resources, bookings, tickets, etc.)
- **seed.sql** → inserts initial roles, sample users, and example resources

---

### Setup Instructions

#### 1. Create the database and tables

```bash
mysql -u root -p < database/schema.sql
```
#### 2. Insert seed data

````
mysql -u root -p < database/seed.sql
````
#### Environment Variables

Do not store real database passwords in GitHub. Use .env locally.

.env.example
This file should be committed to GitHub as a template.
 ##### run and fill in their own local database password to get started immediately.
```` 
cp .env.example .env 
````
