import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health';
import parseRouter from './routes/parse';
import analyzeRouter from './routes/analyze';
import { logStartupDiagnostics } from './ai/config';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// Routes
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'CV Analyzer API Backend Server is running',
    status: 'ok',
    endpoints: {
      health: '/api/health',
      parse: '/api/parse',
      analyze: '/api/analyze',
    },
  });
});

app.use('/api/health', healthRouter);
app.use('/api/parse', parseRouter);
app.use('/api/analyze', analyzeRouter);

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
  logStartupDiagnostics();
});
