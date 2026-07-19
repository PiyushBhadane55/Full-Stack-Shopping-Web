CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a default admin and default user for testing
-- The passwords are BCrypt hashes of 'admin123' and 'user123' respectively
INSERT INTO users (username, password, email, full_name, role) VALUES 
('admin', '$2a$10$wN2J2F1uW8x8gY1d0r2jE.K/wP5uVq2qBf.Kqg23P.OOm/0p7D7jC', 'admin@shopping.com', 'System Admin', 'ADMIN'),
('user', '$2a$10$B00Z56rX.K6oQo.e8gOQCe2G9tqK/vM1R7rG4p8p8o52pZqG1l3Jy', 'user@shopping.com', 'Regular User', 'USER');
