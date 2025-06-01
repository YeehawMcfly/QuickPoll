import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel';
import mongoose from 'mongoose';

const router = express.Router();

// Helper type for route handlers to satisfy TypeScript
type AsyncRouteHandler = (req: Request, res: Response) => Promise<void>;

// Register a new user
const registerUser: AsyncRouteHandler = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      res.status(400).json({ 
        message: 'User with that email or username already exists' 
      });
      return;
    }
    
    // Create new user
    const user = new User({ username, email, password });
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Login user
const loginUser: AsyncRouteHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`[LOGIN] Attempt for email: ${email}`);
    console.log(`[LOGIN] Request body:`, { email: email ? 'provided' : 'missing', password: password ? 'provided' : 'missing' });
    console.log(`[LOGIN] Database: ${mongoose.connection.name}`);
    console.log(`[LOGIN] Environment: ${process.env.NODE_ENV}`);
    
    // Validate input
    if (!email || !password) {
      console.log('[LOGIN] Missing email or password');
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`[LOGIN] User not found for email: ${email}`);
      
      // Debug: Check what users exist in the database
      const allUsers = await User.find({}, 'email username').limit(5);
      console.log(`[LOGIN] Available users in database:`, allUsers.map(u => ({ email: u.email, username: u.username })));
      
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    
    console.log(`[LOGIN] User found: ${user.username} (${user.email})`);
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('[LOGIN] Password mismatch');
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    
    console.log('[LOGIN] Password match - login successful');
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('[LOGIN] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

// Set up routes with the handler functions
router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;