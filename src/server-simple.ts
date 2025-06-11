const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const multer = require('multer');
const csvParse = require('csv-parse');
const path = require('path');
const { config } = require('./config/database');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(cors());

// Serve static files (our HTML interface)
app.use(express.static(path.join(__dirname, 'public')));

// Redirect endpoint
app.get('/redirect/:phone', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('phone', sql.VarChar, req.params.phone)
            .query('SELECT url FROM entries WHERE phone = @phone');
        
        if (result.recordset.length > 0) {
            res.redirect(result.recordset[0].url);
        } else {
            res.status(404).send('No CRM URL found for this phone number');
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Server error');
    }
});

// Get all entries
app.get('/api/entries', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .query('SELECT phone, url FROM entries ORDER BY phone');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching entries:', err);
        res.status(500).json({ error: 'Failed to fetch entries' });
    }
});

// Add single entry
app.post('/api/entries', async (req, res) => {
    const { phone, url } = req.body;
    try {
        const pool = await sql.connect(config);
        await pool.request()
            .input('phone', sql.VarChar, phone)
            .input('url', sql.VarChar, url)
            .query('INSERT INTO entries (phone, url) VALUES (@phone, @url)');
        res.status(201).json({ message: 'Entry added' });
    } catch (err) {
        console.error('Error adding entry:', err);
        res.status(500).json({ error: 'Failed to add entry' });
    }
});

// Delete entry
app.delete('/api/entries/:phone', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        await pool.request()
            .input('phone', sql.VarChar, req.params.phone)
            .query('DELETE FROM entries WHERE phone = @phone');
        res.json({ message: 'Entry deleted' });
    } catch (err) {
        console.error('Error deleting entry:', err);
        res.status(500).json({ error: 'Failed to delete entry' });
    }
});

// Batch upload
app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const pool = await sql.connect(config);
        const records = await new Promise((resolve, reject) => {
            const results = [];
            csvParse.parse(req.file.buffer.toString(), {
                columns: false,
                trim: true
            })
            .on('data', (row) => results.push({ phone: row[0], url: row[1] }))
            .on('error', reject)
            .on('end', () => resolve(results));
        });

        for (const record of records) {
            await pool.request()
                .input('phone', sql.VarChar, record.phone)
                .input('url', sql.VarChar, record.url)
                .query('INSERT INTO entries (phone, url) VALUES (@phone, @url)');
        }

        res.json({ message: `${records.length} entries added` });
    } catch (err) {
        console.error('Error processing upload:', err);
        res.status(500).json({ error: 'Failed to process upload' });
    }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Access the interface at http://localhost:${port}`);
    console.log(`API available at http://localhost:${port}/api`);
}); 