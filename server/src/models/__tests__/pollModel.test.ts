import mongoose from 'mongoose';
import { Poll } from '../pollModel';
import { User } from '../userModel';

describe('Poll Model', () => {
  let testUserId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/test-db');
    
    // Create a test user for the creator field
    const testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpassword123'
    });
    testUserId = testUser._id;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Poll.deleteMany({});
  });

  it('should create a poll with valid data', async () => {
    const pollData = {
      question: 'Test question?',
      options: ['Option 1', 'Option 2'],
      creator: testUserId
    };

    const poll = await Poll.create(pollData);
    
    expect(poll.question).toBe(pollData.question);
    expect(poll.options).toHaveLength(2);
    expect(poll.votes).toEqual([0, 0]);
    expect(poll.createdAt).toBeInstanceOf(Date);
    expect(poll.creator.toString()).toBe(testUserId.toString());
  });

  it('should not create a poll without a question', async () => {
    const pollData = {
      options: ['Option 1', 'Option 2'],
      creator: testUserId
    };

    await expect(Poll.create(pollData)).rejects.toThrow();
  });

  it('should not create a poll with fewer than 2 options', async () => {
    const pollData = {
      question: 'Test question?',
      options: ['Option 1'],
      creator: testUserId
    };

    await expect(Poll.create(pollData)).rejects.toThrow();
  });

  it('should not create a poll without a creator', async () => {
    const pollData = {
      question: 'Test question?',
      options: ['Option 1', 'Option 2']
    };

    await expect(Poll.create(pollData)).rejects.toThrow('creator: Path `creator` is required');
  });
});