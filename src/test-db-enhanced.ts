import sql from 'mssql';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    console.log('Please ensure your .env file contains:');
    console.log(`
DB_HOST=KFG_Server\\SQLEXPRESS
DB_NAME=KingVVApp
DB_USER=KingVictorVector
DB_PASSWORD=your_password_here
    `);
    process.exit(1);
}

const config: sql.config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST?.split('\\')[0] || '', // Extract server name from DB_HOST
    database: process.env.DB_NAME,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        instanceName: 'SQLEXPRESS'
    }
};

async function testDatabaseConnection() {
    let pool: sql.ConnectionPool | null = null;
    try {
        console.log('Step 1: Testing SQL Server connection...');
        console.log('Configuration:', {
            ...config,
            password: '***hidden***'
        });

        pool = await new sql.ConnectionPool(config).connect();
        console.log('✅ Successfully connected to SQL Server!');

        console.log('\nStep 2: Testing database access...');
        const dbResult = await pool.request().query('SELECT DB_NAME() as currentDatabase');
        console.log(`✅ Connected to database: ${dbResult.recordset[0].currentDatabase}`);

        console.log('\nStep 3: Checking entries table...');
        const tableResult = await pool.request().query(`
            SELECT COUNT(*) as tableExists 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'entries'
        `);

        if (tableResult.recordset[0].tableExists === 0) {
            console.log('⚠️ Table "entries" does not exist. Creating it...');
            await pool.request().query(`
                CREATE TABLE entries (
                    phone VARCHAR(20) PRIMARY KEY,
                    url VARCHAR(500) NOT NULL
                )
            `);
            console.log('✅ Table "entries" created successfully!');
        } else {
            console.log('✅ Table "entries" exists');
            const countResult = await pool.request().query('SELECT COUNT(*) as count FROM entries');
            console.log(`ℹ️ Current number of entries: ${countResult.recordset[0].count}`);
        }

        console.log('\nStep 4: Testing table write access...');
        const testPhone = '1234567890';
        await pool.request()
            .input('phone', sql.VarChar, testPhone)
            .input('url', sql.VarChar, 'https://test.com')
            .query(`
                IF NOT EXISTS (SELECT 1 FROM entries WHERE phone = @phone)
                INSERT INTO entries (phone, url) VALUES (@phone, @url)
            `);
        console.log('✅ Successfully tested write access');

        // Clean up test entry
        await pool.request()
            .input('phone', sql.VarChar, testPhone)
            .query('DELETE FROM entries WHERE phone = @phone');
        console.log('✅ Successfully cleaned up test data');

        console.log('\n✅ ALL DATABASE TESTS PASSED! ✅');

    } catch (err) {
        console.error('\n❌ Database test failed!');
        if (err instanceof Error) {
            console.error('Error details:', {
                message: err.message,
                stack: err.stack
            });
        }
        
        // Additional SQL Server specific troubleshooting
        console.log('\n🔍 Troubleshooting steps:');
        console.log('1. Verify SQL Server is running:');
        console.log('   - Open SQL Server Configuration Manager');
        console.log('   - Check if SQL Server (SQLEXPRESS) service is running');
        console.log('2. Verify network connectivity:');
        console.log('   - Try ping KFG_Server');
        console.log('   - Check firewall settings');
        console.log('3. Verify credentials:');
        console.log('   - Confirm DB_USER and DB_PASSWORD in .env file');
        console.log('   - Try connecting with SQL Server Management Studio');
        process.exit(1);
    } finally {
        if (pool) {
            await pool.close();
            console.log('\nDatabase connection closed.');
        }
    }
}

testDatabaseConnection(); 