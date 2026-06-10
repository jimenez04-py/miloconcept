const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const { MercadoPagoConfig, Preference } = require('mercadopago');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const db = require('./database');

const port = process.env.PORT || 3001;

// Trust X-Forwarded-* when running behind a proxy (Vercel/Render/etc.)
app.set('trust proxy', 1);

// Security headers (helmet) with CSP tuned for our external deps (MP SDK, Google Fonts, Unsplash)
app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            "default-src": ["'self'"],
            "script-src": ["'self'", "'unsafe-inline'", "https://sdk.mercadopago.com"],
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
            "img-src": ["'self'", "data:", "https:"],
            "connect-src": ["'self'", "https://api.mercadopago.com"],
            "frame-src": ["'self'", "https://www.mercadopago.com", "https://sdk.mercadopago.com"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// CORS — locked down via env. Set CORS_ORIGIN="https://tu-dominio.com" in prod.
const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
    : true; // permissive in dev
app.use(cors({ origin: corsOrigin }));

// Webhook needs raw access to body for potential signature verification — mount BEFORE express.json
// (we still parse JSON below for normal routes)
app.use(express.json({ limit: '100kb' }));

// --------------------------------------------------------------------------
// STATIC FILE GUARD (defense in depth)
// --------------------------------------------------------------------------
// The static root is the project root, so without this guard server-side
// source, the database, dependencies and receipts would be downloadable
// (e.g. GET /database.sqlite, /server.js, /receipts/receipt_5.pdf).
// We block them BEFORE express.static gets a chance to serve them.
const BLOCKED_EXACT = new Set([
    '/server.js', '/database.js', '/seed_products.js',
    '/package.json', '/package-lock.json',
]);
app.use((req, res, next) => {
    const p = req.path.toLowerCase();
    const blocked =
        BLOCKED_EXACT.has(p) ||
        p.endsWith('.sqlite') || p.endsWith('.db') ||
        p.endsWith('.env') || p.endsWith('.map') ||
        p.startsWith('/node_modules') ||
        p.startsWith('/receipts') ||
        p.startsWith('/.');
    if (blocked) return res.status(404).send('Not found');
    next();
});

// Serve static files. dotfiles:'deny' is a second line of defense for .env/.git
app.use(express.static(path.join(__dirname, '/'), { dotfiles: 'deny' }));

const axios = require('axios'); // For MP API

// SECRET KEYS
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET es obligatorio en producción. Define la variable de entorno.');
    } else {
        console.warn('⚠️  JWT_SECRET no definido. Usando valor de DESARROLLO inseguro. NO usar en producción.');
    }
}
const EFFECTIVE_JWT_SECRET = JWT_SECRET || 'dev-only-do-not-use-in-prod';
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

// Lista de correos con acceso al panel de administración.
// Se puede sobrescribir con la env var ADMIN_EMAILS (separados por coma)
// para no tener que tocar código. Si no hay env, se usan estos por defecto.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'askmilomx@gmail.com,jaugustojc07@gmail.com')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

// Compat con código viejo que usaba ADMIN_EMAIL singular
const ADMIN_EMAIL = ADMIN_EMAILS[0];

function isAdminEmail(email) {
    return !!email && ADMIN_EMAILS.includes(String(email).toLowerCase());
}

// MERCADO PAGO CLIENT
const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });

// NODEMAILER TRANSPORTER (Ethereal for testing, or use real one if env provided)
let transporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: 'gmail', // or host/port
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
} else {
    // Fallback to console logging if no creds
    console.log("No Email Credentials found. Emails will be logged to console.");
    // We can also use Ethereal, but let's stick to simple logging for speed unless requested
}

// --------------------------------------------------------------------------
// SECURITY MIDDLEWARES
// --------------------------------------------------------------------------

