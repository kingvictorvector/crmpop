const config = {
  apiBaseUrl: process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_API_URL 
    : 'http://localhost:3001/api',
  port: process.env.PORT || 3001
};

export default config; 