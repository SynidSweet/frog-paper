import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema.js'

// For development, you can use a local fallback
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/frogpaper'

const sql = neon(connectionString)
export const db = drizzle(sql, { schema })