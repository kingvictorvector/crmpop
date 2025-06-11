import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, CircularProgress, Box, Alert } from '@mui/material';
import axios from 'axios';

interface Entry {
  phone: string;
  url: string;
}

const Redirect: React.FC = () => {
  const { phone } = useParams<{ phone: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndRedirect = async () => {
      if (!phone) {
        setError('No phone number provided');
        return;
      }

      try {
        const response = await axios.get<Entry[]>('/api/entries');
        const entry = response.data.find(e => e.phone === phone);
        
        if (entry) {
          window.location.href = entry.url;
        } else {
          setError('No matching CRM URL found for this phone number');
          setTimeout(() => {
            navigate('/');
          }, 3000);
        }
      } catch (error) {
        console.error('Error fetching entry:', error);
        setError('Error fetching CRM URL');
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    fetchAndRedirect();
  }, [phone, navigate]);

  if (error) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh'
        }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Typography variant="body1" color="text.secondary">
            Redirecting to home page...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Redirecting to CRM...
        </Typography>
      </Box>
    </Container>
  );
};

export default Redirect; 