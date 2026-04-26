require('dotenv').config();

const cors = require('cors');
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');

const alertRoutes = require('./routes/alertRoutes');
const authRoutes = require('./routes/authRoutes');
const detailRoutes = require('./routes/detailRoutes');
const locationRoutes = require('./routes/locationRoutes');
const plantationRoutes = require('./routes/plantationRoutes');
const predictDiseasesRoutes = require('./routes/predictDiseasesRoutes');
const predictPestsRoutes = require('./routes/predictPestsRoutes');
const predictSoilsRoutes = require('./routes/predictSoilsRoutes');
const predictWeedsRoutes = require('./routes/predictWeedsRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const soilRecommendationRoutes = require('./routes/soilRecommendationRoutes');
const solutionRoutes = require('./routes/solutionRoutes');
const threatRoutes = require('./routes/pestThreatRoutes');

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const userSockets = new Map();

const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

function registerUserSocket(userId, socketId) {
  const socketsSet = userSockets.get(userId);

  if (!socketsSet || !socketsSet.has(socketId)) {
    userSockets.delete(userId);
    userSockets.set(userId, new Set([socketId]));
    return;
  }

  console.log(`Socket ${socketId} already registered for user ${userId}`);
}

function unregisterSocket(socketId) {
  for (const [userId, socketsSet] of userSockets.entries()) {
    if (!socketsSet.has(socketId)) {
      continue;
    }

    socketsSet.delete(socketId);

    if (socketsSet.size === 0) {
      userSockets.delete(userId);
    }

    break;
  }
}

function configureSocketHandlers() {
  io.on('connection', (socket) => {
    socket.on('register-user', (userId) => {
      registerUserSocket(userId, socket.id);
    });

    socket.on('disconnect', () => {
      unregisterSocket(socket.id);
    });
  });
}

function registerRoutes() {
  app.use('/api/weeds', predictWeedsRoutes);
  app.use('/api/soils', predictSoilsRoutes);
  app.use('/api/pests', predictPestsRoutes);
  app.use('/api/diseases', predictDiseasesRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/location', locationRoutes);
  app.use('/api/plantation', plantationRoutes);
  app.use('/api/solution', solutionRoutes);
  app.use('/api/review', reviewRoutes);
  app.use('/api/detail', detailRoutes);
  app.use('/api/soil', soilRecommendationRoutes);
  app.use('/api/alert', alertRoutes);
  app.use('/api/threat', threatRoutes);

  app.get('/', (req, res) => {
    res.send('Backend is running!');
  });
}

app.set('io', io);
app.set('userSockets', userSockets);

mongoose.connect(process.env.MONGO_DB_URI);

app.use(cors());
app.use(express.json());

configureSocketHandlers();
registerRoutes();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});