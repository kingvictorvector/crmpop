import express from 'express';
import { getEntries, addEntry, deleteEntry, addBatchEntries, Entry } from '../services/database.js';

const router = express.Router();

// Get all entries
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/entries - Fetching all entries');
    const entries = await getEntries();
    console.log('Entries fetched:', entries);
    res.json(entries);
  } catch (error) {
    console.error('Error getting entries:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Add a new entry
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/entries - Adding new entry');
    const entry: Entry = req.body;
    console.log('Received entry:', entry);
    
    if (!entry.phone || !entry.url) {
      console.error('Validation failed:', { phone: entry.phone, url: entry.url });
      return res.status(400).json({ error: 'Phone and URL are required' });
    }

    await addEntry(entry);
    console.log('Entry added successfully:', entry);
    res.status(201).json({ message: 'Entry added successfully' });
  } catch (error) {
    console.error('Error adding entry:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Delete an entry
router.delete('/:phone', async (req, res) => {
  try {
    console.log('DELETE /api/entries/:phone - Deleting entry');
    const { phone } = req.params;
    console.log('Deleting phone:', phone);
    await deleteEntry(phone);
    console.log('Entry deleted successfully:', phone);
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting entry:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Batch upload entries
router.post('/batch', async (req, res) => {
  try {
    console.log('POST /api/entries/batch - Adding batch entries');
    const { entries } = req.body;
    console.log('Received entries:', entries);
    
    if (!Array.isArray(entries)) {
      console.error('Invalid request: entries is not an array');
      return res.status(400).json({ error: 'Entries must be an array' });
    }
    
    await addBatchEntries(entries);
    console.log('Batch entries added successfully');
    res.status(201).json({ message: 'Entries added successfully' });
  } catch (error) {
    console.error('Error adding batch entries:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router; 