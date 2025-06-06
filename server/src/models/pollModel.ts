import mongoose, { Document } from 'mongoose';

export interface IPoll extends Document {
  question: string;
  options: string[];
  votes: number[];
  createdAt: Date;
  creator: mongoose.Types.ObjectId;
  isActive: boolean;
  votedBy: mongoose.Types.ObjectId[]; // Add this line
}

const PollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Poll question is required'],
    trim: true
  },
  options: {
    type: [String],
    required: [true, 'Poll options are required'],
    validate: [(val: string[]) => val.length >= 2, 'Poll must have at least 2 options']
  },
  votes: {
    type: [Number],
    default: function(this: any) {
      // Initialize votes array with zeros matching the number of options
      return Array(this.options.length).fill(0);
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function(this: any) {
      return this.isNew;
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  votedBy: [{ // Add this field
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }]
});

// Export as a mongoose model
export const Poll = mongoose.model<IPoll>('Poll', PollSchema);
