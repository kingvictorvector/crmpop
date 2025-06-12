const sql = require('mssql');
const http = require('http');

// Database configuration
const config = {
    user: 'KingVictorVector',
    server: 'KFG_Server',
    database: 'KingVVApp',
    options: {
        instanceName: 'SQLEXPRESS',
        trustServerCertificate: true,
        encrypt: false
    }
};

// Test database connection first
console.log('Testing database connection...');
console.log('Connection config:', {
    server: config.server,
    database: config.database,
    user: config.user,
    instance: config.options.instanceName
});

sql.connect(config).then(() => {
    console.log('Database connection successful!');
    
    // Create server after successful database connection
    const server = http.createServer((req, res) => {
        const match = req.url.match(/^\/redirect\/(\d+)/);
        if (!match) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <h1>CRM Redirect Tester</h1>
                <form action="/redirect" method="GET" onsubmit="event.preventDefault(); window.location.href='/redirect/' + phone.value;">
                    <input type="text" name="phone" placeholder="Enter phone number" pattern="[0-9]+" required>
                    <button type="submit">Test Redirect</button>
                </form>
            `);
            return;
        }

        const phone = match[1];
        console.log(`Attempting to find URL for phone: ${phone}`);
        
        sql.connect(config).then(pool => {
            return pool.request()
                .input('phone', sql.VarChar, phone)
                .query('SELECT url FROM entries WHERE phone = @phone');
        }).then(result => {
            if (result.recordset.length > 0) {
                const url = result.recordset[0].url;
                console.log(`Found URL for ${phone}: ${url}`);
                res.writeHead(302, { 'Location': url });
                res.end();
            } else {
                console.log(`No URL found for phone: ${phone}`);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end(`No URL found for phone number ${phone}`);
            }
        }).catch(err => {
            console.error('Database query error:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Server error');
        });
    });

    // Listen on all network interfaces
    server.listen(3001, '0.0.0.0', () => {
        console.log('Test server running!');
        console.log('You can access it at:');
        console.log('- http://localhost:3001');
        console.log('- http://KFG_Server:3001');
        console.log('Try:');
        console.log('1. Visit the base URL for a test form');
        console.log('2. Or try /redirect/2065550199 for a direct redirect test');
    });

}).catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
}); 