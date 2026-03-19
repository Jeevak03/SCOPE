import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { streamChat } from './controllers/chatController.js';
import { ProxyAgent } from 'undici';

dotenv.config({ path: '.env.local' });

async function checkConnectivity() {
  try {
    const proxyAgent = process.env.HTTP_PROXY
      ? new ProxyAgent(process.env.HTTP_PROXY)
      : undefined;

    const res = await fetch("https://generativelanguage.googleapis.com", {
      dispatcher: proxyAgent
    } as any);
    console.log("✅ Gemini endpoint reachable");
  } catch (err) {
    console.error("❌ Cannot reach Gemini API. Possible firewall/VPN issue");
  }
}

// Ensure ENV is valid
if (process.env.LLM_PROVIDER !== 'openai' && !process.env.GEMINI_API_KEY && !process.env.VITE_GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY");
}

checkConnectivity();

const app = express();
const PORT = process.env.PORT || 3001;

console.log("✅ Using native fetch (Node.js built-in)");

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
