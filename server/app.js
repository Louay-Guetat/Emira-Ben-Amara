// app.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const init_db = require('./database/init_db')
const authRoutes = require('./routes/auth'); 
const themesRoutes = require('./routes/themes'); 
const themePartsRoutes = require('./routes/themeParts'); 
const modulesRoutes = require('./routes/modules'); 
const path = require('path');

const app = express();
const port = 5000;

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.use('/auth', authRoutes);  

app.use('/themes', themesRoutes);
app.use('/uploads/themes', express.static(path.join(__dirname, 'uploads/themes')));

app.use('/themeParts', themePartsRoutes);
app.use('/uploads/themeParts', express.static(path.join(__dirname, 'uploads/themeParts')));

app.use('/modules', modulesRoutes);
app.use('/uploads/modules', express.static(path.join(__dirname, 'uploads/modules')));



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});