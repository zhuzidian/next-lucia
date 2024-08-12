import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres("postgres://postgres:postgres@192.168.10.152:5432/postgres");
export const db = drizzle(client)
