import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "mssql",
    host: process.env.DB_HOST || "10.11.3.143",
    port: parseInt(process.env.DB_PORT || "1433"),
    username: process.env.DB_USER || "dba",
    password: process.env.DB_PASSWORD || "@Dba.Pwd.0916#",
    database: process.env.DB_NAME || "ProtocoloDigital",
    requestTimeout: parseInt(process.env.DB_REQUEST_TIMEOUT || "60000"),
    synchronize: false,
    logging: process.env.DB_LOGGING === 'true' ? 'all' : ['error'],
    entities: ["src/entities/**/*.ts"],
    migrations: ["src/migrations/**/*.ts"],
    subscribers: [],
    options: {
        encrypt: false,
        trustServerCertificate: true,
        cancelTimeout: parseInt(process.env.DB_CANCEL_TIMEOUT || "10000")
    },
    extra: {
        trustServerCertificate: true
    }
});
