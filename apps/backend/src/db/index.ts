import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL ?? 'postgresql://comutitres:comutitres_dev@localhost:5432/comutitres'
const client = postgres(connectionString)

export const db = drizzle(client, { schema })
export const sql = client
