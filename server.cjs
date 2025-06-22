require('dotenv').config();

console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);

const sql = require('mssql');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Database configuration
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    options: {
        port: parseInt(process.env.DB_PORT, 10),
        trustServerCertificate: true,
        encrypt: false
    }
};

// Simple router function
function router(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const method = req.method;

    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Serve static files
    if (method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        });
        return;
    }

    // Handle redirect
    if (method === 'GET' && url.pathname.startsWith('/redirect/')) {
        const phone = url.pathname.split('/')[2];
        sql.connect(config).then(pool => {
            return pool.request()
                .input('phone', sql.VarChar, phone)
                .query('SELECT url FROM entries WHERE phone = @phone');
        }).then(result => {
            if (result.recordset.length > 0) {
                res.writeHead(302, { 'Location': result.recordset[0].url });
                res.end();
            } else {
                res.writeHead(404);
                res.end('No CRM URL found for this phone number');
            }
        }).catch(err => {
            console.error('Database error:', err);
            res.writeHead(500);
            res.end('Server error');
        });
        return;
    }

    // Handle /client/$PHONENUMBER redirect
    if (method === 'GET' && url.pathname.startsWith('/client/$')) {
        const phone = url.pathname.split('/')[2].replace(/^\$/, '');
        sql.connect(config).then(pool => {
            return pool.request()
                .input('phone', sql.VarChar, phone)
                .query('SELECT url FROM entries WHERE phone = @phone');
        }).then(result => {
            if (result.recordset.length > 0) {
                res.writeHead(302, { 'Location': result.recordset[0].url });
                res.end();
            } else {
                res.writeHead(404);
                res.end('No CRM URL found for this phone number');
            }
        }).catch(err => {
            console.error('Database error:', err);
            res.writeHead(500);
            res.end('Server error');
        });
        return;
    }

    // API endpoints
    if (url.pathname === '/api/entries') {
        if (method === 'GET') {
            sql.connect(config).then(pool => {
                return pool.request()
                    .query('SELECT phone, url FROM entries ORDER BY phone');
            }).then(result => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result.recordset));
            }).catch(err => {
                console.error('Database error:', err);
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Failed to fetch entries' }));
            });
            return;
        }

        if (method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                let { phone, url } = JSON.parse(body);
                phone = phone.replace(/^"|"$/g, '');
                url = url.replace(/^"|"$/g, '');
                sql.connect(config).then(pool => {
                    return pool.request()
                        .input('phone', sql.VarChar, phone)
                        .input('url', sql.VarChar, url)
                        .query(`MERGE INTO entries AS target
                                USING (SELECT @phone AS phone, @url AS url) AS source
                                ON target.phone = source.phone
                                WHEN MATCHED THEN
                                    UPDATE SET url = source.url
                                WHEN NOT MATCHED THEN
                                    INSERT (phone, url) VALUES (source.phone, source.url);`);
                }).then(() => {
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Entry added or updated' }));
                }).catch(err => {
                    console.error('Database error:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to add or update entry' }));
                });
            });
            return;
        }
    }

    if (url.pathname.startsWith('/api/entries/')) {
        if (method === 'DELETE') {
            let phone = url.pathname.split('/')[3];
            phone = String(phone).replace(/^"|"$/g, '').trim();
            console.log('Deleting phone:', phone);
            sql.connect(config).then(pool => {
                return pool.request()
                    .input('phone', sql.VarChar, phone)
                    .query('DELETE FROM entries WHERE phone = @phone');
            }).then(result => {
                if (result.rowsAffected[0] === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Entry not found' }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Entry deleted' }));
                }
            }).catch(err => {
                console.error('Database error:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to delete entry' }));
            });
            return;
        }
    }

    // Handle 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
}

// Test database connection and start server
sql.connect(config).then(() => {
    console.log('Database connection successful');
    
    // Create table if it doesn't exist
    return sql.query`
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'entries')
        BEGIN
            CREATE TABLE entries (
                phone VARCHAR(20) PRIMARY KEY,
                url VARCHAR(500) NOT NULL
            )
        END
    `;
}).then(() => {
    const port = process.env.PORT || 3001;
    const certPath = 'C:\\certs\\server.pfx';
    const certPassword = 'YourPassword123!';
    
    // Check if certificate exists
    if (fs.existsSync(certPath)) {
        console.log('Certificate found, starting HTTPS server...');
        
        // Read certificate file
        const pfx = fs.readFileSync(certPath);
        
        // Create HTTPS server
        const httpsServer = https.createServer({
            pfx: pfx,
            passphrase: certPassword
        }, router);
        
        httpsServer.listen(port, '0.0.0.0', () => {
            console.log(`HTTPS Server running at https://kfg_server:${port}`);
        });
    } else {
        console.log('Certificate not found, starting HTTP server...');
        
        // Create HTTP server as fallback
        const httpServer = http.createServer(router);
        
        httpServer.listen(port, '0.0.0.0', () => {
            console.log(`HTTP Server running at http://kfg_server:${port}`);
        });
    }
}).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
}); 