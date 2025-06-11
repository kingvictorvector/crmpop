import * as sql from 'mssql';
import * as dotenv from 'dotenv';

dotenv.config();

const config: sql.config = {
  user: process.env.DB_USER || 'KingVictorVector',
  password: process.env.DB_PASSWORD,
  server: (process.env.DB_HOST || 'KFG_Server\\SQLEXPRESS').replace('\\\\', '\\'),
  database: process.env.DB_NAME || 'KingVVApp',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

console.log('Database config (without password):', {
  ...config,
  password: '***hidden***'
});

export interface Entry {
  phone: string;
  url: string;
}

export async function getEntries(): Promise<Entry[]> {
  console.log('Database: Attempting to get all entries');
  console.log('Using database config:', { ...config, password: '***hidden***' });
  
  const pool = await new sql.ConnectionPool(config).connect();
  try {
    console.log('Database: Connected successfully');
    const result = await pool.request().query('SELECT phone, url FROM entries');
    console.log('Database: Retrieved entries count:', result.recordset.length);
    return result.recordset;
  } catch (error) {
    console.error('Database error in getEntries:', error);
    throw error;
  } finally {
    await pool.close();
    console.log('Database: Connection closed');
  }
}

export async function addEntry(entry: Entry): Promise<void> {
  console.log('Database: Attempting to add entry:', entry);
  console.log('Using database config:', { ...config, password: '***hidden***' });
  
  const pool = await new sql.ConnectionPool(config).connect();
  try {
    console.log('Database: Connected successfully');
    await pool.request()
      .input('phone', sql.VarChar, entry.phone)
      .input('url', sql.VarChar, entry.url)
      .query('INSERT INTO entries (phone, url) VALUES (@phone, @url)');
    console.log('Database: Entry added successfully');
  } catch (error) {
    console.error('Database error in addEntry:', error);
    throw error;
  } finally {
    await pool.close();
    console.log('Database: Connection closed');
  }
}

export async function deleteEntry(phone: string): Promise<void> {
  console.log('Database: Attempting to delete entry with phone:', phone);
  console.log('Using database config:', { ...config, password: '***hidden***' });
  
  const pool = await new sql.ConnectionPool(config).connect();
  try {
    console.log('Database: Connected successfully');
    await pool.request()
      .input('phone', sql.VarChar, phone)
      .query('DELETE FROM entries WHERE phone = @phone');
    console.log('Database: Entry deleted successfully');
  } catch (error) {
    console.error('Database error in deleteEntry:', error);
    throw error;
  } finally {
    await pool.close();
    console.log('Database: Connection closed');
  }
}

export async function addBatchEntries(entries: Entry[]): Promise<void> {
  console.log('Database: Attempting to add batch entries:', entries);
  console.log('Using database config:', { ...config, password: '***hidden***' });
  
  const pool = await new sql.ConnectionPool(config).connect();
  try {
    console.log('Database: Connected successfully');
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      for (const entry of entries) {
        await transaction.request()
          .input('phone', sql.VarChar, entry.phone)
          .input('url', sql.VarChar, entry.url)
          .query('INSERT INTO entries (phone, url) VALUES (@phone, @url)');
      }
      await transaction.commit();
      console.log('Database: Batch entries added successfully');
    } catch (err) {
      console.error('Database error during transaction:', err);
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error('Database error in addBatchEntries:', error);
    throw error;
  } finally {
    await pool.close();
    console.log('Database: Connection closed');
  }
} 