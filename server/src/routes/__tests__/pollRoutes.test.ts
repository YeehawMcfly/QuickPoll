import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { Poll, IPoll } from '../../models/pollModel';
import { User, IUser } from '../../models/userModel';
import pollRoutes from '../pollRoutes';

const app = express();
app.use(express.json());
app.use('/api/polls', pollRoutes);

describe('Poll Routes', () => {
  let testUser: IUser;
  let authToken: string;
  let testUserId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    // Create a test user for authentication
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpassword123'
    });
    testUserId = testUser._id as mongoose.Types.ObjectId;
    
    // Generate JWT token for testing
    authToken = jwt.sign(
      { userId: testUserId },
      process.env.JWT_SECRET || 'test-secret-key',
      { expiresIn: '1d' }
    );
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Poll.deleteMany({});
  });

  beforeEach(async () => {
    await Poll.deleteMany({});
  });

  describe('GET /api/polls', () => {
    it('should get all polls', async () => {
      // Create a test poll first
      await Poll.create({
        question: 'Test question?',
        options: ['Option 1', 'Option 2'],
        creator: testUserId
      });

      const response = await request(app)
        .get('/api/polls');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
    });

    it('should return empty array when no polls exist', async () => {
      const response = await request(app)
        .get('/api/polls');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('POST /api/polls', () => {
    it('should create a new poll with authentication', async () => {
      const pollData = {
        question: 'Test question?',
        options: ['Option 1', 'Option 2']
      };

      const response = await request(app)
        .post('/api/polls')
        .set('Authorization', `Bearer ${authToken}`)
        .send(pollData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.question).toBe(pollData.question);
      expect(response.body.options).toEqual(pollData.options);
      expect(response.body.votes).toEqual([0, 0]);
      expect(response.body.creator).toBe(testUserId.toString());
    });

    it('should return 401 for unauthenticated requests', async () => {
      const pollData = {
        question: 'Test question?',
        options: ['Option 1', 'Option 2']
      };

      const response = await request(app)
        .post('/api/polls')
        .send(pollData);

      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid poll data', async () => {
      const pollData = {
        question: 'Test question?',
        options: ['Option 1'] // Only one option, should be at least two
      };

      const response = await request(app)
        .post('/api/polls')
        .set('Authorization', `Bearer ${authToken}`)
        .send(pollData);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/polls/:id', () => {
    it('should get a specific poll', async () => {
      const pollDoc = await Poll.create({
        question: 'Test question?',
        options: ['Option 1', 'Option 2'],
        creator: testUserId
      });

      const pollId = (pollDoc._id as mongoose.Types.ObjectId).toString();

      const response = await request(app)
        .get(`/api/polls/${pollId}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(pollId);
      expect(response.body.question).toBe(pollDoc.question);
    });

    it('should return 404 for non-existent poll', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/polls/${fakeId}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/polls/:id/vote', () => {
    it('should increment vote count for specified option for an authenticated user', async () => {
      const pollDoc = await Poll.create({
        question: 'Test question?',
        options: ['Option 1', 'Option 2'],
        votes: [0, 0],
        creator: testUserId // Assuming testUserId is from a different user or not relevant for voting itself
      });

      const pollId = (pollDoc._id as mongoose.Types.ObjectId).toString();

      const response = await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${authToken}`) // authToken for the voting user
        .send({ optionIndex: 1 });

      expect(response.status).toBe(200);
      expect(response.body.votes).toEqual([0, 1]);
      expect(response.body.votedBy).toContain(testUserId.toString());
    });

    it('should return 401 for unauthenticated vote attempts', async () => {
      const pollDoc = await Poll.create({
        question: 'Test question?',
        options: ['Option 1', 'Option 2'],
        creator: new mongoose.Types.ObjectId() 
      });
      const pollId = (pollDoc._id as mongoose.Types.ObjectId).toString();

      const response = await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .send({ optionIndex: 0 });
      
      expect(response.status).toBe(401); // Because auth middleware is now applied
    });

    it('should return 403 if an authenticated user tries to vote again on the same poll', async () => {
      const pollDoc = await Poll.create({
        question: 'Test question for double vote?',
        options: ['Yes', 'No'],
        creator: new mongoose.Types.ObjectId()
      });
      const pollId = (pollDoc._id as mongoose.Types.ObjectId).toString();

      // First vote
      await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ optionIndex: 0 });

      // Second vote attempt
      const response = await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ optionIndex: 1 });
      
      expect(response.status).toBe(403);
      expect(response.body.message).toBe('You have already voted on this poll.');
    });
    
    it('should return 400 for invalid option index (authenticated)', async () => {
      const pollDoc = await Poll.create({
        question: 'Test question?',
        options: ['Option 1', 'Option 2'],
        votes: [0, 0],
        creator: testUserId 
      });
      const pollId = (pollDoc._id as mongoose.Types.ObjectId).toString();

      const response = await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ optionIndex: 5 }); // Out of bounds

      expect(response.status).toBe(400);
    });

    it('should return 400 for inactive poll (authenticated)', async () => {
      const pollDoc = await Poll.create({
        question: 'Test question?',
        options: ['Option 1', 'Option 2'],
        votes: [0, 0],
        creator: testUserId,
        isActive: false
      });
      const pollId = (pollDoc._id as mongoose.Types.ObjectId).toString();

      const response = await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ optionIndex: 0 });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('This poll is no longer active');
    });
  });

  describe('GET /api/polls/user/polls', () => {
    it('should get polls created by authenticated user', async () => {
      // Create polls for the test user
      await Poll.create({
        question: 'User Poll 1?',
        options: ['Option 1', 'Option 2'],
        creator: testUserId
      });

      await Poll.create({
        question: 'User Poll 2?',
        options: ['Option A', 'Option B'],
        creator: testUserId
      });

      const response = await request(app)
        .get('/api/polls/user/polls')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
    });

    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/polls/user/polls');

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/polls/:id', () => {
    it('should delete a poll owned by the user', async () => {
      const pollDoc = await Poll.create({
        question: 'Test question?',
        options: ['Option 1', 'Option 2'],
        creator: testUserId
      });

      const pollId = (pollDoc._id as mongoose.Types.ObjectId).toString();

      const response = await request(app)
        .delete(`/api/polls/${pollId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Poll deleted successfully');

      // Verify poll is deleted
      const deletedPoll = await Poll.findById(pollId);
      expect(deletedPoll).toBeNull();
    });

    it('should return 401 for unauthenticated requests', async () => {
      const pollDoc = await Poll.create({
        question: 'Test question?',
        options: ['Option 1', 'Option 2'],
        creator: testUserId
      });

      const pollId = (pollDoc._id as mongoose.Types.ObjectId).toString();

      const response = await request(app)
        .delete(`/api/polls/${pollId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/polls/:id/status', () => {
    it('should update poll status for poll owner', async () => {
      const pollDoc = await Poll.create({
        question: 'Test question?',
        options: ['Option 1', 'Option 2'],
        creator: testUserId,
        isActive: true
      });

      const pollId = (pollDoc._id as mongoose.Types.ObjectId).toString();

      const response = await request(app)
        .patch(`/api/polls/${pollId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isActive: false });

      expect(response.status).toBe(200);
      expect(response.body.isActive).toBe(false);
    });

    it('should return 401 for unauthenticated status update', async () => {
      const pollDoc = await Poll.create({
        question: 'Test question?',
        options: ['Option 1', 'Option 2'],
        creator: testUserId
      });

      const pollId = (pollDoc._id as mongoose.Types.ObjectId).toString();

      const response = await request(app)
        .patch(`/api/polls/${pollId}/status`)
        .send({ isActive: false });

      expect(response.status).toBe(401);
    });
  });
});