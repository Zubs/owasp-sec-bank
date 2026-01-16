# OWASP Sec Bank

This is a database-driven web application developed as a research artefact for my B.Sc. Computer Science dissertation.

The project addresses the gap between theoretical security guidelines and practical implementations. It utilizes an *
*A/B testing methodology**, where two parallel versions of the same banking application will be built to facilitate a
direct comparison of vulnerability behavior and mitigation effectiveness.

1. **Version A (Vulnerable):** Intentionally incorporates insecure design patterns, weak authentication, inline SQL
   queries, etc.
2. **Version B (Secure):** Implements industry best practices, including RBAC, parameterized queries, secure session
   management, etc.

## Technologies used

- Frontend: Vue.js
- Backend: Expressjs
- Database: PostgresQL

## Testing and Documentation

### Insecure

#### API Documentation

- [Postman](https://documenter.getpostman.com/view/33365941/2sBXVZpuxT)
- Swagger: Run the app and go to `/api-docs`

#### Frontend

- [Netlify](https://owasp-insecure.netlify.app)

### Secure

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
        - [ ] Upload profile picture/avatar
        - [ ] View profile picture/avatar
    - [ ] View account details
- [ ] Admin Dashboard
    - [ ] View all users
    - [ ] View all transactions
    - [ ] View all system logs

### Insecure

- [ ] Landing page
- [x] Authentication
    - [x] Register
        - [x] Create Account
    - [x] Login
    - [x] Logout
- [x] Dashboard
    - [x] Money transfer
        - [x] Lookup account (recipient)
    - [x] Transaction history
    - [x] View/Manage profile
        - [x] Upload profile picture/avatar
        - [x] View profile picture/avatar
    - [x] View account details
- [x] Admin Dashboard
    - [x] View all users
    - [x] View all transactions
    - [x] View all system logs

## DB Schemas

- Users
- Accounts
- Transactions
- Logs
- Tokens
