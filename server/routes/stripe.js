require('dotenv').config();
const express = require('express');
const router = express.Router();
const pool = require('../database/db')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { format } = require('date-fns'); // You can install this library

router.post('/checkout', async (req, res) => {
    try {
        const { theme, user_id } = req.body; // Extract theme and user_id from request
        if (!theme || !theme.name || !theme.price || !user_id || !theme.id) {
            return res.status(400).send('Invalid data');
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: theme.name,
                        },
                        unit_amount: theme.price * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `http://localhost:3000/complete/${user_id}/${theme.id}`,
            cancel_url: 'http://localhost:3000/cancel',
            metadata: { 
                user_id: user_id, // Store user_id in session metadata
                theme_id: theme.id // Store theme_id in session metadata
            }
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
});

router.post('/appointmentCheckout', async (req, res) => {
    try {
        const { user, start, end } = req.body;
        console.log(user, start, end);
        
        // Corrected validation check
        if (!user || !start || !end || !user.id) {
            return res.status(400).send('Invalid data');
        }

        // Calculate duration in minutes
        const startDate = new Date(start);
        const endDate = new Date(end);
        const durationInMinutes = (endDate - startDate) / (1000 * 60); // Convert milliseconds to minutes
        
        // Check for valid duration
        if (durationInMinutes <= 0 || durationInMinutes % 30 !== 0) {
            return res.status(400).send('Invalid appointment duration. It should be in increments of 30 minutes.');
        }

        // Calculate price based on duration
        const pricePer30Minutes = 30; // Price in euros
        const totalPrice = (durationInMinutes / 30) * pricePer30Minutes; // Total price in euros

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `Rendez-vous avec Emira de ${start} jusqu'à ${end}`,
                        },
                        unit_amount: totalPrice * 100, // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `http://localhost:3000/complete/${user.id}/${encodeURIComponent(start)}/${encodeURIComponent(end)}`,
            cancel_url: 'http://localhost:3000/cancel',
            metadata: { 
                user_id: user.id,
                start: start,
                end: end
            }
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
});

router.post('/storeThemePurchase', (req, res) => {
    const { user_id, theme_id } = req.body;

    if (!user_id || !theme_id) {
        return res.status(400).json({ error: "Missing user_id or theme_id" });
    }

    const insertPurchaseQuery = `
        INSERT INTO user_themes_purchases (user_id, theme_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE purchased_at = CURRENT_TIMESTAMP
    `;

    // Execute the insert/update query
    pool.execute(insertPurchaseQuery, [user_id, theme_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Return success message
        res.status(200).json({
            message: 'Purchase recorded successfully'
        });
    });
});

router.post('/storeAppointmentPurchase', (req, res) => {
    const { user_id, start, end } = req.body;
    console.log({ user_id, start, end });

    if (!user_id || !start || !end) {
        return res.status(400).json({ error: "Missing user_id or datetimes" });
    }

    // Parse the dates from the incoming format
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Check if the dates are valid
    if (isNaN(startDate) || isNaN(endDate)) {
        return res.status(400).json({ error: "Invalid datetime format" });
    }

    // Format the dates to MySQL DATETIME format
    const formattedStart = format(startDate, 'yyyy-MM-dd HH:mm:ss');
    const formattedEnd = format(endDate, 'yyyy-MM-dd HH:mm:ss');

    const insertPurchaseQuery = `
        INSERT INTO appointments (user_id, start_date, end_date)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE purchased_at = CURRENT_TIMESTAMP
    `;

    // Execute the insert/update query
    pool.execute(insertPurchaseQuery, [user_id, formattedStart, formattedEnd], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Return success message
        res.status(200).json({
            message: 'Purchase recorded successfully'
        });
    });
});

router.get('/getThemeOwned', (req, res) => {
    const { theme_id, user_id } = req.query;
    
    if (!theme_id || !user_id) {
        return res.status(400).json({ error: 'themeID and userID are required' });
    }

    pool.execute(
        "SELECT * FROM user_themes_purchases WHERE user_id = ? AND theme_id = ?",
        [user_id, theme_id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Return true if the purchase exists, else return false
            const exists = result.length > 0;
            res.status(200).json({ owned: exists });
        }
    );
});


module.exports = router;
