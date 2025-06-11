import * as sql from 'mssql';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config: sql.config = {
    server: process.env.SQL_SERVER || 'KFG_Server',
    database: process.env.SQL_DATABASE || 'KingVVApp',
    options: {
        instanceName: process.env.SQL_INSTANCE || 'SQLEXPRESS',
        trustServerCertificate: true,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    // Using Windows Authentication
    trustedConnection: true
};

async function testConnection(): Promise<void> {
    try {
        console.log('Attempting to connect to SQL Server...');
        console.log('Connection config:', {
            server: config.server,
            database: config.database,
            instance: config.options.instanceName
        });
        
        await sql.connect(config);
        const result = await sql.query('SELECT @@VERSION as version');
        console.log('\nConnection successful!');
        console.log('SQL Server version:', result.recordset[0].version);

        // Test if our table exists
        const tableResult = await sql.query`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
        `;
        console.log('\nAvailable tables:', tableResult.recordset.map(r => r.TABLE_NAME).join(', '));
    } catch (err) {
        console.error('\nError connecting to SQL Server:', err);
    } finally {
        await sql.close();
    }
}

testConnection(); 