import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const { PGHOST, PGPORT, PGNAME, PGUSER, PGPASS, PGSSL } = process.env;

const sql = postgres({ 
    host: PGHOST,
    port: PGPORT,
    database: PGNAME,
    username: PGUSER,
    password: PGPASS,
    ssl: PGSSL === 'true' ? true : false,
});

export default sql;
