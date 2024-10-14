const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define upload folder paths
const uploadFolderBooks = 'uploads/books/books';
const uploadFolderPreviews = 'uploads/books/previews';
const uploadFolderImages = 'uploads/books/images';
const uploadFolderDescriptions = 'uploads/books/descriptions';

// Ensure the upload folders exist
const ensureDirectoryExistence = (folder) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
};

ensureDirectoryExistence(uploadFolderBooks);
ensureDirectoryExistence(uploadFolderPreviews);
ensureDirectoryExistence(uploadFolderImages);
ensureDirectoryExistence(uploadFolderDescriptions);

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folderPath = '';

    // Determine the correct folder based on the field name
    if (file.fieldname === 'book') {
      folderPath = uploadFolderBooks;
    } else if (file.fieldname === 'book_preview') {
      folderPath = uploadFolderPreviews;
    } else if (file.fieldname === 'image') {
      folderPath = uploadFolderImages;
    } else if (file.fieldname === 'description') {
      folderPath = uploadFolderDescriptions;
    } else {
      return cb(new Error('Invalid file type'), false);
    }

    cb(null, folderPath); // Save file in the determined folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate unique filename
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'book': ['application/pdf'],
    'book_preview': ['application/pdf'],
    'image': ['image/jpeg', 'image/png', 'image/jpg'],
    'description': ['image/jpeg', 'image/png', 'image/jpg']
  };

  const allowedMimeTypes = allowedTypes[file.fieldname] || [];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Helper function to delete old files
const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

router.get('/getBooks', (req, res) => {
  pool.execute(
      "SELECT * FROM Books",
      (err, result) => {
          if (err) {
              return res.status(500).json({ error: err.message });
          }

          if (result.length > 0) {
              // Return all themes
              res.status(200).json({ books: result });
          } else {
              res.status(200).json({ books: [] });
          }
      }
  );
});

// Add Book Route
router.post('/addBook', upload.fields([
  { name: 'book', maxCount: 1 },
  { name: 'book_preview', maxCount: 1 },
  { name: 'image', maxCount: 1 }, { name: 'description', maxCount: 1 }
]), (req, res) => {
  const { title, price } = req.body;
  const book = req.files['book'] ? `/uploads/books/books/${req.files['book'][0].filename}` : null;
  const book_preview = req.files['book_preview'] ? `/uploads/books/previews/${req.files['book_preview'][0].filename}` : null;
  const image = req.files['image'] ? `/uploads/books/images/${req.files['image'][0].filename}` : null;
  const description = req.files['description'] ? `/uploads/books/descriptions/${req.files['description'][0].filename}` : null;

  pool.execute(
    `INSERT INTO Books (title, description, image, book, book_preview, price) VALUES (?, ?, ?, ?, ?, ?)`,
    [title, description, image, book, book_preview, price],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ message: 'Book added successfully', bookId: result.insertId });
    }
  );
});

// Update Book Route
router.put('/updateBook/:id', upload.fields([
  { name: 'book', maxCount: 1 },
  { name: 'book_preview', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), (req, res) => {
  const { id } = req.params;
  const { title, description, price } = req.body;
  const book = req.files['book'] ? `/uploads/books/books/${req.files['book'][0].filename}` : null;
  const book_preview = req.files['book_preview'] ? `/uploads/books/previews/${req.files['book_preview'][0].filename}` : null;
  const image = req.files['image'] ? `/uploads/books/images/${req.files['image'][0].filename}` : null;

  // Get the current book data to delete old files if necessary
  pool.execute(`SELECT * FROM Books WHERE id = ?`, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const currentBook = result[0];
    if (book && currentBook.book) {
      deleteFile(path.join(uploadFolderBooks, currentBook.book));
    }
    if (book_preview && currentBook.book_preview) {
      deleteFile(path.join(uploadFolderPreviews, currentBook.book_preview));
    }
    if (image && currentBook.image) {
      deleteFile(path.join(uploadFolderImages, currentBook.image));
    }

    // Update the book information
    pool.execute(
      `UPDATE Books SET title = ?, description = ?, image = COALESCE(?, image), book = COALESCE(?, book), book_preview = COALESCE(?, book_preview), price = ? WHERE id = ?`,
      [title, description, image, book, book_preview, price, id],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'Book updated successfully' });
      }
    );
  });
});

module.exports = router;