// JWT auth middleware — sets req.user
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'No autorizado' });
    try {
        const decoded = jwt.verify(token, EFFECTIVE_JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

// Admin-only middleware — requires auth + email en la lista de admins
function requireAdmin(req, res, next) {
    requireAuth(req, res, () => {
        if (!req.user || !isAdminEmail(req.user.email)) {
            return res.status(403).json({ error: 'Acceso restringido al administrador' });
        }
        next();
    });
}

// Very simple in-memory rate limiter for sensitive endpoints (login/register)
const rateBuckets = new Map();
function rateLimit({ windowMs = 60_000, max = 10 } = {}) {
    return (req, res, next) => {
        const key = `${req.ip}:${req.path}`;
        const now = Date.now();
        const bucket = rateBuckets.get(key) || { count: 0, resetAt: now + windowMs };
        if (now > bucket.resetAt) {
            bucket.count = 0;
            bucket.resetAt = now + windowMs;
        }
        bucket.count += 1;
        rateBuckets.set(key, bucket);
        if (bucket.count > max) {
            return res.status(429).json({ error: 'Demasiados intentos. Espera un momento.' });
        }
        next();
    };
}

// --------------------------------------------------------------------------
// PRODUCT ROUTES
// --------------------------------------------------------------------------

// Get All Products (public)
app.get('/products', (req, res) => {
    db.all(`SELECT * FROM products`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// Add Product (admin only)
app.post('/products', requireAdmin, (req, res) => {
    const { title, price, desc, category, badge, imageMain, imageHover, rating, reviews, variants } = req.body;

    // Basic validation
    if (!title || !price) return res.status(400).json({ error: 'Title and Price are required' });

    const sql = `INSERT INTO products (title, price, desc, category, badge, imageMain, imageHover, rating, reviews, variants) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [title, price, desc, category, badge, imageMain, imageHover, rating || 5.0, reviews || 0, variants], function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.status(201).json({ id: this.lastID, message: 'Product created' });
    });
});

// Update Product (admin only)
app.put('/products/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { title, price, desc, category, badge, imageMain, imageHover, rating, reviews, variants } = req.body;

    const sql = `UPDATE products SET 
                 title = COALESCE(?, title), 
                 price = COALESCE(?, price), 
                 desc = COALESCE(?, desc), 
                 category = COALESCE(?, category), 
                 badge = ?, 
                 imageMain = COALESCE(?, imageMain), 
                 imageHover = COALESCE(?, imageHover), 
                 rating = COALESCE(?, rating), 
                 reviews = COALESCE(?, reviews),
                 variants = COALESCE(?, variants)
                 WHERE id = ?`;

    db.run(sql, [title, price, desc, category, badge, imageMain, imageHover, rating, reviews, variants, id], function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (this.changes === 0) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product updated' });
    });
});

// Delete Product (admin only)
app.delete('/products/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM products WHERE id = ?`, [id], function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'Product deleted' });
    });
});

// --------------------------------------------------------------------------
// AUTH ROUTES
// --------------------------------------------------------------------------

app.post('/register', rateLimit({ windowMs: 60_000, max: 5 }), (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Todos los campos son obligatorios' });

    // Basic validations
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) return res.status(400).json({ error: 'Correo electrónico no válido' });
    if (typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }
    if (name.length > 100 || email.length > 254) {
        return res.status(400).json({ error: 'Datos demasiado largos' });
    }

    bcrypt.hash(password, 12, (err, hash) => {
        if (err) return res.status(500).json({ error: 'Encryption error' });

        const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
        db.run(sql, [name, email.toLowerCase(), hash], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'El correo electrónico ya existe' });
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'User created', userId: this.lastID });
        });
    });
});

app.post('/login', rateLimit({ windowMs: 60_000, max: 8 }), (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Credenciales inválidas' });

    db.get(`SELECT * FROM users WHERE email = ?`, [String(email).toLowerCase()], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        // Same generic message whether user exists or password is wrong (avoid email enumeration)
        if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

        bcrypt.compare(password, user.password, (err, result) => {
            if (!result) return res.status(401).json({ error: 'Credenciales inválidas' });

            const userIsAdmin = isAdminEmail(user.email);
            const token = jwt.sign(
                { id: user.id, email: user.email, name: user.name, is_admin: userIsAdmin },
                EFFECTIVE_JWT_SECRET,
                { expiresIn: '2h' }
            );
            res.json({
                token,
                user: { id: user.id, name: user.name, email: user.email, is_admin: userIsAdmin }
            });
        });
    });
});

