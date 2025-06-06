import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import entriesRouter from './routes/entries.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/entries', entriesRouter);

// Serve static files from the React build
app.use(express.static(path.join(__dirname, '../build')));

// Redirect endpoint
app.get('/redirect/:phone', async (req, res) => {
  const { phone } = req.params;
  try {
    const response = await fetch(`http://localhost:${port}/api/entries`);
    const entries = await response.json();
    const entry = entries.find(e => e.phone === phone);
    
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
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 