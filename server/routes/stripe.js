require('dotenv').config();
const express = require('express');
const router = express.Router();
const pool = require('../database/db')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { format } = require('date-fns'); // You can install this library
const { v4: uuidv4 } = require('uuid');

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
            cancel_url: 'http://localhost:3000/courses',
            metadata: { 
                user_id: user_id, // Store user_id in session metadata
                event_id: theme.id // Store event_id in session metadata
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
        
        if (!user || !start || !end || !user.id) {
            return res.status(400).send('Invalid data');
        }

        // Calculate duration in minutes
        const startDate = new Date(start);
        const endDate = new Date(end);
        const durationInMinutes = (endDate - startDate) / (1000 * 60); 
        
        // Check for valid duration
        if (durationInMinutes <= 0) {
            return res.status(400).send('Invalid appointment duration. Duration must be greater than 0 minutes.');
        }

        const validDuration = Math.floor(durationInMinutes / 30) * 30; 
        const pricePer30Minutes = 30; 
        const totalPrice = (validDuration / 30) * pricePer30Minutes;

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
            cancel_url: 'http://localhost:3000/book',
            metadata: { 
                user_id: user.id,
                start: start,
                end: end,
                validDuration: validDuration
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
        INSERT INTO appointments (user_id, start_date, end_date, appointement_link)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE purchased_at = CURRENT_TIMESTAMP
    `;

    // Execute the insert/update query
    pool.execute(insertPurchaseQuery, [user_id, formattedStart, formattedEnd, uuidv4()], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Return success message
        res.status(200).json({
            message: 'Purchase recorded successfully'
        });
    });
});


router.post('/buyBook', async (req, res) => {
    try {
        const { book, user_id } = req.body;
        if (!book || !book.name || !book.price || !user_id || !book.id) {
            return res.status(400).send('Invalid data');
        }

        // Round the price to the nearest integer (in cents)
        const priceInCents = Math.round(book.price * 100);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: book.name,
                        },
                        unit_amount: priceInCents, // Use the rounded price
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `http://localhost:3000/BookPurshareComplete/${user_id}/${book.id}`,
            cancel_url: 'http://localhost:3000/Books',
            metadata: { 
                user_id: user_id, // Store user_id in session metadata
                book_id: book.id // Store book_id in session metadata
            }
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
});

router.post('/storeBookPurchase', (req, res) => {
    const { user_id, book_id } = req.body;

    if (!user_id || !book_id) {
        return res.status(400).json({ error: "Missing user_id or book_id" });
    }

    const insertPurchaseQuery = `
        INSERT INTO usersBooks (user_id, book_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE purchased_at = CURRENT_TIMESTAMP
    `;

    // Execute the insert/update query
    pool.execute(insertPurchaseQuery, [user_id, book_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Return success message
        res.status(200).json({
            message: 'Purchase recorded successfully'
        });
    });
});

router.post('/buyEvent', async (req, res) => {
    try {
        const { event, user_id } = req.body; // Extract event and user_id from request
        if (!event || !event.name || !event.price || !user_id || !event.id) {
            return res.status(400).send('Invalid data');
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: event.name,
                        },
                        unit_amount: event.price * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `http://localhost:3000/eventSuccess/${user_id}/${event.id}`,
            cancel_url: 'http://localhost:3000/events',
            metadata: { 
                user_id: user_id, // Store user_id in session metadata
                event_id: event.id // Store event_id in session metadata
            }
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
});

router.post('/storeEventPurchase', (req, res) => {
    const { user_id, event_id } = req.body;

    if (!user_id || !event_id) {
        return res.status(400).json({ error: "Missing user_id or event_id" });
    }

    const insertPurchaseQuery = `
        INSERT INTO user_events_purchases (user_id, event_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE purchased_at = CURRENT_TIMESTAMP
    `;

    // Execute the insert/update query
    pool.execute(insertPurchaseQuery, [user_id, event_id], (err, result) => {
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

router.get('/getAppoinements', (req, res) => {
    const { user_id } = req.query;
    
    if (!user_id) {
        return res.status(400).json({ error: 'userID is required' });
    }

    pool.execute(
        "SELECT * FROM appointments WHERE user_id = ?",
        [user_id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Return true if the purchase exists, else return false
            if (result.length >0 ){
                res.status(200).json({ appointments: result });
            }else{
                res.status(200).json({ appointments: [] });
            }
        }
    );
});
// Get Owned Events
router.get('/getOwnedEvents', (req, res) => {
    const { user_id } = req.query;

    if (!user_id) {
        return res.status(400).json({ error: 'userID is required' });
    }

    pool.execute(
        "SELECT event_id FROM user_events_purchases WHERE user_id = ?",
        [user_id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.length > 0) {
                const eventIds = result.map(row => row.event_id);
                
                // Fetch event details based on extracted IDs
                const eventsQuery = `SELECT * FROM events WHERE id IN (${eventIds.map(() => '?').join(', ')})`;
                pool.execute(eventsQuery, eventIds, (err, eventsResult) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.status(200).json({ events: eventsResult });
                });
            } else {
                res.status(200).json({ events: [] });
            }
        }
    );
});

// Get Owned Books
router.get('/getOwnedBooks', (req, res) => {
    const { user_id } = req.query;

    if (!user_id) {
        return res.status(400).json({ error: 'userID is required' });
    }

    pool.execute(
        "SELECT book_id FROM usersBooks WHERE user_id = ?",
        [user_id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.length > 0) {
                const bookIds = result.map(row => row.book_id);
                
                // Fetch book details based on extracted IDs
                const booksQuery = `SELECT * FROM Books WHERE id IN (${bookIds.map(() => '?').join(', ')})`;
                pool.execute(booksQuery, bookIds, (err, booksResult) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.status(200).json({ books: booksResult });
                });
            } else {
                res.status(200).json({ books: [] });
            }
        }
    );
});

module.exports = router;
