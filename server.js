const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MercadoPagoConfig, Preference } = require('mercadopago');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const db = require('./database');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/'))); // Serve static files

const axios = require('axios'); // For Skydropx API

// SECRET KEYS
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'; // In prod use .env
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const SKYDROPX_API_KEY = process.env.SKYDROPX_API_KEY;
const SKYDROPX_API_URL = process.env.SKYDROPX_API_URL || 'https://api.skydropx.com/v1';

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
// PRODUCT ROUTES
// --------------------------------------------------------------------------

// Get All Products
app.get('/products', (req, res) => {
    db.all(`SELECT * FROM products`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// Add Product
app.post('/products', (req, res) => {
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

// Update Product
app.put('/products/:id', (req, res) => {
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

// Delete Product
app.delete('/products/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM products WHERE id = ?`, [id], function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'Product deleted' });
    });
});

// --------------------------------------------------------------------------
// AUTH ROUTES
// --------------------------------------------------------------------------

app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Todos los campos son obligatorios' });

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ error: 'Encryption error' });

        const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
        db.run(sql, [name, email, hash], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'El correo electrónico ya existe' });
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'User created', userId: this.lastID });
        });
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

        bcrypt.compare(password, user.password, (err, result) => {
            if (!result) return res.status(401).json({ error: 'Contraseña inválida' });

            const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
        });
    });
});

// --------------------------------------------------------------------------
// PAYMENT & RECEIPT ROUTES
// --------------------------------------------------------------------------

// Create Preference
app.post('/create_preference', async (req, res) => {
    try {
        const body = {
            items: req.body.items.map(item => ({
                title: item.title,
                quantity: Number(item.quantity),
                unit_price: Number(item.unit_price),
                currency_id: 'MXN',
            })),
            back_urls: {
                success: `${process.env.DOMAIN || 'http://localhost:3001'}/success.html`,
                failure: `${process.env.DOMAIN || 'http://localhost:3001'}/failure.html`,
                pending: `${process.env.DOMAIN || 'http://localhost:3001'}/pending.html`,
            },
            // auto_return: "approved", // Workaround for localhost
            metadata: {
                // Pass user info if useful, scanning from request if authenticated
                // But for simplicity we rely on client calling /finalize_order after
            }
        };

        const preference = new Preference(client);
        const result = await preference.create({ body });
        res.json({ id: result.id });

    } catch (error) {
        console.error("Error creating preference:", error);
        res.status(500).json({ error: "Error creating preference" });
    }
});

// Skydropx Shipping Quote Proxy
app.post('/api/shipping/quote', async (req, res) => {
    const { zip_to, items_count } = req.body; // Simple logic: zip_to and item count

    if (!SKYDROPX_API_KEY) {
        // Mock response if no key
        console.log("No Skydropx Key, returning mock data");
        return res.json([
            { provider: 'FEDEX', service_level_name: 'Standard', total_pricing: '150.00', days: 3 },
            { provider: 'DHL', service_level_name: 'Express', total_pricing: '280.00', days: 1 }
        ]);
    }

    try {
        // fixed origin for demo
        const zip_from = '06700';
        const weight = items_count * 0.5; // 0.5kg per item avg

        const response = await axios.post(`${SKYDROPX_API_URL}/quotations`, {
            zip_from: zip_from,
            zip_to: zip_to,
            parcel: {
                weight: weight,
                height: 10,
                width: 10,
                length: 10
            }
        }, {
            headers: {
                'Authorization': `Token token=${SKYDROPX_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Filter and map relevant data from response
        // Skydropx structure varies, usually response.data is the shipment/quote object
        // We'll assume we get a list of rates or similar.
        // For this implementation, let's just return the raw data or a simplified version
        // if the API call succeeds.

        // Note: Skydropx API might return a slightly different structure. 
        // We usually hit /quotations then get rates.
        // For simplicity, we'll assume we pass back the rates array.
        // If response.data is the quotation object, it might have a 'rates' array.

        // This is a simplification. 
        res.json(response.data);

    } catch (error) {
        console.error("Skydropx Error:", error.response ? error.response.data : error.message);
        // Fallback to mock on error
        res.json([
            { provider: 'FEDEX', service_level_name: 'Standard (Fallback)', total_pricing: '150.00', days: 3 }
        ]);
    }
});

// Finalize Order (Call this from success.html or via Webhook)
// For this demo, we'll assume the Client calls this with the payment_id and user_id
app.post('/finalize_order', async (req, res) => {
    const { payment_id, user_id, cart_items, total } = req.body;

    // 1. Verify Payment (Skipped for pure simulation speed, ideally fetch(mp_api))

    // 2. Lookup User
    db.get(`SELECT * FROM users WHERE id = ?`, [user_id], async (err, user) => {
        if (err || !user) {
            // If guest, create dummy user obj
            user = { name: "Guest Customer", email: "guest@example.com" };
            // Ideally we force login, but if user_id is null/invalid use fallback
            if (req.body.email) user.email = req.body.email; // Allow checking out as guest email
        }

        // 3. Save Order
        const itemsStr = JSON.stringify(cart_items);
        db.run(`INSERT INTO orders (user_id, items, total, status, transaction_id) VALUES (?, ?, ?, ?, ?)`,
            [user ? user.id : null, itemsStr, total, 'paid', payment_id],
            function (err) {
                if (err) console.error("Order save err", err);
                const orderId = this.lastID || Date.now();

                // 4. Generate Receipt PDF
                generateReceiptPDF(orderId, user, cart_items, total, (pdfPath) => {
                    // 5. Send Email
                    sendReceiptEmail(user.email, pdfPath, orderId);
                    res.json({ success: true, message: "Order processed and receipt sent" });
                });
            }
        );
    });
});


// HELPER: Generate PDF
function generateReceiptPDF(orderId, user, items, total, callback) {
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `receipt_${orderId}.pdf`;
    const filePath = path.join(__dirname, 'images', fileName); // store in images temporarily
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


const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
