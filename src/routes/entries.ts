import express from 'express';
import { getEntries, addEntry, deleteEntry, addBatchEntries, Entry } from '../services/database.js';

const router = express.Router();

// Get all entries
router.get('/', async (req, res) => {
  try {
    const entries = await getEntries();
    res.json(entries);
  } catch (error) {
    console.error('Error getting entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new entry
router.post('/', async (req, res) => {
  try {
    const entry: Entry = req.body;
    if (!entry.phone || !entry.url) {
      return res.status(400).json({ error: 'Phone and URL are required' });
    }
    await addEntry(entry);
    res.status(201).json({ message: 'Entry added successfully' });
  } catch (error) {
    console.error('Error adding entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete an entry
router.delete('/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    await deleteEntry(phone);
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Batch upload entries
router.post('/batch', async (req, res) => {
  try {
    const { entries } = req.body;
    if (!Array.isArray(entries)) {
      return res.status(400).json({ error: 'Entries must be an array' });
    }
    await addBatchEntries(entries);
    res.status(201).json({ message: 'Entries added successfully' });
  } catch (error) {
    console.error('Error adding batch entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 