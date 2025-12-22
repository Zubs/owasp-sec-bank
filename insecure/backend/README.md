# Vulnerable app

## Vulnerabilities

### 1. Broken Access Control
### 2. Cryptographic Failures
- Storing password as plain text

### 3. Injection
- Concatenating user input directly into the SQL string.

```javascript
const query = `
    INSERT INTO users (username, password, full_name, email)
    VALUES ('${username}', '${password}', '${full_name}', '${email}') RETURNING *;
`;
```

#### Exploitation
- Attacker can input `' OR '1'='1` as the username to bypass login.

### 4. Insecure Design
### 5. Security Misconfiguration
- Returning the raw database errors.

```javascript
try {
    const result = await pool.query(query);
    res.status(201).json({message: 'User registered', user: result.rows[0]});
} catch (error) {
    res.status(500).json({error: error.message, detail: error});
}
```

### 6. Vulnerable and Outdated Components
### 7. Identification and Authentication Failures
- Storing password as plain text
- Returning the full user object often exposes the password or other sensitive info in the response.

### 8. Software and Data Integrity Failures
### 9. Security Logging and Monitoring Failures
- No logging

### 10. Server-Side Request Forgery (SSRF)
