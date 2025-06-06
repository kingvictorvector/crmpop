import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Box,
  Divider,
  CircularProgress,
  Snackbar,
  Link
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InfoIcon from '@mui/icons-material/Info';
import Papa from 'papaparse';
import axios from 'axios';

interface Entry {
  phone: string;
  url: string;
}

const ManageEntries: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [newPhone, setNewPhone] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/entries');
      setEntries(response.data);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ text: 'Error loading entries', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post('/api/entries', {
        phone: newPhone,
        url: newUrl
      });

      setMessage({ text: 'Entry added successfully!', type: 'success' });
      setNewPhone('');
      setNewUrl('');
      await loadData();
    } catch (error) {
      console.error('Error adding entry:', error);
      setMessage({ text: 'Error adding entry', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (phone: string) => {
    try {
      setLoading(true);
      await axios.delete(`/api/entries/${phone}`);
      setMessage({ text: 'Entry deleted successfully!', type: 'success' });
      await loadData();
    } catch (error) {
      console.error('Error deleting entry:', error);
      setMessage({ text: 'Error deleting entry', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage({ text: 'Processing file...', type: 'info' });
    setLoading(true);

    Papa.parse<string[]>(file, {
      complete: async (results) => {
        try {
          const entries = results.data
            .filter((row) => row.length >= 2)
            .map((row) => ({
              phone: row[0]?.trim(),
              url: row[1]?.trim()
            }))
            .filter((entry) => entry.phone && entry.url);

          await axios.post('/api/entries/batch', { entries });
          setMessage({ text: 'Upload successful!', type: 'success' });
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          await loadData();
        } catch (error) {
          console.error('Error uploading entries:', error);
          setMessage({ text: 'Upload failed. Please try again.', type: 'error' });
        } finally {
          setLoading(false);
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setMessage({ text: 'Error parsing CSV. Please check the file format.', type: 'error' });
        setLoading(false);
      },
      header: false,
      skipEmptyLines: true
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          CRM Screen Pop Tool
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <InfoIcon sx={{ mr: 1 }} /> Redirect URL Format
          </Typography>
          <Typography variant="body1" gutterBottom>
            Use the following format for redirect URLs:
          </Typography>
          <Box sx={{ 
            bgcolor: 'grey.100', 
            p: 2, 
            borderRadius: 1,
            fontFamily: 'monospace',
            mb: 2
          }}>
            {window.location.origin}/redirect/$phone_number
          </Box>
          <Typography variant="body2" color="text.secondary">
            Replace $phone_number with the actual phone number. For example:
            <br />
            <Link href={`${window.location.origin}/redirect/1234567890`} target="_blank">
              {window.location.origin}/redirect/1234567890
            </Link>
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add New Entry
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Phone Number"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="e.g., 2065550123"
              required
              sx={{ flex: 1 }}
            />
            <TextField
              label="CRM URL"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://crm.redtailtechnology.com/contacts/123"
              required
              sx={{ flex: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              Add Entry
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Batch Upload
          </Typography>
          <Box sx={{ mb: 2 }}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
              id="csv-upload"
            />
            <label htmlFor="csv-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                disabled={loading}
              >
                Upload CSV
              </Button>
            </label>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              CSV Format: Phone Number,CRM URL (no header row)
              <br />
              Example: 2065550123,https://crm.redtailtechnology.com/contacts/123
            </Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Current Entries
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : entries.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              No entries yet.
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Phone Number</TableCell>
                    <TableCell>CRM URL</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.phone}>
                      <TableCell>{entry.phone}</TableCell>
                      <TableCell>
                        <Link href={entry.url} target="_blank" rel="noopener noreferrer">
                          {entry.url}
                        </Link>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleDelete(entry.phone)}
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      <Snackbar
        open={!!message}
        autoHideDuration={6000}
        onClose={() => setMessage(null)}
      >
        <Alert
          onClose={() => setMessage(null)}
          severity={message?.type}
          sx={{ width: '100%' }}
        >
          {message?.text}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ManageEntries; 