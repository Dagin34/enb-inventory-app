// src/db/index.ts (FINAL CORRECTED VERSION - NO dotenv.config)
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
// Remove if present: import * as dotenv from 'dotenv';
// Remove if present: dotenv.config({ path: '.env' }); 

// neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in Next.js environment');
}

console.log('DEBUG (Next.js): DATABASE_URL prefix:', process.env.DATABASE_URL.substring(0, 50) + '...');

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}