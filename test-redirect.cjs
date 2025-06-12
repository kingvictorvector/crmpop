const sql = require('mssql');
const http = require('http');
require('dotenv').config();

// Database configuration from environment variables
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST?.split('\\')[0] || '',
    database: process.env.DB_NAME,
    options: {
        trustServerCertificate: true,
        encrypt: false,
        instanceName: 'SQLEXPRESS'
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
        console.log(`Received request for: ${req.url}`);
        
        // Show helpful message for root path
        if (req.url === '/' || req.url === '') {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <html>
                <head>
                    <title>CRM Pop Service</title>
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
                        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
                        .example { margin: 20px 0; padding: 15px; background: #f8f8f8; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <h1>CRM Pop Service</h1>
                    <p>This service redirects phone numbers to their corresponding CRM URLs.</p>
                    
                    <h2>How to Use:</h2>
                    <p>Use the following URL format:</p>
                    <div class="example">
                        <code>http://localhost:3001/crmpop/redirect/$PHONENUMBER</code>
                    </div>
                    
                    <h2>Example:</h2>
                    <div class="example">
                        <code>http://localhost:3001/crmpop/redirect/$2061231234</code>
                    </div>
                    
                    <p>The service will automatically redirect you to the corresponding CRM record.</p>
                </body>
                </html>
            `);
            return;
        }

        // Match pattern: /crmpop/redirect/$PHONENUMBER
        const match = req.url.match(/^\/crmpop\/redirect\/\$(\d+)/);
        if (!match) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
                <html>
                <head>
                    <title>Invalid URL Format</title>
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
                        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
                        .example { margin: 20px 0; padding: 15px; background: #f8f8f8; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <h1>Invalid URL Format</h1>
                    <p>Please use the following format:</p>
                    <div class="example">
                        <code>http://localhost:3001/crmpop/redirect/$PHONENUMBER</code>
                    </div>
                    
                    <h2>Example:</h2>
                    <div class="example">
                        <code>http://localhost:3001/crmpop/redirect/$2061231234</code>
                    </div>
                    
                    <p><a href="/">Return to homepage</a></p>
                </body>
                </html>
            `);
            return;
        }

        const phone = match[1];
        console.log(`Looking up CRM URL for phone: ${phone}`);
        
        sql.connect(config).then(pool => {
            return pool.request()
                .input('phone', sql.VarChar, phone)
                .query('SELECT url FROM entries WHERE phone = @phone');
        }).then(result => {
            if (result.recordset.length > 0) {
                const url = result.recordset[0].url;
                console.log(`Redirecting ${phone} to: ${url}`);
                res.writeHead(302, { 'Location': url });
                res.end();
            } else {
                console.log(`No CRM URL found for phone: ${phone}`);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end(`No CRM record found for phone number ${phone}`);
            }
        }).catch(err => {
            console.error('Database query error:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal server error while looking up CRM record');
        });
    });

    // Handle server errors
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error('Port 3001 is already in use');
        } else {
            console.error('Server error:', err);
        }
        process.exit(1);
    });

    // Listen on port 3001
    const port = 3001;
    server.listen(port, '0.0.0.0', () => {
        console.log(`CRM Pop server running!`);
        console.log('Server is accessible at:');
        console.log(`http://localhost:${port}/crmpop/redirect/$PHONENUMBER`);
        console.log(`http://KFG_Server:${port}/crmpop/redirect/$PHONENUMBER`);
        console.log('\nExample:');
        console.log(`http://localhost:${port}/crmpop/redirect/$2061231234`);
    });

}).catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
}); 