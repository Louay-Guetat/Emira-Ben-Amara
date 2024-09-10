const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define upload folder path
const uploadFolder = 'uploads/themeParts/';

// Ensure the upload folder exists
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}
// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/themeParts');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const getImagePathFromDb = (themePartId, callback) => {
    const selectQuery = "SELECT image FROM themeParts WHERE id = ?";
    pool.execute(selectQuery, [themePartId], (err, results) => {
        if (err) {
            return callback(err);
        }
        callback(null, results[0]?.image);
    });
};

const upload = multer({ storage: storage });

router.get('/getThemeParts', (req, res) => {
    const { themeID } = req.query;

    if (!themeID) {
        return res.status(400).json({ error: 'themeID is required' });
    }

    pool.execute(
        "SELECT * FROM themeParts WHERE themeID = ?",
        [themeID],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.length > 0) {
                res.status(200).json({ themeParts: result });
            } else {
                res.status(200).json({ themeParts: [] });
            }
        }
    );
});

router.post('/addThemePart', upload.single('image'), (req, res) => {
    const { title, description, themeID } = req.body;
    const imageUrl = req.file ? `/uploads/themeParts/${req.file.filename}` : null;
    
    if (!title || !description || !themeID) {
        return res.status(400).json({ error: 'Title, description, and themeID are required.' });
    }

    const insertQuery = "INSERT INTO themeParts (title, description, image, themeID) VALUES (?, ?, ?, ?)";
    pool.execute(insertQuery, [title, description, imageUrl, themeID], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Fetch the newly added themePart
        const selectQuery = "SELECT * FROM themeParts WHERE id = ?";
        pool.execute(selectQuery, [result.insertId], (err, themeParts) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Return the newly added themePart
            res.status(200).json({ themePart: themeParts[0] });
        });
    });
});

router.put('/updateThemePart', upload.single('image'), (req, res) => {
    const { id, title, description } = req.body;
    const newImageUrl = req.file ? `/uploads/themeParts/${req.file.filename}` : null;
    
    // Validate input
    if (!title || !description) {
        return res.status(400).json({ error: 'Title, description are required.' });
    }

    // Get the old image URL to delete it if a new image is provided
    getImagePathFromDb(id, (err, oldImageUrl) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Delete the old image if it exists and a new image is provided
        if (oldImageUrl && newImageUrl) {
            // Remove '/uploads/themeParts/' prefix to get the filename
            const oldImageFilename = oldImageUrl.replace('/uploads/themeParts/', '');
            const oldImagePath = path.join(__dirname, '..', 'uploads', 'themeParts', oldImageFilename);

            fs.unlink(oldImagePath, (err) => {
                if (err) {
                    console.error(`Failed to delete old image: ${err}`);
                    // Log the path of the old image for debugging
                    console.error(`Old image path: ${oldImagePath}`);
                }
            });
        }

        // Update the themePart in the database
        const updateQuery = "UPDATE themeParts SET title = ?, description = ?, image = ? WHERE id = ?";
        pool.execute(updateQuery, [title, description, newImageUrl || oldImageUrl, id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Fetch the updated themePart
            const selectQuery = "SELECT * FROM themeParts WHERE id = ?";
            pool.execute(selectQuery, [id], (err, themeParts) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                // Return the updated themePart
                res.status(200).json({ themePart: themeParts[0] });
            });
        });
    });
});


module.exports = router;
