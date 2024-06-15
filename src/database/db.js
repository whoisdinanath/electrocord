import postgres from 'postgres'
import dotenv from 'dotenv';

// const PGHOST = process.env.PGHOST
// const PGPORT = process.env.PGPORT
// const PGNAME = process.env.PGNAME
// const PGUSER = process.env.PGPORT
// const PGPASS = process.env.PGPASS

dotenv.config();
const { PGHOST, PGPORT, PGNAME, PGUSER, PGPASS } = process.env;



const sql = postgres({ 
    host: PGHOST,
    port: PGPORT,
    database: PGNAME,
    username: PGUSER,
    password: PGPASS
})

export default sql

