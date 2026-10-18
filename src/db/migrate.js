import { readFile } from 'node:fs/promises';
import { pool } from './pool.js';
const sql=await readFile(new URL('./migrations/001_initial.sql',import.meta.url),'utf8');
try{for(const statement of sql.split(';').map(s=>s.trim()).filter(Boolean))await pool.query(statement);console.log('Calling service database schema is up to date.');}catch(error){console.error('Database migration failed:',error.message);process.exitCode=1;}finally{await pool.end();}
