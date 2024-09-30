const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const multer = require('multer');
const upload = multer(); // This will handle the incoming form data

router.get('/getAppointments', (req, res) => {
    const query = `
        SELECT a.*, u.username 
        FROM appointments AS a
        JOIN users AS u ON a.user_id = u.id 
        ORDER BY a.created_at ASC
    `;
    
    pool.execute(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    });
});

router.post('/saveAvailability', (req,res) =>{
    const {start, end} = req.body
    if (!start || !end){
        return res.status(400).json({ error: 'Start and end dates are required' });
    }
    const query = 'INSERT INTO disponibilite (start_date, end_date) VALUES (?, ?)'
    pool.execute(query, [start, end], (err, result) => {
        if (err) {
            console.log(err)
            return res.status(500).json({ error: err.message });
        }
        return res.status(200).json({ message: 'Disponibilite set successfully' });
    });
})

router.get('/getAvailability', (req,res) =>{
    pool.execute(
        "SELECT * FROM disponibilite",
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.length > 0) {
                // Return all themes
                res.status(200).json({ dispo: result });
            } else {
                res.status(200).json({ dispo: [] });
            }
        }
    );
})

module.exports = router;
