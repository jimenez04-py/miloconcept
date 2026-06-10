// Escapa HTML antes de inyectarlo con innerHTML. Evita XSS desde datos de
// producto (que un admin edita) y desde el carrito.
function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

// Placeholder de marca para imágenes que no cargan (muchas URLs externas
// de catálogo están caídas o bloquean hotlinking).
const PLACEHOLDER_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">' +
    '<rect width="100%" height="100%" fill="#F0EBE3"/>' +
    '<text x="50%" y="48%" font-family="Inter,Arial,sans-serif" font-size="26" font-weight="700" fill="#C9A86A" text-anchor="middle" letter-spacing="3">MILO</text>' +
    '<text x="50%" y="58%" font-family="Inter,Arial,sans-serif" font-size="11" fill="#b9b1a4" text-anchor="middle" letter-spacing="2">CONCEPT</text>' +
    '</svg>'
);

// Sustituye una imagen rota por el placeholder (una sola vez).
function attachImgFallback(scope) {
    if (!scope) return;
    scope.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function onErr() {
            img.removeEventListener('error', onErr);
            img.src = PLACEHOLDER_IMG;
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {

    const parallaxImages = document.querySelectorAll('.parallax-img');
    const heroSection = document.querySelector('.hero');
    const siteHeader = document.getElementById('site-header') || document.querySelector('.header');

    // Header transparent on top of hero, solid white after scroll
    const startedOnHero = siteHeader && siteHeader.classList.contains('header--on-hero');
    const handleHeaderScroll = () => {
        if (!siteHeader) return;
        const threshold = heroSection
            ? heroSection.offsetTop + heroSection.offsetHeight - 100
            : 80;
        if (window.scrollY > threshold) {
            siteHeader.classList.remove('header--on-hero');
            siteHeader.classList.add('header--scrolled');
        } else if (startedOnHero) {
            siteHeader.classList.add('header--on-hero');
            siteHeader.classList.remove('header--scrolled');
        }
    };
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();

    // Rewrite "Cuenta" links: account.html if logged in, login.html if not
    (function () {
        const isLogged = !!localStorage.getItem('token');
        document.querySelectorAll('a[href="login.html"]').forEach(a => {
            const txt = (a.textContent || '').trim().toLowerCase();
            if (txt === 'cuenta' || txt === 'mi cuenta' || txt === 'account') {
                a.setAttribute('href', isLogged ? 'account.html' : 'login.html');
            }
        });
    })();

    window.addEventListener('scroll', () => {
        let scrollY = window.scrollY;

        if (scrollY < window.innerHeight) {
            parallaxImages.forEach(img => {
                if (img.parentElement.classList.contains('hero-image-container')) {

                }
            });
        }
    });


    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-scroll').forEach(el => {
        observer.observe(el);
    });


    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCart = document.getElementById('close-cart');


    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const navLinks = document.querySelectorAll('.nav-link');

    // Actualiza el link "Cuenta" según haya sesión o no.
    // Antes buscaba 'Account'/'ACCOUNT' que no existe — el HTML dice 'Cuenta'.
    navLinks.forEach(link => {
        const txt = (link.innerText || '').trim().toLowerCase();
        if (txt === 'cuenta' || txt === 'account') {
            if (user) {
                link.innerText = `Hola, ${user.name.split(' ')[0]}`;
                link.href = "account.html";
            } else {
                link.href = "login.html";
            }
        }
    });

    // ---------------------------------------------------------------- //
    //   BOTÓN DE ADMIN EN EL HEADER (solo si el usuario es admin)
    // ---------------------------------------------------------------- //
    // Se inyecta dinámicamente para no tener que tocar todos los HTML.
    // El backend siempre valida — esto es solo UX.
    if (user && user.is_admin) {
        const desktopNav = document.querySelectorAll('.desktop-nav');
        // El header tiene 2 .desktop-nav (izquierda y derecha). Metemos el botón en la derecha,
        // que es donde está "Cuenta" / "Hola, ...".
        const rightNav = desktopNav[desktopNav.length - 1];
        if (rightNav && !document.getElementById('admin-link')) {
            const adminLink = document.createElement('a');
            adminLink.href = 'admin.html';
            adminLink.id = 'admin-link';
            adminLink.className = 'nav-link admin-link';
            adminLink.title = 'Panel de administración';
            adminLink.innerHTML = '<span class="admin-dot"></span>Admin';
            // Lo insertamos antes del carrito para que quede al lado de "Hola, ..."
            const cart = rightNav.querySelector('.cart-icon');
            if (cart) rightNav.insertBefore(adminLink, cart);
            else rightNav.appendChild(adminLink);
        }
    }

    // ---------------------------------------------------------------- //
    //   TOAST DE BIENVENIDA PARA ADMIN (solo una vez tras login)
    // ---------------------------------------------------------------- //
    // login.html guarda un flag en sessionStorage; aquí lo consumimos.
    if (user && user.is_admin && sessionStorage.getItem('admin_welcome') === '1') {
        sessionStorage.removeItem('admin_welcome');
        showAdminWelcomeToast(user.name);
    }

    function showAdminWelcomeToast(name) {
        const firstName = (name || '').split(' ')[0] || 'admin';
        const toast = document.createElement('div');
        toast.className = 'admin-welcome-toast';
        toast.innerHTML = `
            <div class="awt__inner">
                <div class="awt__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2l2.39 4.84L20 7.6l-3.85 3.75.91 5.31L12 14.77 6.94 16.66l.91-5.31L4 7.6l5.61-.76L12 2z"/>
                    </svg>
                </div>
                <div class="awt__body">
                    <p class="awt__title">Hola de nuevo, ${escapeHtml(firstName)}</p>
                    <p class="awt__sub">Tu panel te espera</p>
                </div>
                <a class="awt__cta" href="admin.html">Entrar</a>
                <button class="awt__close" aria-label="Cerrar">&times;</button>
            </div>
        `;
        document.body.appendChild(toast);
        // animación in
        requestAnimationFrame(() => toast.classList.add('is-visible'));

        const close = () => {
            toast.classList.remove('is-visible');
            setTimeout(() => toast.remove(), 300);
        };
        toast.querySelector('.awt__close').addEventListener('click', close);
        // Auto-cierre a los 8 segundos
        setTimeout(close, 8000);
    }


    const cartTriggerDeskop = document.getElementById('cart-trigger');
    const cartTriggerMobile = document.getElementById('cart-trigger-mobile');
    const menuIcon = document.querySelector('.menu-icon');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMenu = document.getElementById('close-menu');

    function toggleCart() {
        cartDrawer.classList.toggle('active');
        cartOverlay.classList.toggle('active');
    }

    function toggleMenu() {
        mobileMenu.classList.toggle('active');
    }

    if (cartTriggerDeskop) cartTriggerDeskop.addEventListener('click', toggleCart);
    if (cartTriggerMobile) cartTriggerMobile.addEventListener('click', toggleCart);
    if (closeCart) closeCart.addEventListener('click', toggleCart);
    if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

    if (menuIcon) menuIcon.addEventListener('click', toggleMenu);
    if (closeMenu) closeMenu.addEventListener('click', toggleMenu);


    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    });


    const modal = document.getElementById('product-modal');
    const modalOverlay = document.getElementById('product-modal-overlay');
    const closeModalBtn = document.getElementById('close-modal');


    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalPrice = document.getElementById('modal-price');
    const modalImg = document.getElementById('modal-img');
    const modalColorArea = document.getElementById('modal-color-area');
    const selectedColorName = document.getElementById('selected-color-name');
    const swatchesContainer = document.querySelector('.color-swatches');


    const SHADES = {
        'dior_lips': [
            { name: "001 Pink", hex: "#F8B8D0", image: "https://www.dior.com/on/demandware.static/-/Sites-master_dior/default/dw3fc2be4b/Y0124000/Y0124000_C012400001_E01_selectorPanelDesktop.jpg" },
            { name: "004 Coral", hex: "#FF8800", image: "https://www.dior.com/on/demandware.static/-/Sites-master_dior/default/dw9b3a2fae/Y0124000/Y0124000_C012400004_E01_selectorPanelDesktop.jpg" },
            { name: "007 Raspberry", hex: "#FF2D55", image: "https://www.dior.com/on/demandware.static/-/Sites-master_dior/default/dwe55387bc/Y0124000/Y0124000_C012400007_E01_selectorPanelDesktop.jpg" },
            { name: "006 Berry", hex: "#A50055", image: "https://www.dior.com/on/demandware.static/-/Sites-master_dior/default/dwed545790/Y0124000/Y0124000_C012400006_E01_selectorPanelDesktop.jpg" },
            { name: "012 Rosewood", hex: "#602500", image: "https://www.dior.com/on/demandware.static/-/Sites-master_dior/default/dwd0651b2d/Y0124000/Y0124000_C012400012_E01_selectorPanelDesktop.jpg" },

        ],
        'rhode_lips': [


            { name: "Rasperry Jelly", hex: "#ca3a6aff", image: "https://beaustick.com/cdn/shop/files/IMG-2151_1024x.webp?v=1709071296" },
            { name: "Salty tan", hex: "#fe7979d9", image: "https://glamourmakeupcosmetics.com/cdn/shop/files/IMG_0250.webp?v=1718478005" },
            { name: "PB&J", hex: "#532f21ff", image: "https://juicyskinmx.com/cdn/shop/files/IMG-2787_45581f93-d655-4e73-ace7-a421505b15c5.webp?v=1750288801" }
        ],
        'skin': [
            { image: "https://sfycdn.speedsize.com/d2d3381f-f48a-4389-b41e-1d53123fab1b/https://refybeauty.com/cdn/shop/files/FACE_PRIMER_GLOW_AND_SCULPT_-_FLAT_-_OPEN_-_RESHOOT.jpg?v=1756990524&width=1024" },

        ],
        'Kiko_milano': [
            { name: "Pearly pink", hex: "#ffaaedff", image: "https://www.kikocosmetics.com/_next/image?url=https%3A%2F%2Fimages.kikocosmetics.com%2Fcatalog%2FKM0020201800544%2F13-20250828.webp&q=80&w=1920&av=v1" },
            { name: "Pearly Apricot", hex: "#ff9c4bff", image: "https://www.kikocosmetics.com/_next/image?url=https%3A%2F%2Fimages.kikocosmetics.com%2Fcatalog%2FKM0020201800344%2F13-20250828.webp&q=80&w=1920&av=v1" },
            { name: "Magenta", hex: "#dd00aaff", image: "https://www.kikocosmetics.com/_next/image?url=https%3A%2F%2Fimages.kikocosmetics.com%2Fcatalog%2FKM0020201802344%2F13-20250828.webp&q=80&w=1920&av=v1" },
            { name: "Golden sparkle", hex: "#e48958e4", image: "https://www.kikocosmetics.com/_next/image?url=https%3A%2F%2Fimages.kikocosmetics.com%2Fcatalog%2FKM0020201801844%2F13-20250828.webp&q=80&w=1920&av=v1" },
        ],
        'rare_beauty': [
            { name: "Exhilarate-champagne Gold", hex: "#fcba6fff", image: "https://cdn.shopify.com/s/files/1/0314/1143/7703/products/positive-light-silky-touch-highlighter-exhilarate-1440x1952.jpg?v=1669148726" }
        ],
        'nyx_brows': [
            { name: "Chocolate", hex: "#4B3621", image: "https://m.media-amazon.com/images/I/81Zphf3uufL.jpg" }
        ],
        'default': []
    };

    // Producto actualmente abierto en el modal (para conocer su id/precio al agregar).
    let currentModalProduct = null;

    function openProductModal(productData) {

        currentModalProduct = productData;
        const title = productData.title;
        const price = productData.price;
        const desc = productData.desc;
        const imgSrc = productData.imageMain;


        let category = 'default';

        if (title.includes('dior')) {
            category = 'dior_lips';
        } else if (title.includes('peptide') || title.includes('tint') || title.includes('rhode')) {
            category = 'rhode_lips';
        } else if (title.includes('skin') || title.includes('foundation') || title.includes('primer')) {
            category = 'skin';
        } else if (title.includes('hydra') || title.includes('kiko') || title.includes('3d')) {
            category = 'Kiko_milano';
        } else if (title.includes('rare beauty') || title.includes('highlighter')) {
            category = 'rare_beauty';
        } else if (title.includes('micro brow') || title.includes('nyx')) {
            category = 'nyx_brows';
        }


        modalTitle.innerText = title;
        modalDesc.innerText = desc;
        modalPrice.innerText = price;
        // Fallback persistente por si la imagen del producto/tono no carga.
        modalImg.onerror = () => { if (modalImg.src !== PLACEHOLDER_IMG) modalImg.src = PLACEHOLDER_IMG; };
        modalImg.src = imgSrc;


        swatchesContainer.innerHTML = '';

        // Prioritize Variants from Database
        let shades = [];
        if (productData.variants) {
            try {
                shades = JSON.parse(productData.variants);
            } catch (e) {
                console.error("Error parsing variants", e);
            }
        }

        // Fallback to hardcoded SHADES if no variants in DB
        if (shades.length === 0) {
            shades = SHADES[category] || SHADES['default'];
        }

        if (shades.length > 0) {
            modalColorArea.style.display = 'block';
            selectedColorName.innerText = shades[0].name;

            shades.forEach((shade, index) => {

                const wrapper = document.createElement('div');
                wrapper.classList.add('swatch-wrapper');

                const btn = document.createElement('button');
                btn.classList.add('swatch');
                if (index === 0) btn.classList.add('active');

                if (shade.swatchImg) {
                    btn.style.backgroundImage = `url(${shade.swatchImg})`;
                    btn.style.backgroundColor = 'transparent';
                    btn.style.backgroundSize = 'cover';
                } else {
                    btn.style.backgroundColor = shade.hex || '#ccc';
                }


                if (shade.icon) {
                    const iconImg = document.createElement('img');
                    iconImg.src = shade.icon;
                    iconImg.classList.add('swatch-icon');
                    btn.appendChild(iconImg);
                }

                btn.dataset.name = shade.name;

                btn.addEventListener('click', () => {

                    document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
                    btn.classList.add('active');

                    selectedColorName.innerText = shade.name;


                    if (shade.image) {
                        modalImg.src = shade.image;
                    }
                });

                wrapper.appendChild(btn);


                if (shade.tag) {
                    const badge = document.createElement('span');
                    badge.classList.add('swatch-badge');
                    badge.innerText = shade.tag;
                    wrapper.appendChild(badge);
                }

                swatchesContainer.appendChild(wrapper);
            });
        } else {
            modalColorArea.style.display = 'none';
        }


        modal.classList.add('active');
        modalOverlay.classList.add('active');
    }

    function closeProductModal() {
        modal.classList.remove('active');
        modalOverlay.classList.remove('active');
    }


    const addBtns = document.querySelectorAll('.add-to-cart-btn');
    addBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            // This fallback is only for hardcoded products if they exist in HTML
            const productCard = btn.closest('.product-card');
            const productData = {
                title: productCard.querySelector('h3').innerText,
                price: productCard.querySelector('.price').innerText,
                desc: productCard.querySelector('.desc').innerText,
                imageMain: productCard.querySelector('.main-img').src
            };
            openProductModal(productData);
        });
    });


    if (closeModalBtn) closeModalBtn.addEventListener('click', closeProductModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeProductModal);


    const modalAddBtn = document.querySelector('.modal-add-btn');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartCountEls = document.querySelectorAll('.cart-icon, #cart-trigger, #cart-trigger-mobile');

    let currentShippingCost = 0; // Se actualiza según la región elegida

    // ---------------------------------------------------------------- //
    // ESTADO DEL CARRITO — persistente en localStorage, una sola fuente
    // de verdad (el array `cart`). Funciona en todas las páginas.
    // Cada item: { id, title, unit_price, image, color, quantity }
    // ---------------------------------------------------------------- //
    const loadCart = () => {
        try {
            const raw = JSON.parse(localStorage.getItem('cart') || '[]');
            return Array.isArray(raw) ? raw.filter(i => i && i.title) : [];
        } catch { return []; }
    };
    let cart = loadCart();
    const saveCart = () => { try { localStorage.setItem('cart', JSON.stringify(cart)); } catch (_) {} };

    const cartCount = () => cart.reduce((n, i) => n + (Number(i.quantity) || 0), 0);
    const cartSubtotal = () => cart.reduce((s, i) => s + (Number(i.unit_price) || 0) * (Number(i.quantity) || 0), 0);

    // "$1,200.00" → 1200  (tolera comas y símbolos)
    const parsePrice = (raw) => {
        const n = parseFloat(String(raw == null ? '' : raw).replace(/[^0-9.]/g, ''));
        return isNaN(n) ? 0 : n;
    };

    function addToCart(item) {
        const key = `${item.id}::${item.color || ''}`;
        const existing = cart.find(i => `${i.id}::${i.color || ''}` === key);
        if (existing) existing.quantity = Math.min(99, existing.quantity + (item.quantity || 1));
        else cart.push({ ...item, quantity: item.quantity || 1 });
        saveCart();
        renderCart();
    }
    function removeFromCartAt(index) {
        if (index >= 0 && index < cart.length) { cart.splice(index, 1); saveCart(); renderCart(); }
    }
    function setQtyAt(index, qty) {
        if (index < 0 || index >= cart.length) return;
        cart[index].quantity = Math.max(1, Math.min(99, parseInt(qty, 10) || 1));
        saveCart();
        renderCart();
    }

    // ---------------------------------------------------------------- //
    // SHIPPING CALCULATOR (mini encuesta por región)
    // ---------------------------------------------------------------- //
    const SHIPPING_RATES = {
        'Tabasco': 0,       // Villahermosa: envío gratis
        'Monterrey': 150,   // Centro
        'Puebla': 200,      // Lugares seleccionados
        'General': 230      // A todo México
    };

    window.calculateShipping = function () {
        const select = document.getElementById('shipping-state');
        const value = select ? select.value : '';
        currentShippingCost = Object.prototype.hasOwnProperty.call(SHIPPING_RATES, value) ? SHIPPING_RATES[value] : 0;
        renderCart();
    };

    // ---------------------------------------------------------------- //
    // RENDER — reconstruye el carrito desde el estado
    // ---------------------------------------------------------------- //
    function renderCart() {
        const count = cartCount();
        const subtotal = cartSubtotal();

        if (cartItemsContainer) {
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<p class="empty-msg">Tu carrito está vacío.</p>';
            } else {
                cartItemsContainer.innerHTML = cart.map((item, i) => `
                    <div class="cart-item">
                        <div class="cart-item-img">
                            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}">
                        </div>
                        <div class="cart-item-info">
                            <h4>${escapeHtml(item.title)}</h4>
                            ${item.color ? `<span class="cart-item-variant">${escapeHtml(item.color)}</span>` : ''}
                            <span class="cart-item-price">$${(Number(item.unit_price) || 0).toFixed(2)}</span>
                            <div class="qty-control" data-index="${i}">
                                <button type="button" class="qty-btn qty-minus" aria-label="Restar uno">−</button>
                                <span class="qty-value">${item.quantity}</span>
                                <button type="button" class="qty-btn qty-plus" aria-label="Sumar uno">+</button>
                            </div>
                        </div>
                        <button class="remove-item" data-index="${i}" aria-label="Quitar del carrito">&times;</button>
                    </div>
                `).join('');

                cartItemsContainer.querySelectorAll('.remove-item').forEach(btn =>
                    btn.addEventListener('click', () => removeFromCartAt(Number(btn.dataset.index))));
                cartItemsContainer.querySelectorAll('.qty-minus').forEach(btn => {
                    const idx = Number(btn.closest('.qty-control').dataset.index);
                    btn.addEventListener('click', () => setQtyAt(idx, cart[idx].quantity - 1));
                });
                cartItemsContainer.querySelectorAll('.qty-plus').forEach(btn => {
                    const idx = Number(btn.closest('.qty-control').dataset.index);
                    btn.addEventListener('click', () => setQtyAt(idx, cart[idx].quantity + 1));
                });
                attachImgFallback(cartItemsContainer);
            }
        }

        const subtotalEl = document.getElementById('cart-subtotal');
        if (subtotalEl) subtotalEl.innerText = '$' + subtotal.toFixed(2);

        const shippingEl = document.getElementById('cart-shipping');
        if (shippingEl) shippingEl.innerText = currentShippingCost === 0 ? 'Gratis' : '$' + currentShippingCost.toFixed(2);

        cartCountEls.forEach(el => {
            if ((el.id || '').includes('mobile')) el.innerText = `CARRITO (${count})`;
            else el.innerText = `Carrito (${count})`;
        });

        const finalTotal = count > 0 ? subtotal + currentShippingCost : 0;
        const btnTotalSpan = document.getElementById('btn-total');
        if (btnTotalSpan) btnTotalSpan.innerText = '$' + finalTotal.toFixed(2);

        const shippingRow = document.querySelector('.shipping-row');
        if (shippingRow) shippingRow.style.display = count > 0 ? 'flex' : 'none';

        // El formulario de envío solo tiene sentido con productos en el carrito.
        const addressForm = document.querySelector('.address-form');
        if (addressForm) addressForm.style.display = cart.length > 0 ? '' : 'none';
    }

    // Mercado Pago: la public key puede inyectarse en producción vía window.MP_PUBLIC_KEY.
    // El SDK sólo está cargado en páginas con checkout (index/shop), por eso lo guardamos.
    const MP_PUBLIC_KEY = window.MP_PUBLIC_KEY || 'TEST-0649a58d-0c1a-40ae-b4ab-01eb99caccf6';
    const mp = (typeof MercadoPago !== 'undefined' && MP_PUBLIC_KEY)
        ? new MercadoPago(MP_PUBLIC_KEY, { locale: 'es-MX' })
        : null;

    if (modalAddBtn) {
        modalAddBtn.addEventListener('click', () => {
            const p = currentModalProduct;
            const title = modalTitle.innerText;
            const price = (p && p.price != null) ? parsePrice(p.price) : parsePrice(modalPrice.innerText);
            const image = modalImg.src;
            const hasColor = modalColorArea && modalColorArea.style.display !== 'none';
            const color = hasColor ? selectedColorName.innerText : '';
            const id = (p && p.id != null) ? p.id : null;

            const originalText = modalAddBtn.innerHTML;
            modalAddBtn.innerText = 'Agregado ✓';
            modalAddBtn.classList.add('is-added');

            addToCart({ id, title, unit_price: price, image, color });

            setTimeout(() => {
                closeProductModal();
                if (cartDrawer) cartDrawer.classList.add('active');
                if (cartOverlay) cartOverlay.classList.add('active');
                modalAddBtn.innerHTML = originalText;
                modalAddBtn.classList.remove('is-added');
            }, 450);
        });
    }

    // Pinta el carrito al cargar: refleja lo persistido en cualquier página.
    renderCart();



    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                targetEl.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    /* -------------------------------------------------------------------------- */
    /*                                SHOP PAGE LOGIC                             */
    /* -------------------------------------------------------------------------- */

    const shopGrid = document.getElementById('shop-product-grid');
    const homeGrid = document.getElementById('home-product-grid');

    if (shopGrid || homeGrid) {

        async function fetchAndRenderProducts() {
            try {
                // Fetch from Server (misma-origen: rutas relativas)
                const response = await fetch('/products');
                const products = await response.json();

                if (!Array.isArray(products)) {
                    console.error("Invalid products data");
                    return;
                }

                /* -------------------------------------------------------------------------- */
                /*                               SHOP PAGE LOGIC                              */
                /* -------------------------------------------------------------------------- */
                if (shopGrid) {
                    // 2. PARSE URL PARAMETERS
                    const urlParams = new URLSearchParams(window.location.search);
                    const category = urlParams.get('cat') || 'all';

                    // 3. UPDATE PAGE HEADER
                    const pageTitle = document.querySelector('.shop-page-title');
                    const pageSubtitle = document.querySelector('.shop-page-subtitle');
                    const breadcrumbCurrent = document.querySelector('.breadcrumbs .current-crumb');

                    const TITLES = {
                        'all': { title: 'ver todo', subtitle: 'explora nuestra colección completa' },
                        'skin': { title: 'piel', subtitle: 'cuatro esenciales diarios' },
                        'lips': { title: 'labios', subtitle: 'nutrición y tinte' },
                        'sets': { title: 'sets', subtitle: 'rutinas seleccionadas' },
                        'face': { title: 'rostro', subtitle: 'perfección para tu cara' }
                    };

                    const info = TITLES[category] || TITLES['all'];

                    if (pageTitle) pageTitle.innerText = info.title;
                    if (pageSubtitle) pageSubtitle.innerText = info.subtitle;
                    if (breadcrumbCurrent) breadcrumbCurrent.innerText = category === 'all' ? 'Ver Todo' : (TITLES[category] ? TITLES[category].title : category);

                    // 4. FILTER PRODUCTS by category first
                    const categoryFiltered = category === 'all'
                        ? products
                        : products.filter(p => p.category === category);

                    // 5. SEARCH + SORT (live) controller
                    const searchInput = document.getElementById('shop-search');
                    const sortSelect = document.getElementById('shop-sort');
                    const resultCount = document.getElementById('result-count');
                    const noResults = document.getElementById('no-results');

                    const priceNum = (p) => {
                        if (p.price_cents) return p.price_cents / 100;
                        const n = parseFloat(String(p.price || '').replace(/[^0-9.]/g, ''));
                        return isNaN(n) ? 0 : n;
                    };

                    const applyFilters = () => {
                        const q = (searchInput && searchInput.value || '').trim().toLowerCase();
                        const sort = sortSelect ? sortSelect.value : 'default';

                        let list = categoryFiltered;
                        if (q) {
                            list = list.filter(p =>
                                (p.title || '').toLowerCase().includes(q) ||
                                (p.desc || '').toLowerCase().includes(q) ||
                                (p.badge || '').toLowerCase().includes(q)
                            );
                        }
                        if (sort === 'price-asc') list = [...list].sort((a, b) => priceNum(a) - priceNum(b));
                        else if (sort === 'price-desc') list = [...list].sort((a, b) => priceNum(b) - priceNum(a));
                        else if (sort === 'title-asc') list = [...list].sort((a, b) => (a.title || '').localeCompare(b.title || ''));

                        if (resultCount) resultCount.textContent = `${list.length} producto${list.length === 1 ? '' : 's'}`;
                        if (noResults) noResults.style.display = list.length === 0 ? 'block' : 'none';
                        renderGrid(shopGrid, list);
                    };

                    if (searchInput) {
                        let t;
                        searchInput.addEventListener('input', () => {
                            clearTimeout(t);
                            t = setTimeout(applyFilters, 150);
                        });
                    }
                    if (sortSelect) sortSelect.addEventListener('change', applyFilters);

                    // ---- Custom dropdown wiring (sort) ----
                    const customSelect = document.getElementById('sort-select');
                    if (customSelect && sortSelect) {
                        const trigger = customSelect.querySelector('.custom-select__trigger');
                        const label = customSelect.querySelector('.custom-select__label');
                        const menu = customSelect.querySelector('.custom-select__menu');
                        const options = menu.querySelectorAll('li');

                        const openMenu = () => {
                            customSelect.classList.add('is-open');
                            trigger.setAttribute('aria-expanded', 'true');
                        };
                        const closeMenu = () => {
                            customSelect.classList.remove('is-open');
                            trigger.setAttribute('aria-expanded', 'false');
                        };

                        trigger.addEventListener('click', (e) => {
                            e.stopPropagation();
                            customSelect.classList.contains('is-open') ? closeMenu() : openMenu();
                        });

                        options.forEach(opt => {
                            opt.addEventListener('click', () => {
                                const value = opt.dataset.value;
                                const text = opt.textContent;

                                options.forEach(o => o.classList.remove('is-selected'));
                                opt.classList.add('is-selected');
                                label.textContent = text;

                                sortSelect.value = value;
                                sortSelect.dispatchEvent(new Event('change'));

                                closeMenu();
                            });
                        });

                        // Cerrar al hacer click fuera
                        document.addEventListener('click', (e) => {
                            if (!customSelect.contains(e.target)) closeMenu();
                        });

                        // Cerrar con Escape
                        document.addEventListener('keydown', (e) => {
                            if (e.key === 'Escape') closeMenu();
                        });
                    }

                    applyFilters();
                }

                /* -------------------------------------------------------------------------- */
                /*                               HOME PAGE LOGIC                              */
                /* -------------------------------------------------------------------------- */
                if (homeGrid) {
                    // For Home Page, strictly show ONLY "Best Sellers"
                    let homeProducts = products.filter(p => p.badge && p.badge.toLowerCase().includes('best seller'));

                    renderGrid(homeGrid, homeProducts);
                }

            } catch (error) {
                console.error("Error fetching products:", error);
                const msg = 'No se pudieron cargar los productos. Intenta recargar la página en un momento.';
                if (shopGrid) shopGrid.innerHTML = `<p style="text-align:center; padding: 40px 20px; color:#888;">${msg}</p>`;
                if (homeGrid) homeGrid.innerHTML = `<p style="text-align:center; padding: 40px 20px; color:#888;">${msg}</p>`;
            }
        }

        function renderGrid(container, items) {
            container.innerHTML = '';
            if (items.length === 0) {
                container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">No se encontraron productos.</p>';
            } else {
                items.forEach(product => {
                    const card = document.createElement('div');
                    card.classList.add('product-card');
                    card.classList.add('fade-in-scroll'); // Add animation class if on home

                    // HTML Structure (todos los campos escapados contra XSS)
                    card.innerHTML = `
                        <div class="card-header">
                            <span class="big-cat-title">${escapeHtml(product.category)}</span>
                            ${product.badge ? `<span class="pill-badge">${escapeHtml(product.badge)}</span>` : '<span></span>'}
                        </div>
                        <div class="card-image-area">
                            <img src="${escapeHtml(product.imageMain)}" alt="${escapeHtml(product.title)}" class="product-img main-img" loading="lazy">
                            <img src="${escapeHtml(product.imageHover)}" alt="${escapeHtml(product.title)} swatch" class="product-img hover-img" loading="lazy">
                        </div>
                        <div class="card-details">
                            <div class="rating">
                                <span class="stars" aria-hidden="true">★★★★★</span> <span class="count">(${Number(product.reviews) || 0})</span>
                            </div>
                            <div class="title-row">
                                <h3>${escapeHtml(product.title)}</h3>
                                <span class="price">${escapeHtml(product.price)}</span>
                            </div>
                            <p class="desc">${escapeHtml(product.desc)}</p>
                            <button class="add-to-cart-btn">Comprar</button>
                        </div>
                    `;

                    attachImgFallback(card);

                    const buyBtn = card.querySelector('.add-to-cart-btn');
                    buyBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openProductModal(product);
                    });

                    container.appendChild(card);

                    // Trigger animation if intersection observer is watching
                    if (typeof observer !== 'undefined') observer.observe(card);
                });
            }
        }

        fetchAndRenderProducts();
    }

    // Checkout Logic
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            if (cart.length === 0) {
                alert("¡Tu carrito está vacío!");
                return;
            }

            // Si el SDK de Mercado Pago no cargó, no podemos abrir el checkout.
            if (!mp) {
                alert("El sistema de pago no está disponible en este momento. Vuelve a la Tienda para finalizar tu compra.");
                return;
            }

            // Backup Cart for Success Page
            localStorage.setItem('cart_backup', JSON.stringify(cart));

            // Validar que escogieron una región (la "encuesta")
            const stateSelect = document.getElementById('shipping-state');
            const stateValue = stateSelect ? stateSelect.value : '';
            if (!stateValue) {
                alert("Por favor selecciona una región de envío.");
                return;
            }

            // Validate Address Fields
            const street = document.getElementById('addr-street')?.value.trim();
            const colony = document.getElementById('addr-colony')?.value.trim();
            const zip = document.getElementById('addr-zip')?.value.trim();
            const city = document.getElementById('addr-city')?.value.trim();
            const phone = document.getElementById('addr-phone')?.value.trim();

            if (!street || !colony || !zip || !city || !phone) {
                alert("Por favor completa todos los campos de dirección (Calle, Colonia, CP, Ciudad, Teléfono) para continuar.");
                return;
            }

            const originalText = checkoutBtn.innerHTML;
            checkoutBtn.innerHTML = "Procesando...";

            try {
                // El envío se manda al backend por separado (no como item del carrito)
                // así el backend puede validar productos por ID y agregar el envío como línea propia.
                const shippingAddress = {
                    street, colony, zip, city, phone,
                    state: stateValue,
                    // name vacío porque no lo pedimos en el form; backend lo deja como ''
                    name: ''
                };

                const response = await fetch('/create_preference', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        items: cart,
                        shipping_cost: currentShippingCost,
                        shipping_address: shippingAddress
                    }),
                });

                const data = await response.json();

                if (data.id) {
                    mp.checkout({
                        preference: {
                            id: data.id
                        },
                        autoOpen: true,
                    });
                } else {
                    alert("Error procesando el pago");
                }

            } catch (error) {
                console.error(error);
                alert("Error conectando con el servidor de pagos");
            } finally {
                checkoutBtn.innerHTML = originalText;
            }
        });
    }
});
