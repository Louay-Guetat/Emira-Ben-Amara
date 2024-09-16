// Import required modules
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const http = require('http');

const init_db = require('./database/init_db');
const authRoutes = require('./routes/auth');
const themesRoutes = require('./routes/themes');
const themePartsRoutes = require('./routes/themeParts');
const modulesRoutes = require('./routes/modules');
const appointmentsRoutes = require('./routes/appointments');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }
})

// Set the port
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(express.json());
app.use(cookieParser());

// CORS setup
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


io.on("connection", (socket) => {
  socket.emit("me", socket.id)

  socket.on("disconnect", () =>{
    socket.broadcast.emit("callEnded")
  })

  socket.on('callUser', (data) =>{
    io.to(data.userToCall).emit("callUser", {signal: data.signalData, from: data.from, name: data.name})

  })

  socket.on("answerCall", (data) =>{
    io.to(data.to).emit("callAccepted", data.signal)
  })
})


server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
