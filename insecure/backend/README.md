# Vulnerable app

## API Documentation
[https://documenter.getpostman.com/view/33365941/2sBXVZpuxT](https://documenter.getpostman.com/view/33365941/2sBXVZpuxT)

## Vulnerabilities

### 1. Broken Access Control

### 2. Cryptographic Failures

- Storing password as plain text
- Storing JWT SECRET in plain code

```javascript
const JWT_SECRET = 'super_secret_key_123';
```

### 3. Injection

- Concatenating user input directly into the SQL string.

```javascript
const query = `
    INSERT INTO users (username, password, full_name, email)
    VALUES ('${username}', '${password}', '${full_name}', '${email}') RETURNING *;
`;
```

```javascript
const query = `DELETE FROM tokens WHERE token = '${token}'`;
```

#### Exploitation

- Attacker can input `' OR '1'='1` as the username to bypass login.

### 4. Insecure Design

### 5. Security Misconfiguration

- Returning the raw database errors.

```javascript
try {
    const result = await pool.query(query);
    res.status(201).json({ message: 'User registered', user: result.rows[0] });
} catch (error) {
    res.status(500).json({ error: error.message, detail: error });
}
```

### 6. Vulnerable and Outdated Components

### 7. Identification and Authentication Failures

- Storing password as plain text
- Returning the full user object often exposes the password or other sensitive info in the response.
- Extremely long JWT expiration date

```javascript
const token = jwt.sign(
    { userId: user.user_id, role: user.role },
    JWT_SECRET,
    { expiresIn: '30d' }
);
```

### 8. Software and Data Integrity Failures

### 9. Security Logging and Monitoring Failures

- No logging

### 10. Server-Side Request Forgery (SSRF)
