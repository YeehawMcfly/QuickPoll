// server/routes/pollRoutes.ts
import express, { Request, Response, NextFunction } from 'express';
import { Poll } from '../models/pollModel';
import { Server } from 'socket.io';

const router = express.Router();
let io: Server;

// Set io instance
export const setSocketIo = (socketIo: Server) => {
  io = socketIo;
};

// Handler functions
const getAllPolls = (req: Request, res: Response, next: NextFunction): void => {
  Poll.find().sort({ createdAt: -1 })
    .then(polls => {
      res.json(polls);
    })
    .catch(error => {
      res.status(500).json({ message: 'Server error', error });
    });
};

const getPollById = (req: Request, res: Response, next: NextFunction): void => {
  Poll.findById(req.params.id)
    .then(poll => {
      if (!poll) {
        res.status(404).json({ message: 'Poll not found' });
        return;
      }
      res.json(poll);
    })
    .catch(error => {
      res.status(500).json({ message: 'Server error', error });
    });
};

const createPoll = (req: Request, res: Response, next: NextFunction): void => {
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
    votes: Array(options.length).fill(0)
  });

  newPoll.save()
    .then(savedPoll => {
      // Emit new poll event via Socket.IO
      if (io) {
        io.emit('newPoll', savedPoll);
      }
      res.status(201).json(savedPoll);
    })
    .catch(error => {
      res.status(500).json({ message: 'Server error', error });
    });
};

const voteOnPoll = (req: Request, res: Response, next: NextFunction): void => {
  const { optionIndex } = req.body;
  let pollDocument: any = null;
  
  Poll.findById(req.params.id)
    .then(poll => {
      if (!poll) {
        res.status(404).json({ message: 'Poll not found' });
        return null;
      }
      
      if (optionIndex < 0 || optionIndex >= poll.options.length) {
        res.status(400).json({ message: 'Invalid option index' });
        return null;
      }
      
      // Increment the vote count for the selected option
      poll.votes[optionIndex] += 1;
      pollDocument = poll;
      return poll.save();
    })
    .then(updatedPoll => {
      if (!updatedPoll) return;
      
      // Emit poll updated event via Socket.IO
      if (io) {
        io.emit('pollUpdated', updatedPoll);
      }
      
      res.json(updatedPoll);
    })
    .catch(error => {
      res.status(500).json({ message: 'Server error', error });
    });
};

// Routes
router.get('/', getAllPolls);
router.get('/:id', getPollById);
router.post('/', createPoll);
router.post('/:id/vote', voteOnPoll);

export default router;