// Devuelve el estado real del usuario actual (verifica admin contra la lista del server).
// El front lo usa para no confiar ciegamente en localStorage.
app.get('/me', requireAuth, (req, res) => {
    const userIsAdmin = isAdminEmail(req.user.email);
    res.json({
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        is_admin: userIsAdmin
    });
});

// --------------------------------------------------------------------------
// PAYMENT & RECEIPT ROUTES
// --------------------------------------------------------------------------

// Cache temporal: external_reference -> shipping_address
// Vive entre la creación de la preferencia y el procesamiento del pago.
// Se limpia a 24h para no acumular memoria.
const pendingShippingByRef = new Map();
function rememberShipping(ref, shipping) {
    if (!ref || !shipping) return;
    pendingShippingByRef.set(ref, { shipping, ts: Date.now() });
    // Limpieza ligera oportunista
    if (pendingShippingByRef.size > 500) {
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        for (const [k, v] of pendingShippingByRef) {
            if (v.ts < cutoff) pendingShippingByRef.delete(k);
        }
    }
}
function consumeShipping(ref) {
    if (!ref) return null;
    const v = pendingShippingByRef.get(ref);
    if (!v) return null;
    pendingShippingByRef.delete(ref);
    return v.shipping;
}

// Sanitiza el objeto de dirección que llega del front antes de guardarlo
function sanitizeShipping(addr) {
    if (!addr || typeof addr !== 'object') return null;
    const clean = (s, max = 120) => (typeof s === 'string' ? s.trim().slice(0, max) : '');
    const out = {
        name: clean(addr.name, 100),
        phone: clean(addr.phone, 30),
        street: clean(addr.street, 200),
        colony: clean(addr.colony, 120),
        city: clean(addr.city, 80),
        state: clean(addr.state, 80),
        zip: clean(addr.zip, 12),
        notes: clean(addr.notes, 250),
    };
    // Requerimos al menos calle + ciudad + cp para considerarla válida
    if (!out.street || !out.city || !out.zip) return null;
    return out;
}

