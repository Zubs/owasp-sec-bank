/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.sql(`
        CREATE TABLE users
        (
            user_id    SERIAL PRIMARY KEY,
            username   VARCHAR(50)  NOT NULL UNIQUE,
            password   VARCHAR(255) NOT NULL,
            full_name  VARCHAR(100) NOT NULL,
            email      VARCHAR(255) NOT NULL UNIQUE,
            role       VARCHAR(20) DEFAULT 'user',
            created_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
        );
    `);

    pgm.sql(`
        CREATE TABLE accounts
        (
            account_id     SERIAL PRIMARY KEY,
            user_id        INTEGER     NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
            account_number VARCHAR(20) NOT NULL UNIQUE,
            sort_code      VARCHAR(10) NOT NULL,
            account_type   VARCHAR(20) NOT NULL,
            balance        DECIMAL(10, 2) DEFAULT 0.00,
            created_at     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
        );
    `);

    pgm.sql(`
        CREATE TABLE transactions
        (
            transaction_id  SERIAL PRIMARY KEY,
            from_account_id INTEGER REFERENCES accounts (account_id),
            to_account_id   INTEGER        NOT NULL REFERENCES accounts (account_id),
            amount          DECIMAL(10, 2) NOT NULL,
            description     TEXT,
            status          VARCHAR(20) DEFAULT 'completed',
            timestamp       TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
        );
    `);

    pgm.sql(`
        CREATE TABLE system_logs
        (
            log_id      SERIAL PRIMARY KEY,
            event_type  VARCHAR(50) NOT NULL,
            user_id     INTEGER REFERENCES users (user_id),
            description TEXT,
            ip_address  VARCHAR(45),
            timestamp   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    pgm.sql(`
        CREATE TABLE tokens
        (
            token_id   SERIAL PRIMARY KEY,
            user_id    INTEGER REFERENCES users (user_id) ON DELETE CASCADE,
            token      TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.sql('DROP TABLE IF EXISTS tokens;');
    pgm.sql('DROP TABLE IF EXISTS system_logs;');
    pgm.sql('DROP TABLE IF EXISTS transactions;');
    pgm.sql('DROP TABLE IF EXISTS accounts;');
    pgm.sql('DROP TABLE IF EXISTS users;');
};
