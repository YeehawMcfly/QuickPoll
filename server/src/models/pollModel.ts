// Temporary in-memory data store
export interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: number[];
}

export const polls: Poll[] = [];
