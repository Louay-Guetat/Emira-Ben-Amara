require('dotenv').config();
const express = require('express');
const router = express.Router();
const pool = require('../database/db')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
