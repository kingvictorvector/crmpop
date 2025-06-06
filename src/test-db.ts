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

async function testConnection() {
  let pool: sql.ConnectionPool | null = null;
  try {
    console.log('Testing database connection...');
    console.log('Using configuration:', {
      ...config,
      password: '***hidden***'
    });
    
    pool = await new sql.ConnectionPool(config).connect();
    console.log('Successfully connected to database!');
    
    // Test if the entries table exists
    const result = await pool.request().query(`
      SELECT COUNT(*) as tableExists 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'entries'
    `);
    
    if (result.recordset[0].tableExists === 0) {
      console.log('Creating entries table...');
      await pool.request().query(`
        CREATE TABLE entries (
          phone VARCHAR(20) PRIMARY KEY,
          url VARCHAR(500) NOT NULL
        )
      `);
      console.log('Table created successfully!');
    } else {
      console.log('Entries table already exists.');
      
      // Count existing entries
      const count = await pool.request().query('SELECT COUNT(*) as count FROM entries');
      console.log(`Current number of entries: ${count.recordset[0].count}`);
    }
  } catch (err) {
    console.error('Database connection test failed:', err);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

testConnection(); 