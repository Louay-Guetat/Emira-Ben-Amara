// Import required modules
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const http = require('http');
const pool = require('./database/db');
const init_db = require('./database/init_db');
const authRoutes = require('./routes/auth');
const themesRoutes = require('./routes/themes');
const themePartsRoutes = require('./routes/themeParts');
const modulesRoutes = require('./routes/modules');
const appointmentsRoutes = require('./routes/appointments');
const contactRoutes = require('./routes/contact')
const eventsRoutes = require('./routes/events')
const stripeRoutes = require('./routes/stripe')
const blogsRoutes = require('./routes/blogs')
const booksRoutes = require('./routes/books')
const userRoutes = require('./routes/user')

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

const oneToMany = require('./stream/OneToMany');

const initializeOneToOne = require('./stream/OneToOne');
const initializeManyToMany = require('./stream/ManyToMany')
// Set the port
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(express.json());
app.use(cookieParser());
// CORS setup

//app.use(cors());

// cors settings
//app.options("*", cors());
//app.use((req, res, next) => {
  //res.header("Access-Control-Allow-Origin", "*");
  //res.header(
    //"Access-Control-Allow-Methods",
    //"GET,PUT,POST,DELETE,PATCH,OPTIONS"
  //);
  //res.header(
    //"Access-Control-Allow-Headers",
    //"Content-Type,Authorization,Content-Length,X-Requested-With"
  //);
  //next();
//});

app.use(
    cors({
      origin: "http://localhost:3000",
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    })
  );

// Static file serving for uploads
app.use('/uploads/themes', express.static(path.join(__dirname, 'uploads/themes')));
app.use('/uploads/themeParts', express.static(path.join(__dirname, 'uploads/themeParts')));
app.use('/uploads/modules', express.static(path.join(__dirname, 'uploads/modules')));
app.use('/uploads/blogs', express.static(path.join(__dirname, 'uploads/blogs')));
app.use('/uploads/books', express.static(path.join(__dirname, 'uploads/books')));

// Serve static files in production (React client build)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Define API routes
app.use('/auth', authRoutes);
app.use('/themes', themesRoutes);
app.use('/themeParts', themePartsRoutes);
app.use('/modules', modulesRoutes);
app.use('/appointments', appointmentsRoutes);
app.use('/contact', contactRoutes)
app.use('/events', eventsRoutes)
app.use('/stripe', stripeRoutes)
app.use('/blogs', blogsRoutes)
app.use('/books', booksRoutes)
app.use('/user', userRoutes)

initializeOneToOne(server);
initializeManyToMany(server)

app.post("/consumer", oneToMany.handleConsumer);
app.post("/broadcast", oneToMany.handleBroadcast);
app.post("/closeConnection", oneToMany.closePeerConnection)
app.get('/connected-users', oneToMany.getConnectedUsers);
app.post('/sendMessage', oneToMany.sendMessage)

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

function runEveryTwoHours() {
  const deleteDisponibilite = `DELETE FROM disponibilite WHERE end_date < NOW();`;
  
  const deleteOldEvents = `DELETE FROM events WHERE DATE_ADD(date_event, INTERVAL 1 HOUR) < NOW();`;
  
  pool.query(deleteDisponibilite, (err, results) => {
      if (err) {
          console.error('Error deleting disponibilite:', err);
          return;
      }
      console.log('Disponibilite deleted successfully.');
  });
  
  pool.query(deleteOldEvents, (err, results) => {
      if (err) {
          console.error('Error deleting event:', err);
          return;
      }
      console.log('Event deleted successfully.');
  });
}

// Run the function every 2 hours
setInterval(runEveryTwoHours, 1 * 60 * 60 * 1000);

// Optional: Run the function immediately upon server startup
runEveryTwoHours();