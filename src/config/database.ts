import dotenv from 'dotenv';
import { config as sqlConfig } from 'mssql';

dotenv.config();

export const config: sqlConfig = {
    server: process.env.DB_HOST || 'KFG_Server\\SQLEXPRESS',
    database: process.env.DB_NAME || 'KingVVApp',
    user: process.env.DB_USER || 'KingVictorVector',
    password: process.env.DB_PASSWORD,
    options: {
        trustServerCertificate: true,
        encrypt: false,
        enableArithAbort: true
    }
}; 