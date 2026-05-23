import { Pool } from "pg";
import config from "../config/index";

export const pool = new Pool({
  connectionString: config.db_connection_string,
});

export const initDB = async () => {
  if (!config.db_connection_string) {
    console.error(
      "Database connection string is not configured. Skipping DB initialization.",
    );
    return;
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
          id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

          name VARCHAR(30) NOT NULL,

          email VARCHAR(255) UNIQUE NOT NULL,

          password TEXT NOT NULL,

          role VARCHAR(15) NOT NULL DEFAULT 'contributor'
              CHECK (role IN ('maintainer', 'contributor')),

          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
  `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues(
          id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

          title VARCHAR(150) NOT NULL,

          description TEXT NOT NULL
              CHECK (CHAR_LENGTH(description) >= 20),

          type VARCHAR(15) NOT NULL
              CHECK (type IN ('bug', 'feature_request')),

          status VARCHAR(15) NOT NULL DEFAULT 'open'
              CHECK (status IN ('open', 'in_progress', 'resolved')),

          reporter_id INTEGER NOT NULL,

          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
  `);

    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
};
