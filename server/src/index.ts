import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import pollRoutes, { setSocketIo } from './routes/pollRoutes';
import authRoutes from './routes/authRoutes';
import { connectDB } from './config/db';

const app = express();
const httpServer = createServer(app);

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://yeehawmcfly.github.io',
        'https://quickpoll-api-qilq.onrender.com',
        'https://yeehawmcfly.github.io/QuickPoll'
      ]
    : 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
};

const io = new Server(httpServer, {
  cors: corsOptions
});

const PORT = process.env.PORT || 3000;

// Set the Socket.IO instance for routes
setSocketIo(io);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Routes
app.use('/api/polls', pollRoutes);
app.use('/api/auth', authRoutes);

// Debug endpoint to check database connection and users
app.get('/api/debug/info', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const { User } = require('./models/userModel');
    
    const userCount = await User.countDocuments();
    const sampleUsers = await User.find({}, 'username email createdAt').limit(3);
    
    res.json({
      environment: process.env.NODE_ENV,
      databaseName: mongoose.connection.name,
      databaseState: mongoose.connection.readyState,
      databaseHost: mongoose.connection.host,
      totalUsers: userCount,
      sampleUsers: sampleUsers,
      mongoUri: process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') : 'Not set',
      corsOrigin: process.env.CORS_ORIGIN || 'Not set'
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      environment: process.env.NODE_ENV,
      mongoUri: process.env.MONGODB_URI ? 'Set but connection failed' : 'Not set'
    });
  }
});

// Socket.io
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Connect to MongoDB and start server
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`CORS enabled for: ${JSON.stringify(corsOptions.origin)}`);
  });
}).catch((error) => {
  console.error('Failed to connect to database:', error);
  process.exit(1);
});
