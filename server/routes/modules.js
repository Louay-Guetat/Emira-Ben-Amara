const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define upload folder paths
const uploadFolderVideos = 'uploads/modules/videos';
const uploadFolderEbooks = 'uploads/modules/ebooks';
const uploadFolderAssessments = 'uploads/modules/assessments';

// Ensure the upload folders exist
const ensureDirectoryExistence = (folder) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
};

ensureDirectoryExistence(uploadFolderVideos);
ensureDirectoryExistence(uploadFolderEbooks);
ensureDirectoryExistence(uploadFolderAssessments);

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folderPath = '';

    // Determine the correct folder based on the field name
    if (file.fieldname === 'video') {
      folderPath = uploadFolderVideos;
    } else if (file.fieldname === 'ebook') {
      folderPath = uploadFolderEbooks;
    } else if (file.fieldname === 'assessments') {
      folderPath = uploadFolderAssessments;
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
    'video': ['video/mp4', 'video/mkv'],
    'ebook': ['application/pdf'],
    'assessments': ['application/pdf']
  };

  const allowedMimeTypes = allowedTypes[file.fieldname] || [];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// GET: Fetch modules based on themePartID
router.get('/getModules', (req, res) => {
    const { themePartID } = req.query;

    if (!themePartID) {
        return res.status(400).json({ error: 'themeID is required' });
    }

    pool.execute(
        "SELECT * FROM modules WHERE themePartID = ?",
        [themePartID],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.length > 0) {
                res.status(200).json({ modules: result });
            } else {
                res.status(200).json({ modules: [] });
            }
        }
    );
});

// POST: Add a new module
router.post('/addModule', upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'ebook', maxCount: 1 },
  { name: 'assessments', maxCount: 1 }
]), async (req, res) => {
  const { themePartID, title, description, price } = req.body;

  try {
    const videoPath = req.files['video'] ? `/uploads/modules/videos/${req.files['video'][0].filename}` : null;
    const ebookPath = req.files['ebook'] ? `/uploads/modules/ebooks/${req.files['ebook'][0].filename}` : null;
    const assessmentPath = req.files['assessments'] ? `/uploads/modules/assessments/${req.files['assessments'][0].filename}` : null;

    const insertQuery = `
      INSERT INTO modules (themePartID, title, description, price, video, ebook, assessments)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(insertQuery, [themePartID, title, description, price, videoPath, ebookPath, assessmentPath]);

    res.status(200).json({
      message: "Module added successfully",
      module: {
        id: result.insertId,
        themePartID,
        title,
        description,
        price,
        video: videoPath,
        ebook: ebookPath,
        assessments: assessmentPath,
      }
    });
  } catch (err) {
    console.error('Error adding module:', err);
    res.status(500).json({ error: 'Failed to add module' });
  }
});

// PUT: Update an existing module
router.put('/updateModule', upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'ebook', maxCount: 1 },
  { name: 'assessments', maxCount: 1 }
]), async (req, res) => {
  const { id, title, description, price } = req.body;

  try {
    const [module] = await pool.execute("SELECT * FROM modules WHERE id = ?", [id]);
    if (!module.length) {
      return res.status(404).json({ error: "Module not found" });
    }

    const existingModule = module[0];
    const videoPath = req.files['video'] ? `/uploads/modules/videos/${req.files['video'][0].filename}` : existingModule.video;
    const ebookPath = req.files['ebook'] ? `/uploads/modules/ebooks/${req.files['ebook'][0].filename}` : existingModule.ebook;
    const assessmentPath = req.files['assessments'] ? `/uploads/modules/assessments/${req.files['assessments'][0].filename}` : existingModule.assessments;

    const updateQuery = `
      UPDATE modules
      SET title = ?, description = ?, price = ?, video = ?, ebook = ?, assessments = ?, updated_at = NOW()
      WHERE id = ?
    `;

    await pool.execute(updateQuery, [title, description, price, videoPath, ebookPath, assessmentPath, id]);

    res.status(200).json({
      message: "Module updated successfully",
      module: {
        id,
        title,
        description,
        price,
        video: videoPath,
        ebook: ebookPath,
        assessments: assessmentPath
      }
    });
  } catch (err) {
    console.error('Error updating module:', err);
    res.status(500).json({ error: 'Failed to update module' });
  }
});

module.exports = router;
