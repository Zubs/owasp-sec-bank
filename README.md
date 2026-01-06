# OWASP Sec Bank
This is a database-driven web application developed as a research artefact for my B.Sc. Computer Science dissertation.

The project addresses the gap between theoretical security guidelines and practical implementations. It utilizes an **A/B testing methodology**, where two parallel versions of the same banking application will be built to facilitate a direct comparison of vulnerability behavior and mitigation effectiveness.

1. **Version A (Vulnerable):** Intentionally incorporates insecure design patterns, weak authentication, inline SQL queries, etc.
2. **Version B (Secure):** Implements industry best practices, including RBAC, parameterized queries, secure session management, etc.

## Technologies used
- Frontend: Vue.js
- Backend: Expressjs
- Database: PostgresQL

## API Documentation
- [Postman](https://documenter.getpostman.com/view/33365941/2sBXVZpuxT)
- Swagger: Run the app and go to `/api-docs`

## Features/Requirements (To-dos)

### Secure
- [ ] Landing page
- [ ] Authentication
    - [ ] Register
        - [ ] Create Account
    - [ ] Login
    - [ ] Logout
- [ ] Dashboard
    - [ ] Money transfer
      - [ ] Lookup account (recipient)
    - [ ] Transaction history
    - [ ] View/Manage profile
    - [ ] View account details
- [ ] Admin Dashboard

### Insecure
- [ ] Landing page
- [x] Authentication
  - [x] Register
    - [x] Create Account
  - [x] Login
  - [x] Logout
- [ ] Dashboard
  - [x] Money transfer
    - [x] Lookup account (recipient)
  - [x] Transaction history
  - [ ] View/Manage profile
  - [x] View account details
- [ ] Admin Dashboard

## DB Schemas
- Users
- Accounts
- Transactions
- Logs
- Tokens
