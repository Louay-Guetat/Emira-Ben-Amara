const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const multer = require('multer');
const upload = multer(); // This will handle the incoming form data

router.get('/getAppointments', (req,res) => {
    const query = 'SELECT * from appointments ORDER BY desired_date ASC';
    pool.execute(query, (err, results) =>{
        if(err){
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results)
    })
})

router.post('/setAppointment', upload.none(), (req, res) => {
    const { email, phone, name, desired_date, uid } = req.body; // FormData fields will be available in req.body
    
    if (!email || !phone || !name || !desired_date) {
        return res.status(400).json({ error: 'Some required attributes are missing.' });
    } else {
        const query = uid
            ? 'INSERT INTO appointments (email, phone, desired_date, full_name, user_id) VALUES (?, ?, ?, ?, ?)'
            : 'INSERT INTO appointments (email, phone, desired_date, full_name) VALUES (?, ?, ?, ?)';

        const params = uid ? [email, phone, desired_date, name, uid] : [email, phone, desired_date, name];
        
        pool.execute(query, params, (err, result) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ error: err.message });
            }
            return res.status(200).json({ message: 'Appointment set successfully' });
        });
    }
});

router.put('/confirmAppointment', async (req, res) => {
    try {
        const updatedEvent = req.body; // Get the updatedEvent directly from req.body

        if (!updatedEvent.id) {
            return res.status(400).json({ error: 'Appointment ID is required' });
        }

        // Update the appointment in the database, setting the confirmed_date
        const updateQuery = `
            UPDATE appointments
            SET confirmed_date = ?
            WHERE id = ?
        `;

        pool.execute(updateQuery, [updatedEvent.confirmed_date, updatedEvent.id], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: err.message });
            }

            return res.status(200).json({ message: 'Appointment confirmed successfully' });
        });

    } catch (error) {
        console.error('Error confirming appointment:', error);
        return res.status(500).json({ error: 'An error occurred while confirming the appointment' });
    }
});


module.exports = router;
