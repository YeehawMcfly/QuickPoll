import mongoose from 'mongoose';
import { Poll } from '../pollModel';

describe('Poll Model', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/test-db');
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
      options: ['Option 1', 'Option 2']
    };

    const poll = await Poll.create(pollData);
    
    expect(poll.question).toBe(pollData.question);
    expect(poll.options).toHaveLength(2);
    expect(poll.votes).toEqual([0, 0]);
    expect(poll.createdAt).toBeInstanceOf(Date);
  });

  it('should not create a poll without a question', async () => {
    const pollData = {
      options: ['Option 1', 'Option 2']
    };

    await expect(Poll.create(pollData)).rejects.toThrow();
  });

  it('should not create a poll with fewer than 2 options', async () => {
    const pollData = {
      question: 'Test question?',
      options: ['Option 1']
    };

    await expect(Poll.create(pollData)).rejects.toThrow();
  });
});