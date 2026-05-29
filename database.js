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
            price_cents INTEGER DEFAULT 0,
            stock INTEGER DEFAULT 100,
            desc TEXT,
            rating REAL,
            reviews INTEGER,
            category TEXT,
            badge TEXT,
            imageMain TEXT,
            imageHover TEXT,
            variants TEXT
        )`);

        // Migrations — add columns if they don't exist (idempotent)
        const safeAddColumn = (sql) => db.run(sql, (err) => {
            if (err && !err.message.includes('duplicate column')) {
                console.error('Migration error:', err.message);
            }
        });
        safeAddColumn(`ALTER TABLE products ADD COLUMN variants TEXT`);
        safeAddColumn(`ALTER TABLE products ADD COLUMN price_cents INTEGER DEFAULT 0`);
        safeAddColumn(`ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 100`);
        safeAddColumn(`ALTER TABLE orders ADD COLUMN email TEXT`);
        safeAddColumn(`ALTER TABLE orders ADD COLUMN shipping_address TEXT`);

        // Backfill price_cents from price string (one-shot, only where 0)
        db.all(`SELECT id, price FROM products WHERE COALESCE(price_cents, 0) = 0 AND price IS NOT NULL`, [], (err, rows) => {
            if (err || !rows || rows.length === 0) return;
            const toCents = (raw) => {
                const n = parseFloat(String(raw).replace(/[^0-9.]/g, ''));
                return isNaN(n) ? 0 : Math.round(n * 100);
            };
            rows.forEach(r => {
                const cents = toCents(r.price);
                if (cents > 0) db.run(`UPDATE products SET price_cents = ? WHERE id = ?`, [cents, r.id]);
            });
            if (rows.length > 0) console.log(`Backfilled price_cents for ${rows.length} products.`);
        });
    }
});

module.exports = db;
