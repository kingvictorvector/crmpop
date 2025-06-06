import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config: sql.config = {
  user: process.env.DB_USER || 'KingVictorVector',
  password: process.env.DB_PASSWORD,
  server: 'KFG_Server',
  database: process.env.DB_NAME || 'KingVVApp',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    instanceName: 'SQLEXPRESS'
  }
};

async function addTestEntry() {
  let pool: sql.ConnectionPool | null = null;
  try {
    console.log('Connecting to database...');
    pool = await new sql.ConnectionPool(config).connect();
    console.log('Successfully connected to database!');
    
    // Test entry data
    const testEntry = {
      phone: '2065550199',
      url: 'https://test-crm.com/contact/test123'
    };
    
    console.log('Adding test entry:', testEntry);
    
    await pool.request()
      .input('phone', sql.VarChar, testEntry.phone)
      .input('url', sql.VarChar, testEntry.url)
      .query('INSERT INTO entries (phone, url) VALUES (@phone, @url)');
    
    console.log('Test entry added successfully!');
    
    // Verify the entry was added
    const result = await pool.request()
      .input('phone', sql.VarChar, testEntry.phone)
      .query('SELECT * FROM entries WHERE phone = @phone');
    
    console.log('Retrieved entry from database:', result.recordset[0]);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

addTestEntry(); 