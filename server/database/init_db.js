const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const db = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    password: 'Louay13017576',
    database: 'Emira-Ben-Amara'
});

const saltRounds = 10;

const createTableSQL = `
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(8),
    role VARCHAR(8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const checkAdminExistSQL = "SELECT * FROM users WHERE id = 1";
const insertAdminSQL = `
INSERT INTO users (id, username, email, password, phone, role)
VALUES (1, 'Emira', 'Emira@gmail.com', ?, '12345678', 'admin');
`;

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }

    console.log('Connected to the database.');

    db.query(createTableSQL, (err, results) => {
        if (err) {
            console.error('Error creating table:', err);
            return;
        }

        console.log('Table created or already exists.');

        // Check if the admin user exists
        db.query(checkAdminExistSQL, (err, results) => {
            if (err) {
                console.error('Error checking admin existence:', err);
                return;
            }

            if (results.length > 0) {
                console.log('Admin user already exists.');
                db.end();
                return;
            }

            const adminPassword = 'Louay1998'; // Replace with your desired password
            bcrypt.hash(adminPassword, saltRounds, (err, hashedPassword) => {
                if (err) {
                    console.error('Error hashing password:', err);
                    return;
                }

                db.query(insertAdminSQL, [hashedPassword], (err, results) => {
                    if (err) {
                        console.error('Error inserting admin user:', err);
                    } else {
                        console.log('Admin user created successfully.');
                    }

                    db.end();
                });
            });
        });
    });
});
