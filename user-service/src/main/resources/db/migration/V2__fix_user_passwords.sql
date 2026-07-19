-- Update the password hashes for the default users to match 'admin123' and 'user123' respectively
UPDATE users 
SET password = '$2a$10$Gp8SJn8vpI2NdQrDaEPgYOKpQjszbqKPphl67p/8qqXbyIWBjAgsu'
WHERE username = 'admin';

UPDATE users 
SET password = '$2a$10$B3pC69ELpWfV9dCHb5hm6eFSv6gtEZs5siZC4sSIX0/QGQ6WpvVfC'
WHERE username = 'user';
