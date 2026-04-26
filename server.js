require("dotenv").config();
const express = require("express");
const mongoose=require('mongoose')
const socketIo = require('socket.io');
const http = require('http');
const {connectDB} = require('./config/database');
const cors = require("cors");
const predictWeeds =require('./routes/predictWeedsRoutes')
const predictSoils=require('./routes/predictSoilsRoutes')
const predictPests=require('./routes/predictPestsRoutes')
const predictDiseases=require('./routes/predictDiseasesRoutes')
const auth=require('./routes/authRoutes')
const location=require('./routes/locationRoutes')
const plantation=require('./routes/plantationRoutes')
const solution= require('./routes/solutionRoutes')
const review= require('./routes/reviewRoutes')
const detail= require('./routes/detailRoutes')
const soilRecommendation=require('./routes/soilRecommendationRoutes')
const alert= require('./routes/alertRoutes')
const threat= require ('./routes/pestThreatRoutes')

const app = express();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.set('io', io);

const userSockets = new Map();

io.on('connection', (socket) => {
  //console.log('Client connected via WebSocket', socket.id);

  socket.on("register-user", (userId) => {
  const socketsSet = userSockets.get(userId);
  if (!socketsSet || !socketsSet.has(socket.id)) {
    
    userSockets.delete(userId);
    userSockets.set(userId, new Set([socket.id]));
    //console.log(`Cleaned all sockets for user ${userId}`);
    //console.log(" Registered user", userId, "with socket", socket.id);
  } else {
    console.log(`Socket ${socket.id} already registered for user ${userId}`);
  }
});


  socket.on('disconnect', () => {
    for (const [userId, socketsSet] of userSockets.entries()) {
      if (socketsSet.has(socket.id)) {
        socketsSet.delete(socket.id);
        //console.log(`Socket ${socket.id} disconnected for user ${userId}`);
        if (socketsSet.size === 0) {
          userSockets.delete(userId);
          //console.log(`No more active sockets for user ${userId}, removed from userSockets`);
        }
        break;
      }
    }
  });
});



app.set('userSockets', userSockets);

mongoose.connect(process.env.MONGO_DB_URI);
app.use(cors());
app.use(express.json());

app.use("/api/weeds", predictWeeds);
app.use("/api/soils",predictSoils)
app.use("/api/pests",predictPests)
app.use("/api/diseases",predictDiseases)

app.use("/api/auth",auth)
app.use("/api/location",location)
app.use('/api/plantation',plantation)

app.use('/api/solution',solution)
app.use('/api/review',review)
app.use('/api/detail',detail)
app.use('/api/soil',soilRecommendation)
app.use('/api/alert',alert)
app.use('/api/threat',threat)

app.get("/", (req, res) => {
    res.send("Backend is running!");
});
const tf = require('@tensorflow/tfjs-node');



const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

