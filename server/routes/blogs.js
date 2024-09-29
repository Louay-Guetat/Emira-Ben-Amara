const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define upload folder path
const uploadFolder = 'uploads/blogs/';

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
        const blogID = req.body.blogID || req.body.id;
        const fileName = blogID ? `${blogID}_${Date.now()}${path.extname(file.originalname)}` : `${Date.now()}${path.extname(file.originalname)}`;
        cb(null, fileName);
    }
});

const getImagePathFromDb = (blogId, callback) => {
    const selectQuery = "SELECT image FROM blogs WHERE id = ?";
    pool.execute(selectQuery, [blogId], (err, results) => {
        if (err) {
            return callback(err);
        }
        callback(null, results[0]?.image);
    });
};

const upload = multer({ storage: storage });

router.get('/getBlogs', (req, res) => {
    pool.execute(
        "SELECT * FROM blogs",
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.length > 0) {
                // Return all blogs
                res.status(200).json({ blogs: result });
            } else {
                res.status(200).json({ blogs: [] });
            }
        }
    );
});

router.get('/getLatestBlogs', (req, res) => {
    pool.execute(
        "SELECT * FROM blogs ORDER BY created_at DESC LIMIT 2;",
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.length > 0) {
                // Return all blogs
                res.status(200).json({ blogs: result });
            } else {
                res.status(200).json({ blogs: [] });
            }
        }
    );
});

router.post('/addBlog', upload.single('image'), (req, res) => {
    const { title, description } = req.body;
    const imageUrl = req.file ? `/uploads/blogs/${req.file.filename}` : null;

    // Validate input
    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required.' });
    }

    // Insert the new blog into the database
    const insertQuery = "INSERT INTO blogs (title, description, image) VALUES (?, ?, ?)";
    pool.execute(insertQuery, [title, description, imageUrl], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Fetch the newly added blog
        const selectQuery = "SELECT * FROM blogs WHERE id = ?";
        pool.execute(selectQuery, [result.insertId], (err, blogs) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Return the newly added blog
            res.status(200).json({ blog: blogs[0] });
        });
    });
});

router.put('/updateBlog', upload.single('image'), (req, res) => {
    const { id, title, description } = req.body;
    const newImageUrl = req.file ? `/uploads/blogs/${req.file.filename}` : null;

    // Validate input
    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required.' });
    }

    // Get the old image URL to delete it if a new image is provided
    getImagePathFromDb(id, (err, oldImageUrl) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Delete the old image if it exists and a new image is provided
        if (oldImageUrl && newImageUrl) {
            const oldImageFilename = oldImageUrl.replace('/uploads/blogs/', '');
            const oldImagePath = path.join(__dirname, '..', 'uploads', 'blogs', oldImageFilename);

            fs.unlink(oldImagePath, (err) => {
                if (err) {
                    console.error(`Failed to delete old image: ${err}`);
                    // Log the path of the old image for debugging
                    console.error(`Old image path: ${oldImagePath}`);
                }
            });
        }

        // Update the blog in the database
        const updateQuery = "UPDATE blogs SET title = ?, description = ?, image = ? WHERE id = ?";
        pool.execute(updateQuery, [title, description, newImageUrl || oldImageUrl, id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Fetch the updated blog
            const selectQuery = "SELECT * FROM blogs WHERE id = ?";
            pool.execute(selectQuery, [id], (err, blogs) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                // Return the updated blog
                res.status(200).json({ blog: blogs[0] });
            });
        });
    });
});

router.put('/updateBlogViews', (req, res) => {
    const { blogID } = req.body;

    // Validate input
    if (!blogID) {
        return res.status(400).json({ error: 'BlogID are required.' });
    }
    const selectQuery = "SELECT * FROM blogs WHERE id = ?";
    pool.execute(selectQuery, [blogID], (err, blogs) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }   
        const blog = blogs[0]
        const updateQuery = "UPDATE blogs SET views = ? WHERE id = ?";
        pool.execute(updateQuery, [blog.views+1, blogID], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ views: blog.views+1 });            
        });
    });    
});

router.get('/getAllBlogSections', (req, res) => {
    pool.execute(
        "SELECT * FROM sections",
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.length > 0) {
                // Return all themes
                res.status(200).json({ blogSections: result });
            } else {
                res.status(200).json({ blogSections: [] });
            }
        }
    );
});

router.get('/getBlogSections', (req, res) => {
    const { blogID } = req.query;

    if (!blogID) {
        return res.status(400).json({ error: 'blogID is required' });
    }

    pool.execute(
        "SELECT * FROM sections WHERE blog_id = ?",
        [blogID],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.length > 0) {
                res.status(200).json({ blogSections: result });
            } else {
                res.status(200).json({ blogSections: [] });
            }
        }
    );
});

router.post('/addBlogSection', upload.single('image'), (req, res) => {
    const { text, blogID } = req.body;
    const imageUrl = req.file ? `/uploads/blogs/${req.file.filename}` : null;
    
    if (!text || !blogID) {
        return res.status(400).json({ error: 'text, and blogID are required.' });
    }

    const insertQuery = "INSERT INTO sections (text, image, blog_id) VALUES (?, ?, ?)";
    pool.execute(insertQuery, [text, imageUrl, blogID], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Fetch the newly added themePart
        const selectQuery = "SELECT * FROM sections WHERE id = ?";
        pool.execute(selectQuery, [result.insertId], (err, blogSections) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Return the newly added themePart
            res.status(200).json({ blogSection: blogSections[0] });
        });
    });
});

router.put('/updateBlogSection', upload.single('image'), (req, res) => {
    const { id, text, blogID } = req.body;
    const newImageUrl = req.file ? `/uploads/blogs/${req.file.filename}` : null;
    
    // Validate input
    if (!text || !blogID) {
        return res.status(400).json({ error: 'Text is required.' });
    }

    // Get the old image URL to delete it if a new image is provided
    getImagePathFromDb(id, (err, oldImageUrl) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Delete the old image if it exists and a new image is provided
        if (oldImageUrl && newImageUrl) {
            // Remove '/uploads/themeParts/' prefix to get the filename
            const oldImageFilename = oldImageUrl.replace('/uploads/blogs/', '');
            const oldImagePath = path.join(__dirname, '..', 'uploads', 'blogs', oldImageFilename);

            fs.unlink(oldImagePath, (err) => {
                if (err) {
                    console.error(`Failed to delete old image: ${err}`);
                    // Log the path of the old image for debugging
                    console.error(`Old image path: ${oldImagePath}`);
                }
            });
        }

        // Update the themePart in the database
        const updateQuery = "UPDATE sections SET text = ?, image = ? WHERE id = ?";
        pool.execute(updateQuery, [text, newImageUrl || oldImageUrl, id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Fetch the updated themePart
            const selectQuery = "SELECT * FROM sections WHERE id = ?";
            pool.execute(selectQuery, [id], (err, blogSections) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                // Return the updated themePart
                res.status(200).json({ blogSection: blogSections[0] });
            });
        });
    });
});

module.exports = router;
