import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ManageEntries from './components/ManageEntries';
import Redirect from './components/Redirect';
import './styles/App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <Router>
        <Routes>
          <Route path="/" element={<ManageEntries />} />
          <Route path="/manage" element={<ManageEntries />} />
          <Route path="/redirect/:phone" element={<Redirect />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App; 