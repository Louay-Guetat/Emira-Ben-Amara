const express = require('express');
const router = express.Router();
const pool = require('../database/db');

router.get('/getEvents', (req, res) => {
    pool.execute(
        "SELECT * FROM events",
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (result.length > 0) {
                res.status(200).json({ events: result });
            } else {
                res.status(200).json({ events: [] });
            }
        }
    );
});

router.post('/createEvent', (req,res) =>{
    const {nom, description, price, date_event} = req.body;
    console.log({nom, description, price, date_event})
    if (!date_event){
        return res.status(400).json({ error: "L'événement doit avoir une date." });
    }
    const insertQuery = "INSERT INTO events (name, description, price, date_event) VALUES (?, ?, ?, ?)";
    pool.execute(insertQuery, [nom, description, price, date_event], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ event: result[0] });
    });
})

module.exports = router;
