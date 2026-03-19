import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { streamChat } from './controllers/chatController.js';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

app.post('/api/orchestrator', streamChat);

app.get('/health', (req, res) => {
  res.json({ status: "backend running" });
});

// Default error handler
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});
