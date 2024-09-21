const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define upload folder path
const uploadFolder = 'uploads/themes/';

// Ensure the upload folder exists
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder); // Use the defined upload folder path
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Save the file with a timestamp to avoid conflicts
    }
});

const getImagePathFromDb = (themeId, callback) => {
    const selectQuery = "SELECT image FROM themes WHERE id = ?";
    pool.execute(selectQuery, [themeId], (err, results) => {
        if (err) {
            return callback(err);
        }
        callback(null, results[0]?.image);
    });
};

const upload = multer({ storage: storage });

router.get('/getThemes', (req, res) => {
    pool.execute(
        "SELECT * FROM themes",
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.length > 0) {
                // Return all themes
                res.status(200).json({ themes: result });
            } else {
                res.status(200).json({ themes: [] });
            }
        }
    );
});

router.post('/addTheme', upload.single('image'), (req, res) => {
    const { title, description, price } = req.body;
    const imageUrl = req.file ? `/uploads/themes/${req.file.filename}` : null; // Get image URL if uploaded

    // Validate input
    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required.' });
    }

    // Insert the new theme into the database
    const insertQuery = "INSERT INTO themes (title, description, price, image) VALUES (?, ?, ?, ?)";
    pool.execute(insertQuery, [title, description, price, imageUrl], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Fetch the newly added theme
        const selectQuery = "SELECT * FROM themes WHERE id = ?";
        pool.execute(selectQuery, [result.insertId], (err, themes) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Return the newly added theme
            res.status(200).json({ theme: themes[0] });
        });
    });
});

router.put('/updateTheme', upload.single('image'), (req, res) => {
    const { id, title, description, price } = req.body;
    const newImageUrl = req.file ? `/uploads/themes/${req.file.filename}` : null;

    // Validate input
    if (!title || !description || !price) {
        return res.status(400).json({ error: 'Title and description are required.' });
    }

    // Get the old image URL to delete it if a new image is provided
    getImagePathFromDb(id, (err, oldImageUrl) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Delete the old image if it exists and a new image is provided
        if (oldImageUrl && newImageUrl) {
            // Remove '/uploads/themes/' prefix to get the filename
            const oldImageFilename = oldImageUrl.replace('/uploads/themes/', '');
            const oldImagePath = path.join(__dirname, '..', 'uploads', 'themes', oldImageFilename);

            fs.unlink(oldImagePath, (err) => {
                if (err) {
                    console.error(`Failed to delete old image: ${err}`);
                    // Log the path of the old image for debugging
                    console.error(`Old image path: ${oldImagePath}`);
                }
            });
        }

        // Update the theme in the database
        const updateQuery = "UPDATE themes SET title = ?, description = ?, price = ?, image = ? WHERE id = ?";
        pool.execute(updateQuery, [title, description, price, newImageUrl || oldImageUrl, id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Fetch the updated theme
            const selectQuery = "SELECT * FROM themes WHERE id = ?";
            pool.execute(selectQuery, [id], (err, themes) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                // Return the updated theme
                res.status(200).json({ theme: themes[0] });
            });
        });
    });
});


module.exports = router;
