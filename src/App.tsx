import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import ManageEntries from './components/ManageEntries';
import Redirect from './components/Redirect';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<ManageEntries />} />
          <Route path="/manage" element={<ManageEntries />} />
          <Route path="/redirect/:phone" element={<Redirect />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App; 