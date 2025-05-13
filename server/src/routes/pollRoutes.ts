// server/routes/pollRoutes.ts
import express from 'express';
import { Poll } from '../models/pollModel';

const router = express.Router();

// Get all polls
router.get('/', async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get a specific poll
router.get('/:id', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }
    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Create a new poll
router.post('/', async (req, res) => {
  try {
    const { question, options } = req.body;
    
    if (!question || !options || options.length < 2) {
      return res.status(400).json({ 
        message: 'Invalid poll data. Question and at least 2 options are required.' 
      });
    }

    const newPoll = new Poll({
      question,
      options,
      votes: Array(options.length).fill(0)
    });

    const savedPoll = await newPoll.save();
    res.status(201).json(savedPoll);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Vote on a poll
router.post('/:id/vote', async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }
    
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: 'Invalid option index' });
    }
    
    // Increment the vote count for the selected option
    poll.votes[optionIndex] += 1;
    await poll.save();
    
    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
