const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

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
        safeAddColumn(`ALTER TABLE products ADD COLUMN sold_out INTEGER DEFAULT 0`);
        safeAddColumn(`ALTER TABLE orders ADD COLUMN email TEXT`);
        safeAddColumn(`ALTER TABLE orders ADD COLUMN shipping_address TEXT`);

        // ----------------------------------------------------------------
        // SEED AUTOMÁTICO desde products.json (catálogo versionado en Git).
        // Si la tabla de productos está VACÍA (p. ej. tras un despliegue
        // nuevo en Hostinger), cargamos el catálogo del archivo. Así los
        // productos NUNCA se pierden al actualizar la página: viven en el
        // repositorio y se recargan solos. Si ya hay productos, no toca nada.
        // ----------------------------------------------------------------
        const toCents = (raw) => {
            const n = parseFloat(String(raw == null ? '' : raw).replace(/[^0-9.]/g, ''));
            return isNaN(n) ? 0 : Math.round(n * 100);
        };
        db.get(`SELECT COUNT(*) AS c FROM products`, [], (err, row) => {
            if (err) return;
            if (row && row.c > 0) return; // ya hay productos: no hacemos nada
            const jsonPath = path.resolve(__dirname, 'products.json');
            if (!fs.existsSync(jsonPath)) return;
            let products;
            try { products = JSON.parse(fs.readFileSync(jsonPath, 'utf8')); }
            catch (e) { console.error('products.json inválido:', e.message); return; }
            if (!Array.isArray(products) || products.length === 0) return;

            const sql = `INSERT OR REPLACE INTO products
                (id, title, price, price_cents, stock, desc, rating, reviews, category, badge, imageMain, imageHover, variants)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');
                const stmt = db.prepare(sql);
                let n = 0;
                products.forEach(p => {
                    if (!p || !p.title) return;
                    const variants = typeof p.variants === 'string'
                        ? p.variants
                        : (p.variants ? JSON.stringify(p.variants) : null);
                    stmt.run(
                        p.id || null, p.title, p.price || '', toCents(p.price),
                        p.stock != null ? p.stock : 100, p.desc || '',
                        p.rating != null ? p.rating : 5, p.reviews != null ? p.reviews : 0,
                        p.category || '', p.badge || '', p.imageMain || '', p.imageHover || '', variants
                    );
                    n++;
                });
                stmt.finalize();
                db.run('COMMIT', (e) => {
                    if (e) console.error('Error al sembrar productos:', e.message);
                    else console.log(`Catálogo cargado desde products.json (${n} productos).`);
                });
            });
        });

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
