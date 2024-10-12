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
    phone VARCHAR(100),
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
    price FLOAT NOT NULL,
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

const createUserThemes_purchasesTable = 
`CREATE TABLE IF NOT EXISTS user_themes_purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    theme_id INT NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_theme_purchase_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_theme_purchase_theme FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE,
    UNIQUE (user_id, theme_id)
);`

const createUserEvents_purchasesTable = 
`CREATE TABLE IF NOT EXISTS user_events_purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_event_purchase_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_event_purchase_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE (user_id, event_id)
);`

const createAppointmentTable = `
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    appointement_link VARCHAR(255) NOT NULL UNIQUE,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);`;

const createEventsTable = `
CREATE TABLE IF NOT EXISTS events(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255), 
    price FLOAT NOT NULL,
    date_event DATETIME NOT NULL,
    event_link VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);`;

const createDisponibiliteTable = `
CREATE TABLE IF NOT EXISTS disponibilite(
    id INT AUTO_INCREMENT PRIMARY KEY,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL
);`;

const createBlogsTable = `
CREATE TABLE IF NOT EXISTS blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR(255) NOT NULL,
    view INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

const createSectionsTable = `
CREATE TABLE IF NOT EXISTS sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    blog_id INT NOT NULL,
    text TEXT NOT NULL,
    image VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
);`

const createBooksTable = `
CREATE TABLE IF NOT EXISTS Books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR(255) NOT NULL,
    book VARCHAR(255) NOT NULL,
    book_preview VARCHAR(255) NOT NULL,
    price FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`

const createUserBooks_purchasesTable = 
`CREATE TABLE IF NOT EXISTS usersBooks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_book_purchase_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_book_purchase_book FOREIGN KEY (book_id) REFERENCES Books(id) ON DELETE CASCADE,
    UNIQUE (user_id, book_id)
);`

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

    db.query(createEventsTable, (err, results) => {
        if (err) {
            console.error('Error creating Events table:', err);
            return;
        }

        console.log('Events Table created or already exists.');
    });   

    db.query(createUserThemes_purchasesTable, (err, results) => {
        if (err) {
            console.error('Error creating v table:', err);
            return;
        }

        console.log('UserThemes Purchase Table created or already exists.');
    });    

    db.query(createUserEvents_purchasesTable, (err, results) => {
        if (err) {
            console.error('Error creating UserEvents table:', err);
            return;
        }

        console.log('UserEvents Purchase Table created or already exists.');
    });

    db.query(createDisponibiliteTable, (err, results) => {
        if (err) {
            console.error('Error creating Disponibilite table:', err);
            return;
        }
    
        console.log('Disponibilite Table created or already exists.');
    });

    db.query(createBlogsTable, (err, results) => {
        if (err) {
            console.error('Error creating Blogs table:', err);
            return;
        }

        console.log('Blogs Table created or already exists.');
    });  
    db.query(createSectionsTable, (err, results) => {
        if (err) {
            console.error('Error creating Sections table:', err);
            return;
        }

        console.log('Sections Table created or already exists.');
    });  

    db.query(createBooksTable, (err, results) => {
        if (err) {
            console.error('Error creating Books table:', err);
            return;
        }

        console.log('Books Table created or already exists.');
    });  

    db.query(createUserBooks_purchasesTable, (err, results) => {
        if (err) {
            console.error('Error creating UsersBooks table:', err);
            return;
        }

        console.log('UsersBooks Table created or already exists.');
    });  
});
