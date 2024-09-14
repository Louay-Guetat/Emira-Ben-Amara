const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const db = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    password: 'Louay13017576',
    database: 'Emira-Ben-Amara'
});

const saltRounds = 10;

const createUserTable = `
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(8),
    role VARCHAR(8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

const checkAdminExistSQL = "SELECT * FROM users WHERE id = 1";
const insertAdminSQL = `
INSERT INTO users (id, username, email, password, phone, role)
VALUES (1, 'Emira', 'Emira@gmail.com', ?, '12345678', 'admin');`;

const createThemesTable = `
CREATE TABLE IF NOT EXISTS themes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    image VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

const createThemePartsTable = `
CREATE TABLE IF NOT EXISTS themeParts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    themeID INT NOT NULL,
    title VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_theme FOREIGN KEY (themeID) REFERENCES themes(id) ON DELETE CASCADE
);`;

const createModuleTable = `
CREATE TABLE IF NOT EXISTS modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    themePartID INT NOT NULL,
    title VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    video VARCHAR(255) NOT NULL,
    price FLOAT NOT NULL,
    ebook VARCHAR(255),
    assessments VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_themePart FOREIGN KEY (themePartID) REFERENCES themeParts(id) ON DELETE CASCADE
);`;

const createAppointmentTable = `
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(255) NOT NULL UNIQUE,
    desired_date DATETIME NOT NULL,
    confirmed_date DATETIME,
    user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);`;

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }

    console.log('Connected to the database.');

    db.query(createUserTable, (err, results) => {
        if (err) {
            console.error('Error creating table:', err);
            return;
        }

        console.log('Users Table created or already exists.');

        // Check if the admin user exists
        db.query(checkAdminExistSQL, (err, results) => {
            if (err) {
                console.error('Error checking admin existence:', err);
                return;
            }

            if (results.length > 0) {
                console.log('Admin user exists.');
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

    db.query(createThemesTable, (err, results) => {
        if (err) {
            console.error('Error creating Themes table:', err);
            return;
        }

        console.log('Themes Table created or already exists.');
    });

    db.query(createThemePartsTable, (err, results) => {
        if (err) {
            console.error('Error creating themeParts table:', err);
            return;
        }

        console.log('themeParts Table created or already exists.');
    });

    db.query(createModuleTable, (err, results) => {
        if (err) {
            console.error('Error creating Modules table:', err);
            return;
        }

        console.log('Modules Table created or already exists.');
    });

    db.query(createAppointmentTable, (err, results) => {
        if (err) {
            console.error('Error creating Appointments table:', err);
            return;
        }

        console.log('Appointments Table created or already exists.');
    });    
});
