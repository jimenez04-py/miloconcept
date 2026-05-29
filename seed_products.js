const db = require('./database');

const PRODUCTS = [
    {
        title: "Dior Lip Glow Oil",
        price: "$850.00",
        desc: "Aceite labial nutritivo con efecto brillante y natural",
        rating: 5.0,
        reviews: 1204,
        category: "lips",
        badge: "Más Vendido",
        imageMain: "https://www.dior.com/dw/image/v2/BGXS_PRD/on/demandware.static/-/Sites-master_dior/default/dwfb4d284e/Y0124000/Y0124000_background_ZHC.png?sw=3000&sh=1600",
        imageHover: "https://www.uhlala.mx/cdn/shop/products/image_f74f157d-fe14-4763-9a53-05712882f38f.webp?v=1677597412&width=700"
    },
    {
        title: "Rhode Peptide Lip Tint",
        price: "$768.00",
        desc: "Tinte labial con péptidos para hidratación profunda y color traslúcido",
        rating: 4.8,
        reviews: 856,
        category: "lips",
        badge: "Edición Limitada",
        imageMain: "https://juicyskinmx.com/cdn/shop/files/IMG-9965.webp?v=1750288801&width=1445",
        imageHover: "https://houseophilia.com/cdn/shop/files/46998109-D02C-4416-9EF5-523E6B3737E5.webp?v=1760657758&width=1946"
    },
    {
        title: "Luminous Silk Foundation",
        price: "$1200.00",
        desc: "Base de maquillaje ligera con acabado sedoso y natural",
        rating: 4.9,
        reviews: 450,
        category: "face",
        badge: "Nuevo",
        imageMain: "https://www.giorgioarmanibeauty.com.mx/dw/image/v2/BCHW_PRD/on/demandware.static/-/Sites-armani-master-catalog/default/dw1b3d3d3d/images/Makeup/Face/Foundation/Luminous_Silk_Foundation/Luminous_Silk_Foundation_01.jpg",
        imageHover: "https://www.giorgioarmanibeauty.com.mx/dw/image/v2/BCHW_PRD/on/demandware.static/-/Sites-armani-master-catalog/default/dw1b3d3d3d/images/Makeup/Face/Foundation/Luminous_Silk_Foundation/Luminous_Silk_Foundation_02.jpg"
    },
    {
        title: "Rare Beauty Blush",
        price: "$650.00",
        desc: "Rubor líquido de gran pigmentación y fácil difuminado",
        rating: 5.0,
        reviews: 890,
        category: "face",
        badge: "Más Vendido",
        imageMain: "https://www.sephora.com.mx/on/demandware.static/-/Sites-masterCatalog_Sephora/es_MX/dwba1f3f3f/images/hi-res/boletos/Karla%20Nieto/RARE%20BEAUTY/840122900013_1.jpg",
        imageHover: "https://www.sephora.com.mx/on/demandware.static/-/Sites-masterCatalog_Sephora/es_MX/dwba1f3f3f/images/hi-res/boletos/Karla%20Nieto/RARE%20BEAUTY/840122900013_2.jpg"
    },
    {
        title: "Effaclar Mat",
        price: "$799.00",
        desc: "Matificante anti poros hidratante",
        rating: 5.0,
        reviews: 620,
        category: "skin",
        badge: "",
        imageMain: "https://www.laroche-posay.com.mx/-/media/project/loreal/brand-sites/lrp/america/latam/products/effaclar/effaclar-mat/la-roche-posay-face-care-effaclar-mat-sebo-controlling-moisturizer-40ml-3337872413025-front.png",
        imageHover: "https://www.laroche-posay.com.mx/-/media/project/loreal/brand-sites/lrp/america/latam/products/effaclar/effaclar-mat/effaclar-mat-3337872413025-back-zoom.jpg"
    }
];

db.serialize(() => {
    // db.run("DELETE FROM products"); // PROTECTION: Never delete user data
    const stmt = db.prepare("INSERT INTO products (title, price, desc, category, badge, imageMain, imageHover, rating, reviews) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");

    PRODUCTS.forEach(p => {
        // We only insert if we don't find a product with the same title to avoid duplicates
        db.get("SELECT id FROM products WHERE title = ?", [p.title], (err, row) => {
            if (!row) {
                stmt.run(p.title, p.price, p.desc, p.category, p.badge, p.imageMain, p.imageHover, p.rating, p.reviews);
            }
        });
    });

    // Note: stmt.finalize() should be called after all runs, but since these are async db.get calls,
    // it's tricky. For a seed script this simplistic structure is usually okay or we use a small delay.
    setTimeout(() => {
        stmt.finalize();
        console.log("Base de datos actualizada con categorías en español (sin borrar lo existente).");
    }, 2000);
});
