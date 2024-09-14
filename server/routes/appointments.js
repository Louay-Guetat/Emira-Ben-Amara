const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const multer = require('multer');
const upload = multer(); // This will handle the incoming form data

router.post('/setAppointment', upload.none(), (req, res) => {
    const { email, phone, name, desired_date, uid } = req.body; // FormData fields will be available in req.body
    
    if (!email || !phone || !name || !desired_date) {
        return res.status(400).json({ error: 'Some required attributes are missing.' });
    } else {
        const query = uid
            ? 'INSERT INTO appointments (email, phone, desired_date, user_id) VALUES (?, ?, ?, ?)'
            : 'INSERT INTO appointments (email, phone, desired_date) VALUES (?, ?, ?)';

        const params = uid ? [email, phone, desired_date, uid] : [email, phone, desired_date];
        
        pool.execute(query, params, (err, result) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ error: err.message });
            }
            return res.status(200).json({ message: 'Appointment set successfully' });
        });
    }
});

module.exports = router;
