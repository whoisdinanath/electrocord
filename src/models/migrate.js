import sql from "../database/db.js";
import fs from "fs";
import path from "path";
// read the script from ./completeDatabase

const migrate = async () => {
    const script = fs.readFileSync(
        path.resolve(__dirname, "../../completeDatabase.sql"),
        "utf-8"
    );
    try {
        await sql.query(script);
        console.log("Database migrated successfully");
    } catch (error) {
        console.log(error);
    }
    }
migrate();
export default migrate;
