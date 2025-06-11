import express from 'express';
import cors from 'cors';
import path from 'path';
import { entriesRouter } from '../routes/entries';
import { config } from '../config/database';

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// API routes
app.use('/api/entries', entriesRouter);

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, '../../build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 