// Create Preference
app.post('/create_preference', async (req, res) => {
    try {
        // Recompute prices server-side: never trust client-sent unit_price
        const inputItems = Array.isArray(req.body.items) ? req.body.items : [];
        const ids = inputItems.map(i => Number(i.id)).filter(n => Number.isInteger(n));
        if (ids.length === 0) return res.status(400).json({ error: 'Carrito vacío o inválido' });

        const placeholders = ids.map(() => '?').join(',');
        const dbRows = await new Promise((resolve, reject) => {
            db.all(`SELECT id, title, price, price_cents, stock FROM products WHERE id IN (${placeholders})`, ids,
                (err, rows) => err ? reject(err) : resolve(rows));
        });
        const dbById = new Map(dbRows.map(r => [r.id, r]));

        // Validate stock and build MP items
        const items = [];
        for (const it of inputItems) {
            const p = dbById.get(Number(it.id));
            if (!p) return res.status(400).json({ error: `Producto no encontrado: ${it.id}` });
            const qty = Math.max(1, Math.min(99, parseInt(it.quantity, 10) || 1));
            if ((p.stock || 0) < qty) {
                return res.status(409).json({ error: `Sin stock suficiente: ${p.title}`, product_id: p.id });
            }
            const unitCents = p.price_cents && p.price_cents > 0 ? p.price_cents : Math.round(parsePrice(p.price) * 100);
            items.push({
                title: p.title,
                quantity: qty,
                unit_price: unitCents / 100,
                currency_id: 'MXN'
            });
        }

        // Costo de envío (tarifa fija según región elegida por el cliente).
        // Sólo aceptamos valores razonables — el rango cubre las tarifas de la mini encuesta.
        const rawShipping = Number(req.body.shipping_cost);
        const shippingCost = Number.isFinite(rawShipping) && rawShipping > 0 && rawShipping <= 1000
            ? Math.round(rawShipping * 100) / 100
            : 0;
        if (shippingCost > 0) {
            items.push({
                title: 'Envío',
                quantity: 1,
                unit_price: shippingCost,
                currency_id: 'MXN'
            });
        }

        // Optional auth — carry user id in external_reference so webhook knows who paid
        let externalRef = `guest:${Date.now()}`;
        const authHeader = req.headers.authorization || '';
        if (authHeader.startsWith('Bearer ')) {
            try {
                const decoded = jwt.verify(authHeader.slice(7), EFFECTIVE_JWT_SECRET);
                externalRef = `user:${decoded.id}:${Date.now()}`;
            } catch (_) { /* invalid token, treat as guest */ }
        }

        const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${port}`;
        const body = {
            items,
            external_reference: externalRef,
            notification_url: `${baseUrl}/webhooks/mercadopago`,
            back_urls: {
                success: `${baseUrl}/success.html`,
                failure: `${baseUrl}/failure.html`,
                pending: `${baseUrl}/pending.html`,
            },
        };

        // Guardamos la dirección de envío que el cliente llenó en la mini-encuesta
        // para asociarla al pedido cuando el pago se confirme.
        const shipping = sanitizeShipping(req.body.shipping_address);
        if (shipping) rememberShipping(externalRef, shipping);

        const preference = new Preference(client);
        const result = await preference.create({ body });
        res.json({ id: result.id, external_reference: externalRef });

    } catch (error) {
        console.error("Error creating preference:", error.message || error);
        res.status(500).json({ error: "Error creating preference" });
    }
});

// --------------------------------------------------------------------------
// HELPERS
// --------------------------------------------------------------------------

// Parse price stored as "$1,140.00" or "$420" into a number
function parsePrice(raw) {
    if (raw == null) return 0;
    if (typeof raw === 'number') return raw;
    const n = parseFloat(String(raw).replace(/[^0-9.]/g, ''));
    return isNaN(n) ? 0 : n;
}

// --------------------------------------------------------------------------
// ORDER PROCESSING — shared logic used by webhook + client confirmation
// --------------------------------------------------------------------------

// Process a paid MP payment_id idempotently:
//  - Fetches the payment from MP (source of truth)
//  - Skips if already recorded
//  - Decrements stock, creates order, generates PDF, sends email
//  - Returns { ok, order_id, status, already_processed }
async function processPaidPayment(paymentId) {
    if (!paymentId) return { ok: false, error: 'payment_id requerido' };

    // Idempotency: if already processed, just return existing order
    const existing = await new Promise(r => db.get(
        `SELECT id, status FROM orders WHERE transaction_id = ?`,
        [String(paymentId)],
        (e, row) => r(row || null)
    ));
    if (existing) return { ok: true, order_id: existing.id, status: existing.status, already_processed: true };

    // Fetch payment from MP — never trust the client
    let mp;
    if (!MP_ACCESS_TOKEN) {
        console.warn('MP_ACCESS_TOKEN no configurado — modo dev sin verificación.');
        if (process.env.NODE_ENV === 'production') return { ok: false, error: 'Pago no verificable' };
        mp = { status: 'approved', transaction_amount: null, external_reference: null, payer: {} };
    } else {
        try {
            const mpRes = await axios.get(
                `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,
                { headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` } }
            );
            mp = mpRes.data;
        } catch (err) {
            console.error('MP fetch err:', err.response ? err.response.data : err.message);
            return { ok: false, error: 'No se pudo verificar el pago' };
        }
    }

    if (mp.status !== 'approved') {
        return { ok: false, error: `Pago no aprobado (status: ${mp.status})`, mp_status: mp.status };
    }

    // Resolve user from external_reference ("user:ID:ts" or "guest:ts")
    let userId = null;
    if (typeof mp.external_reference === 'string' && mp.external_reference.startsWith('user:')) {
        const parts = mp.external_reference.split(':');
        const id = parseInt(parts[1], 10);
        if (Number.isInteger(id)) userId = id;
    }

    const user = userId
        ? await new Promise(r => db.get(`SELECT * FROM users WHERE id = ?`, [userId], (e, u) => r(u || null)))
        : null;
    const customer = user || {
        id: null,
        name: (mp.payer && (mp.payer.first_name || mp.payer.name)) || 'Cliente Invitado',
        email: (mp.payer && mp.payer.email) || 'guest@example.com'
    };

    // Reconstruct items from MP additional_info (set by SDK from preference items)
    const mpItems = (mp.additional_info && mp.additional_info.items) || [];
    if (mpItems.length === 0) return { ok: false, error: 'Pago sin items reconocibles' };

    // Match titles back to DB products to get IDs (for stock decrement)
    const titles = mpItems.map(i => i.title);
    const placeholders = titles.map(() => '?').join(',');
    const dbProducts = await new Promise(r => db.all(
        `SELECT id, title, price, price_cents, stock FROM products WHERE title IN (${placeholders})`,
        titles, (e, rows) => r(rows || [])
    ));
    const byTitle = new Map(dbProducts.map(p => [p.title, p]));

    const sanitizedItems = [];
    let serverTotalCents = 0;
    for (const it of mpItems) {
        const p = byTitle.get(it.title);
        const qty = parseInt(it.quantity, 10) || 1;
        const unitCents = p && p.price_cents > 0
            ? p.price_cents
            : Math.round(parseFloat(it.unit_price || 0) * 100);
        serverTotalCents += unitCents * qty;
        sanitizedItems.push({
            id: p ? p.id : null,
            title: it.title,
            unit_price: unitCents / 100,
            quantity: qty
        });
    }

    // Cross-check total (allow 1 peso tolerance)
    if (mp.transaction_amount != null) {
        const mpCents = Math.round(Number(mp.transaction_amount) * 100);
        if (Math.abs(mpCents - serverTotalCents) > 100) {
            console.warn(`Monto MP ${mpCents}¢ vs servidor ${serverTotalCents}¢`);
            return { ok: false, error: 'El monto del pago no coincide con el carrito' };
        }
    }

    // Recuperar la dirección de envío que se guardó al crear la preferencia
    const shippingAddress = consumeShipping(mp.external_reference);
    const shippingJson = shippingAddress ? JSON.stringify(shippingAddress) : null;

    // Save order + decrement stock atomically
    const orderId = await new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            db.run(
                `INSERT INTO orders (user_id, items, total, status, transaction_id, email, shipping_address) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [customer.id, JSON.stringify(sanitizedItems), serverTotalCents / 100, 'paid', String(paymentId), customer.email, shippingJson],
                function (err) {
                    if (err) { db.run('ROLLBACK'); return reject(err); }
                    const newId = this.lastID;
                    // Decrement stock for each item (only if we matched a real product)
                    sanitizedItems.forEach(it => {
                        if (it.id) {
                            db.run(`UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?`, [it.quantity, it.id]);
                        }
                    });
                    db.run('COMMIT', (e) => e ? reject(e) : resolve(newId));
                }
            );
        });
    }).catch(err => { console.error('Order save err:', err); return null; });

    if (!orderId) return { ok: false, error: 'No se pudo guardar el pedido' };

    // Generate receipt + send email (async, don't block response)
    try {
        generateReceiptPDF(orderId, customer, sanitizedItems, serverTotalCents / 100, (pdfPath) => {
            sendReceiptEmail(customer.email, pdfPath, orderId);
        });
    } catch (e) { console.error('Receipt err:', e); }

    return { ok: true, order_id: orderId, status: 'paid', already_processed: false };
}

