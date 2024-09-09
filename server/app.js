// app.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const init_db = require('./database/init_db')
const authRoutes = require('./routes/auth'); 

const app = express();
const port = 5000;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use('/auth', authRoutes);  // Use the router for '/auth' routes

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});