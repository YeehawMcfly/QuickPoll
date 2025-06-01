import mongoose from 'mongoose';
import { Poll } from '../pollModel';
import { User, IUser } from '../userModel';

describe('Poll Model', () => {
  let testUserId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    // Create a test user for the creator field
    const testUser: IUser = await User.create({
      username: 'testuser-model',
      email: 'testmodel@example.com',
      password: 'testpassword123'
    });
    testUserId = testUser._id as mongoose.Types.ObjectId;
  });

  afterAll(async () => {
    // Clean up specific test data
    await User.deleteOne({ _id: testUserId });
  });

  beforeEach(async () => {
    // Only clear polls before each test
    await Poll.deleteMany({ creator: testUserId });
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

    await expect(Poll.create(pollData)).rejects.toThrow();
  });

  it('should initialize votes array with zeros', async () => {
    const pollData = {
      question: 'Test question with 3 options?',
      options: ['Option 1', 'Option 2', 'Option 3'],
      creator: testUserId
    };

    const poll = await Poll.create(pollData);
    expect(poll.votes).toEqual([0, 0, 0]);
  });

  it('should set isActive to true by default', async () => {
    const pollData = {
      question: 'Test question?',
      options: ['Option 1', 'Option 2'],
      creator: testUserId
    };

    const poll = await Poll.create(pollData);
    expect(poll.isActive).toBe(true);
  });
});