// server/routes/pollRoutes.ts
import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to QuickPoll API!' });
});

export default router;
