import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL не установлен');
    }
    
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    
    pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle client', err);
    });
  }
  
  return pool;
}

export async function query(text: string, params?: any[]) {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    const err = error as Error;
    console.error('Query error:', err.message);
    throw error;
  } finally {
    client.release();
  }
}

export async function testConnection() {
  try {
    const result = await query('SELECT NOW()');
    return { success: true, time: result.rows[0].now };
  } catch (error) {
    const err = error as Error;
    console.error('Connection test failed:', err.message);
    return { success: false, error: err.message };
  }
}