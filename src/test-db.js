const sql = require('mssql');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST?.replace('\\\\', '\\') || '',  // Handle backslash escaping
    database: process.env.DB_NAME,
    options: {
        encrypt: false,  // For local dev
        trustServerCertificate: true,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

async function testConnection() {
    let pool = null;
    
    try {
        // Log connection attempt
        console.log('\n=== Database Connection Test ===');
        console.log('Attempting to connect to SQL Server...');
        console.log('Configuration:', {
            user: config.user,
            server: config.server,
            database: config.database,
            // password intentionally omitted
        });

        // Create connection pool
        pool = await new sql.ConnectionPool(config).connect();
        console.log('\n✅ Connection successful!');

        // Check table structure
        console.log('\n=== Checking Table Structure ===');
        const tableInfo = await pool.request().query(`
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'entries'
            ORDER BY ORDINAL_POSITION;
        `);

        console.log('\nTable structure:');
        tableInfo.recordset.forEach(col => {
            console.log(`${col.COLUMN_NAME}: ${col.DATA_TYPE}(${col.CHARACTER_MAXIMUM_LENGTH || 'n/a'})`);
        });

        // Read existing records
        console.log('\n=== Reading Existing Records ===');
        const existingRecords = await pool.request().query(`
            SELECT phone, url FROM entries
        `);
        
        if (existingRecords.recordset.length > 0) {
            console.log('\nExisting records:');
            existingRecords.recordset.forEach(record => {
                console.log(`Phone: ${record.phone}`);
                console.log(`URL: ${record.url}`);
                console.log('---');
            });
        } else {
            console.log('\nNo existing records found.');
        }

        // Test inserting a new record
        console.log('\n=== Testing Insert Operation ===');
        const testPhone = '+1-555-TEST';
        const testUrl = 'https://test-crm.example.com/test';

        // First check if test record exists
        const checkExisting = await pool.request()
            .input('phone', sql.VarChar(20), testPhone)
            .query('SELECT COUNT(*) as count FROM entries WHERE phone = @phone');

        if (checkExisting.recordset[0].count > 0) {
            console.log(`\nTest record with phone ${testPhone} already exists. Skipping insert.`);
        } else {
            // Insert test record
            await pool.request()
                .input('phone', sql.VarChar(20), testPhone)
                .input('url', sql.VarChar(500), testUrl)
                .query(`
                    INSERT INTO entries (phone, url) 
                    VALUES (@phone, @url)
                `);
            console.log('\n✅ Test record inserted successfully');
        }

        // Verify the insert
        const verifyInsert = await pool.request()
            .input('phone', sql.VarChar(20), testPhone)
            .query('SELECT phone, url FROM entries WHERE phone = @phone');

        if (verifyInsert.recordset.length > 0) {
            console.log('\nVerified inserted record:');
            const record = verifyInsert.recordset[0];
            console.log(`Phone: ${record.phone}`);
            console.log(`URL: ${record.url}`);
        }

        // Clean up test record
        console.log('\n=== Cleaning Up ===');
        await pool.request()
            .input('phone', sql.VarChar(20), testPhone)
            .query('DELETE FROM entries WHERE phone = @phone');
        console.log('Test record cleaned up');

    } catch (err) {
        console.error('\n❌ Error during database operations:');
        console.error('Message:', err.message);
        if (err.stack) {
            console.error('Stack:', err.stack);
        }
        
        // Additional troubleshooting info
        console.log('\nTroubleshooting steps:');
        console.log('1. Verify SQL Server is running on KFG_Server');
        console.log('2. Check firewall settings');
        console.log('3. Verify environment variables in .env file');
        console.log('4. Ensure SQL Server authentication is properly configured');
        
        process.exit(1);
    } finally {
        if (pool) {
            await pool.close();
            console.log('\nConnection pool closed.');
        }
    }
}

// Run the test
testConnection(); 