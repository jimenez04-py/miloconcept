const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Orders Table
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            items TEXT,
            total REAL,
            status TEXT DEFAULT 'pending',
            transaction_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        // Products Table
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            price TEXT,
            desc TEXT,
            rating REAL,
            reviews INTEGER,
            category TEXT,
            badge TEXT,
            imageMain TEXT,
            imageHover TEXT,
            variants TEXT
        )`);

        // Migration: Add variants column if it doesn't exist (for existing databases)
        db.run(`ALTER TABLE products ADD COLUMN variants TEXT`, (err) => {
            if (err) {
                if (err.message.includes('duplicate column name')) {
                    // Column already exists, ignore
                } else {
                    console.error("Migration error:", err.message);
                }
            } else {
                console.log("Migration: Added variants column to products table.");
            }
        });
    }
});

module.exports = db;
