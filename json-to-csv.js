const fs = require('fs');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('king-victor-vector-default-rtdb-export.json', 'utf8'));

// Extract the phoneToUrl object
const phoneToUrl = data.phoneToUrl;

// Convert to CSV format
const lines = Object.entries(phoneToUrl).map(([phone, url]) => `${phone},${url}`);

// Write to a CSV file
fs.writeFileSync('contacts.csv', lines.join('\n'), 'utf8');

console.log('CSV file created as contacts.csv');