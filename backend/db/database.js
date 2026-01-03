import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create database in the backend folder
const dbPath = join(__dirname, "..", "globetrotter.db");
const db = new Database(dbPath);

// Initialize tables
function initDatabase() {
    // Create trips table
    db.exec(`
    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      start_date TEXT,
      end_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Create stops table
    db.exec(`
    CREATE TABLE IF NOT EXISTS stops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      city TEXT NOT NULL,
      mode TEXT,
      stay_days INTEGER DEFAULT 1,
      estimated_cost REAL,
      estimated_time TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    )
  `);

    console.log("Database initialized successfully");
}

// Run initialization
initDatabase();

export default db;