// --------------------------------------------------------------------------
// MERCADO PAGO WEBHOOK — primary source of truth
// --------------------------------------------------------------------------
app.post('/webhooks/mercadopago', async (req, res) => {
    // Always 200 fast — MP retries if non-2xx, but we don't want to leak processing details
    res.status(200).send('ok');

    const body = req.body || {};
    const topic = body.type || body.topic || req.query.type || req.query.topic;
    const paymentId = (body.data && body.data.id) || body.id || req.query['data.id'] || req.query.id;

    if (!paymentId || (topic && topic !== 'payment')) return;

    try {
        const result = await processPaidPayment(String(paymentId));
        if (result.ok) {
            console.log(`[webhook] Pedido ${result.order_id} ${result.already_processed ? 'ya procesado' : 'creado'} para pago ${paymentId}`);
        } else {
            console.warn(`[webhook] No procesado pago ${paymentId}: ${result.error}`);
        }
    } catch (err) {
        console.error('[webhook] err:', err);
    }
});

// Client-side confirmation endpoint — also idempotent
// Called from success.html so we can show "ya está" sin esperar al webhook.
app.post('/finalize_order', async (req, res) => {
    const paymentId = req.body && req.body.payment_id;
    if (!paymentId) return res.status(400).json({ error: 'payment_id requerido' });

    const result = await processPaidPayment(String(paymentId));
    if (!result.ok) return res.status(400).json(result);
    res.json(result);
});

