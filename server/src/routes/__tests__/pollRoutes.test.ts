import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import { Poll } from '../../models/pollModel';
import pollRoutes from '../pollRoutes';

const app = express();
app.use(express.json());
app.use('/api/polls', pollRoutes);

describe('Poll Routes', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/test-db');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Poll.deleteMany({});
  });

  describe('POST /api/polls', () => {
    it('should create a new poll', async () => {
      const pollData = {
        question: 'Test question?',
        options: ['Option 1', 'Option 2']
      };

      const response = await request(app)
        .post('/api/polls')
        .send(pollData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.question).toBe(pollData.question);
      expect(response.body.options).toEqual(pollData.options);
      expect(response.body.votes).toEqual([0, 0]);
    });

    it('should return 400 for invalid poll data', async () => {
      const pollData = {
        question: 'Test question?',
        options: ['Option 1'] // Only one option, should be at least two
      };

      const response = await request(app)
        .post('/api/polls')
        .send(pollData);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/polls/:id/vote', () => {
    it('should increment vote count for specified option', async () => {
      // Create a poll first
      const poll = await Poll.create({
        question: 'Test question?',
        options: ['Option 1', 'Option 2'],
        votes: [0, 0]
      });

      const response = await request(app)
        .post(`/api/polls/${poll._id}/vote`)
        .send({ optionIndex: 1 });

      expect(response.status).toBe(200);
      expect(response.body.votes).toEqual([0, 1]);
    });

    it('should return 404 for non-existent poll', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .post(`/api/polls/${fakeId}/vote`)
        .send({ optionIndex: 0 });

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid option index', async () => {
      const poll = await Poll.create({
        question: 'Test question?',
        options: ['Option 1', 'Option 2'],
        votes: [0, 0]
      });

      const response = await request(app)
        .post(`/api/polls/${poll._id}/vote`)
        .send({ optionIndex: 5 }); // Out of bounds

      expect(response.status).toBe(400);
    });
  });
});