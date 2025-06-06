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

export interface Entry {
  phone: string;
  url: string;
}

export async function getEntries(): Promise<Entry[]> {
  const pool = await new sql.ConnectionPool(config).connect();
  try {
    const result = await pool.request().query('SELECT phone, url FROM entries');
    return result.recordset;
  } finally {
    await pool.close();
  }
}

export async function addEntry(entry: Entry): Promise<void> {
  const pool = await new sql.ConnectionPool(config).connect();
  try {
    await pool.request()
      .input('phone', sql.VarChar, entry.phone)
      .input('url', sql.VarChar, entry.url)
      .query('INSERT INTO entries (phone, url) VALUES (@phone, @url)');
  } finally {
    await pool.close();
  }
}

export async function deleteEntry(phone: string): Promise<void> {
  const pool = await new sql.ConnectionPool(config).connect();
  try {
    await pool.request()
      .input('phone', sql.VarChar, phone)
      .query('DELETE FROM entries WHERE phone = @phone');
  } finally {
    await pool.close();
  }
}

export async function addBatchEntries(entries: Entry[]): Promise<void> {
  const pool = await new sql.ConnectionPool(config).connect();
  try {
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
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } finally {
    await pool.close();
  }
} 