// Get an order's status by payment_id (used by success.html polling)
app.get('/orders/by-payment/:payment_id', (req, res) => {
    db.get(`SELECT id, total, status, email, created_at FROM orders WHERE transaction_id = ?`,
        [req.params.payment_id], (err, row) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (!row) return res.status(404).json({ error: 'Aún no procesado' });
            res.json(row);
        });
});

// My orders (authenticated)
app.get('/my-orders', requireAuth, (req, res) => {
    db.all(`SELECT id, items, total, status, transaction_id, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
        [req.user.id], (err, rows) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            const orders = (rows || []).map(o => ({
                ...o,
                items: (() => { try { return JSON.parse(o.items); } catch { return []; } })()
            }));
            res.json(orders);
        });
});

// --------------------------------------------------------------------------
// ADMIN: Listado de pedidos para el panel
// --------------------------------------------------------------------------
// Devuelve todos los pedidos con sus items, dirección de envío y la imagen
// del producto principal (la del primer item) para mostrar en el panel.
app.get('/admin/orders', requireAdmin, (req, res) => {
    db.all(
        `SELECT o.id, o.user_id, o.items, o.total, o.status, o.transaction_id,
                o.email, o.shipping_address, o.created_at,
                u.name AS user_name
         FROM orders o
         LEFT JOIN users u ON u.id = o.user_id
         ORDER BY o.created_at DESC
         LIMIT 200`,
        [],
        async (err, rows) => {
            if (err) return res.status(500).json({ error: 'Database error' });

            // Para cada pedido, parseamos items y buscamos la imagen del primer producto
            const parsed = (rows || []).map(o => {
                let items = [];
                try { items = JSON.parse(o.items) || []; } catch { items = []; }
                let shipping = null;
                try { shipping = o.shipping_address ? JSON.parse(o.shipping_address) : null; } catch { shipping = null; }
                return { ...o, items, shipping_address: shipping };
            });

            // Recolectar todos los IDs de productos referenciados para una sola query
            const allIds = [...new Set(
                parsed.flatMap(o => o.items.map(it => it.id).filter(Boolean))
            )];

            let imagesById = new Map();
            if (allIds.length > 0) {
                const ph = allIds.map(() => '?').join(',');
                await new Promise(r => db.all(
                    `SELECT id, imageMain FROM products WHERE id IN (${ph})`,
                    allIds,
                    (e, prodRows) => {
                        if (!e && prodRows) {
                            imagesById = new Map(prodRows.map(p => [p.id, p.imageMain]));
                        }
                        r();
                    }
                ));
            }

            // Adjuntar la imagen del primer item de cada pedido
            const enriched = parsed.map(o => {
                const firstItem = o.items[0];
                const image = firstItem && firstItem.id ? imagesById.get(firstItem.id) : null;
                return { ...o, primary_image: image || null };
            });

            res.json(enriched);
        }
    );
});


// HELPER: Generate PDF
function generateReceiptPDF(orderId, user, items, total, callback) {
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `receipt_${orderId}.pdf`;
    // Store receipts OUTSIDE the static root so they can't be downloaded by
    // guessing sequential IDs (/receipts is also blocked by the guard above).
    const receiptsDir = path.join(__dirname, 'receipts');
    if (!fs.existsSync(receiptsDir)) fs.mkdirSync(receiptsDir, { recursive: true });
    const filePath = path.join(receiptsDir, fileName);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // HEADER
    // Logo (if exists)
    const logoPath = path.join(__dirname, 'images', 'logo_transparent.png');
    if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { width: 50 });
    }

    doc
        .fillColor('#353535')
        .fontSize(20)
        .text('MILO CONCEPT', 110, 57)
        .fontSize(10)
        .text('Belleza Refinada', 110, 80)
        .text('www.milocosmetics.com', 200, 65, { align: 'right' })
        .moveDown();

    // INVOICE DATA
    doc.text(`Recibo Número: #${orderId}`, 50, 150)
        .text(`Fecha: ${new Date().toLocaleDateString()}`, 50, 165)
        .text(`Cliente: ${user.name}`, 50, 180)
        .text(`Correo: ${user.email}`, 50, 195)
        .moveDown();

    // DRAW TABLE
    let i;
    const invoiceTableTop = 250;

    doc.font("Helvetica-Bold");
    generateTableRow(doc, invoiceTableTop, "Artículo", "Precio Unitario", "Cantidad", "Total por Línea");
    generateHr(doc, invoiceTableTop + 20);
    doc.font("Helvetica");

    let rowPos = invoiceTableTop + 30;
    items.forEach(item => {
        const lineTotal = item.unit_price * item.quantity;
        generateTableRow(doc, rowPos, item.title, `$${item.unit_price}`, item.quantity, `$${lineTotal}`);
        rowPos += 30;
    });

    generateHr(doc, rowPos);

    const subtotalPosition = rowPos + 30;
    doc.font("Helvetica-Bold");
    generateTableRow(doc, subtotalPosition, "", "", "Total", `$${total}`);

    // FOOTER
    doc
        .fontSize(10)
        .text('Gracias por tu compra. Mantente Refinada.', 50, 700, { align: 'center', width: 500 });

    doc.end();

    stream.on('finish', () => {
        callback(filePath);
    });
}

function generateTableRow(doc, y, item, unitCost, quantity, lineTotal) {
    doc.fontSize(10)
        .text(item, 50, y)
        .text(unitCost, 280, y, { width: 90, align: "right" })
        .text(quantity, 370, y, { width: 90, align: "right" })
        .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc, y) {
    doc.strokeColor("#aaaaaa")
        .lineWidth(1)
        .moveTo(50, y)
        .lineTo(550, y)
        .stroke();
}

// HELPER: Send Email
function sendReceiptEmail(toEmail, pdfPath, orderId) {
    if (!toEmail) return;

    const mailOptions = {
        from: '"Milo Concept" <noreply@milocosmetics.com>',
        to: toEmail,
        subject: `Tu Recibo para el Pedido #${orderId} - Milo Concept`,
        text: `Hola,\n\nGracias por comprar en Milo Concept. Adjunto encontrarás tu recibo.\n\nMantente Refinada,\nEquipo de Milo Concept`,
        attachments: [
            {
                filename: `Receipt_${orderId}.pdf`,
                path: pdfPath
            }
        ]
    };

    if (transporter) {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) return console.log(error);
            console.log('Email sent: ' + info.response);
        });
    } else {
        console.log("------------------------------------------");
        console.log(`[MOCKED EMAIL] Sending to: ${toEmail}`);
        console.log(`[ATT] Attachment: ${pdfPath}`);
        console.log("------------------------------------------");
    }
}


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
