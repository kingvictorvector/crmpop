const sql = require('mssql');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Database configuration
const config = {
    user: 'KingVictorVector',
    password: 'my secure password',
    server: 'KFG_Server',
    database: 'KingVVApp',
    options: {
        instanceName: 'SQLEXPRESS',
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
                const { phone, url } = JSON.parse(body);
                sql.connect(config).then(pool => {
                    return pool.request()
                        .input('phone', sql.VarChar, phone)
                        .input('url', sql.VarChar, url)
                        .query('INSERT INTO entries (phone, url) VALUES (@phone, @url)');
                }).then(() => {
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Entry added' }));
                }).catch(err => {
                    console.error('Database error:', err);
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: 'Failed to add entry' }));
                });
            });
            return;
        }

        if (method === 'DELETE') {
            const phone = url.pathname.split('/')[3];
            sql.connect(config).then(pool => {
                return pool.request()
                    .input('phone', sql.VarChar, phone)
                    .query('DELETE FROM entries WHERE phone = @phone');
            }).then(() => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Entry deleted' }));
            }).catch(err => {
                console.error('Database error:', err);
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Failed to delete entry' }));
            });
            return;
        }
    }

    // Handle 404
    res.writeHead(404);
    res.end('Not found');
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
    const server = http.createServer(router);
    const port = 3001;
    server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
}); 