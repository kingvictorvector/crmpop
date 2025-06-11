import type { ConnectionPool, config as SqlConfig } from 'mssql';
const sql = require('mssql');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const config: SqlConfig = {
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

interface TableStatus {
    status: string;
}

interface TableCount {
    count: number;
}

async function testConnection(): Promise<void> {
    let pool: ConnectionPool | null = null;
    
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
        if (!pool) {
            throw new Error('Failed to create connection pool');
        }
        console.log('\n✅ Connection successful!');

        // Test basic query
        const versionResult = await pool.request().query('SELECT @@VERSION as version');
        console.log('\nSQL Server version:', versionResult.recordset[0].version);

        // Check for our tables
        const tablesResult = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
        `);
        
        console.log('\nAvailable tables:', tablesResult.recordset.map(r => r.TABLE_NAME).join(', '));

        // Test specific table
        const entriesResult = await pool.request().query(`
            IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'entries')
            BEGIN
                SELECT 'Table exists' as status;
                SELECT COUNT(*) as count FROM entries;
            END
            ELSE
            BEGIN
                SELECT 'Table does not exist' as status;
            END
        `);

        const status = entriesResult.recordsets[0][0] as TableStatus;
        
        if (status.status === 'Table exists') {
            console.log('\n✅ entries table exists');
            const count = entriesResult.recordsets[1][0] as TableCount;
            console.log('Number of records:', count.count);
        } else {
            console.log('\n⚠️ entries table does not exist');
        }

    } catch (err) {
        console.error('\n❌ Error connecting to database:');
        if (err instanceof Error) {
            console.error('Message:', err.message);
            console.error('Stack:', err.stack);
        } else {
            console.error('Unknown error:', err);
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