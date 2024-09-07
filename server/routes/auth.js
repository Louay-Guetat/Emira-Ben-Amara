const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../database/db');
const secretKey = 'your_secret_key'; 

const router = express.Router();
const saltRounds = 10;

// Login Route
router.post('/login', (req, res) => {
  const { usernameOrEmail, password } = req.body;

  pool.execute(
    "SELECT * FROM users WHERE username = ? OR email = ?",
    [usernameOrEmail, usernameOrEmail],
    (err, result) => {
      if (err) {
        return res.status(500).json({ err: err.message });
      }

      if (result.length > 0) {
        const user = result[0];

        // Compare hashed password with the provided password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            return res.status(500).json({ err: err.message });
          }

          if (isMatch) {
            const token = jwt.sign({ id: user.id, username: user.username }, secretKey, {
              expiresIn: '1d',
            });

            return res.status(200).json({ token, user });
          } else {
            return res.status(401).json({ message: "Wrong username/password combination!" });
          }
        });
      } else {
        return res.status(401).json({ message: "Wrong username/password combination!" });
      }
    }
  );
});


// Register Route
router.post('/register', (req, res) => {
  const { username, password, email, phone } = req.body;

  // Hash the password before storing
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).json({ err: err.message });
    }

    pool.execute(
      "INSERT INTO users (username, password, email, phone, role) VALUES (?, ?, ?, ?, ?)",
      [username, hashedPassword, email, phone, 'user'],
      (err, result) => {
        if (err) {
          console.error('Error during user registration:', err);
          return res.status(500).json({ err: err.message });
        }

        res.status(201).json({ message: "User registered successfully!" });
      }
    );
  });
});

// Middleware to verify token from cookie
const verifyCookie = (req, res, next) => {
  const token = req.cookies['token']; // Name of your cookie

  if (!token) {
      return res.status(403).json({ message: 'No token provided!' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
          return res.status(401).json({ message: 'Unauthorized!' });
      }

      req.userId = decoded.id; // Save user ID for use in other routes
      next();
  });
};

router.get('/user', verifyCookie, (req, res) => {
  const userId = req.userId;
  pool.execute(
      "SELECT id, username, email, phone, role FROM users WHERE id = ?",
      [userId],
      (err, result) => {
          if (err) {
              return res.status(500).json({ err: err.message });
          }

          if (result.length > 0) {
              const user = result[0];
              res.status(200).json({ user });
          } else {
              res.status(404).json({ message: 'User not found!' });
          }
      }
  );
});

router.post('/logout', (req, res) => {
  res.cookie('token', '', { expires: new Date(0), httpOnly: true, sameSite: 'Strict' });
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
