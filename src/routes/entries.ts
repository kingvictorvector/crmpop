import express from 'express';
import { sql, config } from '../config/database';

const router = express.Router();

// Get all entries
router.get('/', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM entries');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching entries:', err);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// Add new entry
router.post('/', async (req, res) => {
  const { phone, url } = req.body;
  
  if (!phone || !url) {
    return res.status(400).json({ error: 'Phone number and URL are required' });
  }

  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('phone', sql.VarChar(20), phone)
      .input('url', sql.VarChar(500), url)
      .query('INSERT INTO entries (phone, url) VALUES (@phone, @url)');
    
    res.status(201).json({ message: 'Entry added successfully' });
  } catch (err) {
    console.error('Error adding entry:', err);
    res.status(500).json({ error: 'Failed to add entry' });
  }
});

// Delete entry
router.delete('/:phone', async (req, res) => {
  const { phone } = req.params;
  
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('phone', sql.VarChar(20), phone)
      .query('DELETE FROM entries WHERE phone = @phone');
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    res.json({ message: 'Entry deleted successfully' });
  } catch (err) {
    console.error('Error deleting entry:', err);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

export { router as entriesRouter }; 