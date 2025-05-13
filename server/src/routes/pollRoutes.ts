import express, { Request, Response } from 'express';
import { Poll } from '../models/pollModel';
import { Server } from 'socket.io';
import { auth } from '../middleware/auth';

const router = express.Router();
let io: Server;

// Set io instance
export const setSocketIo = (socketIo: Server): void => {
  io = socketIo;
};

// Helper type for route handlers to satisfy TypeScript
type AsyncRouteHandler = (req: Request, res: Response) => Promise<void>;

// Get all polls (public)
const getAllPolls: AsyncRouteHandler = async (req, res) => {
  try {
    // Change this line to show all polls regardless of isActive status 
    // and even if they don't have a creator field
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get a specific poll (public)
const getPollById: AsyncRouteHandler = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      res.status(404).json({ message: 'Poll not found' });
      return;
    }
    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Create a new poll (authenticated)
const createPoll: AsyncRouteHandler = async (req, res) => {
  try {
    const { question, options } = req.body;
    
    if (!question || !options || options.length < 2) {
      res.status(400).json({ 
        message: 'Invalid poll data. Question and at least 2 options are required.' 
      });
      return;
    }

    const newPoll = new Poll({
      question,
      options,
      votes: Array(options.length).fill(0),
      creator: req.userId
    });

    const savedPoll = await newPoll.save();
    
    // Emit new poll event via Socket.IO
    if (io) {
      io.emit('newPoll', savedPoll);
    }
    
    res.status(201).json(savedPoll);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Vote on a poll (public)
const voteOnPoll: AsyncRouteHandler = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      res.status(404).json({ message: 'Poll not found' });
      return;
    }
    
    if (poll.isActive === false) {
      res.status(400).json({ message: 'This poll is no longer active' });
      return;
    }
    
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      res.status(400).json({ message: 'Invalid option index' });
      return;
    }
    
    // Increment the vote count for the selected option
    poll.votes[optionIndex] += 1;
    
    // Use updateOne to avoid validation issues with older polls
    await Poll.updateOne(
      { _id: poll._id },
      { $set: { votes: poll.votes } }
    );
    
    // Emit poll updated event via Socket.IO
    if (io) {
      io.emit('pollUpdated', poll);
    }
    
    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get polls created by the authenticated user
const getUserPolls: AsyncRouteHandler = async (req, res) => {
  try {
    const polls = await Poll.find({ creator: req.userId }).sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update poll status (activate/deactivate)
const updatePollStatus: AsyncRouteHandler = async (req, res) => {
  try {
    const { isActive } = req.body;
    
    // Find poll and check ownership
    const poll = await Poll.findOne({ _id: req.params.id, creator: req.userId });
    
    if (!poll) {
      res.status(404).json({ message: 'Poll not found or you do not have permission' });
      return;
    }
    
    poll.isActive = isActive;
    await poll.save();
    
    // Emit poll updated event via Socket.IO
    if (io) {
      io.emit('pollUpdated', poll);
    }
    
    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Delete a poll
const deletePoll: AsyncRouteHandler = async (req, res) => {
  try {
    // Find poll and check ownership
    const poll = await Poll.findOneAndDelete({ _id: req.params.id, creator: req.userId });
    
    if (!poll) {
      res.status(404).json({ message: 'Poll not found or you do not have permission' });
      return;
    }
    
    // Emit poll deleted event via Socket.IO
    if (io) {
      io.emit('pollDeleted', req.params.id);
    }
    
    res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Set up routes with the handler functions
router.get('/', getAllPolls);
router.get('/:id', getPollById);
router.post('/', auth, createPoll);
router.post('/:id/vote', voteOnPoll);
router.get('/user/polls', auth, getUserPolls);
router.patch('/:id/status', auth, updatePollStatus);
router.delete('/:id', auth, deletePoll);

export default router;
