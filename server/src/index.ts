import express from 'express';
import cors from 'cors';
import pollRoutes from './routes/pollRoutes';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/polls', pollRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
