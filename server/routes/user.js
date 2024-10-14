const express = require('express');
const router = express.Router();
const pool = require('../database/db');

router.get('/getOwned', async (req, res) => {
    const { userID } = req.query;

    try {
        // Execute the queries in parallel using Promise.all
        const [booksResult, appointmentsResult, themesResult] = await Promise.all([
            new Promise((resolve, reject) => {
                // Join usersBooks with the books table to get book details
                const booksQuery = `
                    SELECT b.*
                    FROM usersBooks ub
                    LEFT JOIN Books b ON ub.book_id = b.id
                    WHERE ub.user_id = ?
                `;
                pool.execute(booksQuery, [userID], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            }),
            new Promise((resolve, reject) => {
                pool.execute(`SELECT * FROM appointments WHERE user_id = ?`, [userID], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            }),
            new Promise((resolve, reject) => {
                // Retrieve purchased themes with their parts and modules
                const query = `
                    SELECT 
                        t.id AS themeId, t.title AS themeTitle, t.description AS themeDescription, t.image AS themeImage, t.price AS themePrice,
                        tp.id AS partId, tp.title AS partTitle, tp.description AS partDescription, tp.image AS partImage,
                        m.id AS moduleId, m.title AS moduleTitle, m.description AS moduleDescription, m.video AS moduleVideo, m.price AS modulePrice, m.ebook AS moduleEbook, m.assessments AS moduleAssessments
                    FROM user_themes_purchases utp
                    LEFT JOIN themes t ON utp.theme_id = t.id
                    LEFT JOIN themeParts tp ON t.id = tp.themeID
                    LEFT JOIN modules m ON tp.id = m.themePartID
                    WHERE utp.user_id = ?
                `;
                pool.execute(query, [userID], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            })
        ]);

        // Organize the themes, parts, and modules
        const themes = {};
        themesResult.forEach(row => {
            // If the theme is not already in the themes object, add it
            if (!themes[row.themeId]) {
                themes[row.themeId] = {
                    id: row.themeId,
                    title: row.themeTitle,
                    description: row.themeDescription,
                    image: row.themeImage,
                    price: row.themePrice,
                    parts: []
                };
            }

            // If the theme part is not null and not already added, add it
            if (row.partId && !themes[row.themeId].parts.some(part => part.id === row.partId)) {
                themes[row.themeId].parts.push({
                    id: row.partId,
                    title: row.partTitle,
                    description: row.partDescription,
                    image: row.partImage,
                    modules: []
                });
            }

            // If the module is not null and not already added, add it
            if (row.moduleId) {
                const partIndex = themes[row.themeId].parts.findIndex(part => part.id === row.partId);
                if (partIndex !== -1 && !themes[row.themeId].parts[partIndex].modules.some(module => module.id === row.moduleId)) {
                    themes[row.themeId].parts[partIndex].modules.push({
                        id: row.moduleId,
                        title: row.moduleTitle,
                        description: row.moduleDescription,
                        video: row.moduleVideo,
                        price: row.modulePrice,
                        ebook: row.moduleEbook,
                        assessments: row.moduleAssessments
                    });
                }
            }
        });

        // Sending the results as a combined response
        res.status(200).json({
            books: booksResult,  // Books with title, author, etc.
            appointments: appointmentsResult,
            lessons: Object.values(themes)  // Return the structured themes with parts and modules
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
