import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { entriesRouter } from './routes/entries.js';
import type { Request, Response, NextFunction } from 'express';

// Load environment variables
dotenv.config();

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3001;
const host = process.env.HOST || '192.168.254.86'; // KFG_Server's IP

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Since this is internal, we can be more permissive
  frameguard: true,
  hsts: false, // No HTTPS required for internal network
}));

// Enable CORS with specific options for internal network
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [`http://${host}:${port}`]
    : `http://localhost:${port}`,
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Basic request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API routes
app.use('/api/entries', entriesRouter);

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, '../build')));

// Handle React routing, return all requests to React app
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, host, () => {
  console.log(`Server is running at http://${host}:${port}`);
  console.log(`API available at http://${host}:${port}/api`);
}); 