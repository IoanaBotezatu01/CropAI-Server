require("dotenv").config();
const express = require("express");
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require("cors");
const { connectDB } = require('./config/database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

// State Management
const userSockets = new Map();
app.set('io', io);
app.set('userSockets', userSockets);

// Socket Logic
io.on('connection', (socket) => {
  socket.on("register-user", (userId) => {
    // Clear previous and set new (ensuring clean single-session mapping)
    userSockets.set(userId, new Set([socket.id]));
  });

  socket.on('disconnect', () => {
    for (const [userId, socketsSet] of userSockets.entries()) {
      if (socketsSet.delete(socket.id) && socketsSet.size === 0) {
        userSockets.delete(userId);
      }
    }
  });
});

// Middleware
app.use(cors());
app.use(express.json());

// Domain Routes - Grouped for readability
const ROUTES = {
  '/api/weeds': './routes/predictWeedsRoutes',
  '/api/soils': './routes/predictSoilsRoutes',
  '/api/pests': './routes/predictPestsRoutes',
  '/api/diseases': './routes/predictDiseasesRoutes',
  '/api/auth': './routes/authRoutes',
  '/api/location': './routes/locationRoutes',
  '/api/plantation': './routes/plantationRoutes',
  '/api/solution': './routes/solutionRoutes',
  '/api/review': './routes/reviewRoutes',
  '/api/detail': './routes/detailRoutes',
  '/api/soil': './routes/soilRecommendationRoutes',
  '/api/alert': './routes/alertRoutes',
  '/api/threat': './routes/pestThreatRoutes'
};

Object.entries(ROUTES).forEach(([path, route]) => app.use(path, require(route)));

app.get("/", (req, res) => res.send("Backend is running!"));

// Database & Server Start
mongoose.connect(process.env.MONGO_DB_URI)
  .then(() => {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error("DB Connection Error:", err));