import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import entriesRouter from './routes/entries.js';
import { Entry, getEntries } from './services/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDevelopment = process.env.NODE_ENV === 'development';

const app = express();
const port = Number(process.env.PORT) || 3001;

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// CORS configuration - in production, only allow the server's own address
app.use(cors({
  origin: isDevelopment
    ? ['http://localhost:3000', 'http://localhost:3001']
    : [`http://KFG_Server:${port}`]
}));

// Middleware
app.use(express.json());

// API Routes
app.use('/api/entries', entriesRouter);

// Serve static files from the React build
app.use(express.static(path.join(__dirname, '../build')));

// Redirect endpoint
app.get('/redirect/:phone', async (req, res) => {
  const { phone } = req.params;
  try {
    // Use direct database query instead of internal HTTP request
    const entries = await getEntries();
    const entry = entries.find((e: Entry) => e.phone === phone);
    
    if (entry) {
      res.redirect(entry.url);
    } else {
      // If no match found, redirect to the main UI with the phone number as a query param
      res.redirect(`/?phone=${phone}`);
    }
  } catch (error) {
    console.error('Error in redirect:', error);
    res.redirect('/?error=true');
  }
});

// Handle all other routes by serving the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send(isDevelopment ? `Error: ${err.message}\n${err.stack}` : 'Something broke!');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running in ${isDevelopment ? 'development' : 'production'} mode on port ${port}`);
  console.log(`Access the application at http://KFG_Server:${port}`);
}); 