/**
 * Milo Concept - Version 2.1.0
 * Last Updated: 2026-02-09 19:55
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("Milo Script Loaded v8 - Production Ready");

    const parallaxImages = document.querySelectorAll('.parallax-img');
    const heroSection = document.querySelector('.hero');

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


    const user = JSON.parse(localStorage.getItem('user'));
    const authLink = document.querySelector('.nav-link[href="login.html"]'); // Need to find the auth link
    const navLinks = document.querySelectorAll('.nav-link');


    navLinks.forEach(link => {
        if (link.innerText === 'Account' || link.innerText === 'ACCOUNT') {
            if (user) {
                link.innerText = `Hola, ${user.name.split(' ')[0]}`;
                link.href = "#";
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (confirm("¿Cerrar sesión?")) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.reload();
                    }
                });
            } else {
                link.href = "login.html";
            }
        }
    });


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

    function openProductModal(productData) {

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
    const emptyMsg = document.querySelector('.empty-msg');
    const cartTotalEl = document.querySelector('.total span:last-child');
    const cartCountEls = document.querySelectorAll('.cart-icon, #cart-trigger, #cart-trigger-mobile');

    let cartTotal = 0;
    let cartCount = 0;


    let cart = [];
    let currentShippingCost = 0; // Default to 0 until selected, or user can select

    // ---------------------------------------------------------------- //
    // SHIPPING CALCULATOR LOGIC (SKYDROPX)
    // ---------------------------------------------------------------- //
    const shippingZipInput = document.getElementById('shipping-zip');
    const shippingOptionsContainer = document.getElementById('shipping-options');

    window.calculateShipping = async function () {
        const zip = shippingZipInput ? shippingZipInput.value.trim() : '';
        if (!zip) {
            alert("Por favor ingresa un Código Postal.");
            return;
        }

        if (shippingOptionsContainer) {
            shippingOptionsContainer.innerHTML = '<p style="color:#888;">Calculando tarifas...</p>';
        }

        // MOCK SHIPPING FOR STATIC DEPLOYMENT
        setTimeout(() => {
            if (shippingOptionsContainer) {
                shippingOptionsContainer.innerHTML = '';

                const mockRates = [
                    { provider: "FedEx", service: "Express", days: "1-2", price: 180.00 },
                    { provider: "Estafeta", service: "Standard", days: "3-5", price: 120.00 },
                    { provider: "Redpack", service: "Económico", days: "5-7", price: 95.00 }
                ];

                mockRates.forEach((rate, index) => {
                    const div = document.createElement('div');
                    div.style.marginBottom = '5px';
                    div.style.padding = '10px';
                    div.style.border = '1px solid #eee';
                    div.style.cursor = 'pointer';
                    div.style.display = 'flex';
                    div.style.justifyContent = 'space-between';
                    div.style.alignItems = 'center';
                    div.style.borderRadius = '4px';
                    div.style.transition = 'background 0.2s';

                    div.innerHTML = `
                        <div>
                            <strong>${rate.provider}</strong> <span style="font-size:10px; color:#777;">(${rate.service})</span><br>
                            <span style="font-size:11px;">${rate.days} días</span>
                        </div>
                        <div style="font-weight:600;">$${rate.price.toFixed(2)}</div>
                    `;

                    div.onclick = function () {
                        // Deselect others
                        Array.from(shippingOptionsContainer.children).forEach(c => {
                            c.style.backgroundColor = 'transparent';
                            c.style.borderColor = '#eee';
                        });
                        div.style.backgroundColor = '#f9f9f9';
                        div.style.borderColor = '#333';

                        currentShippingCost = rate.price;
                        updateCartUI();
                    };

                    shippingOptionsContainer.appendChild(div);
                });
            }
        }, 1000);
    };


    const mp = new MercadoPago('APP_USR-29b6c907-0bf8-482b-8d23-59ef542ea5c2', {
        locale: 'es-MX'
    });

    if (modalAddBtn) {
        modalAddBtn.addEventListener('click', () => {

            const title = modalTitle.innerText;
            const priceStr = modalPrice.innerText;
            const price = parseFloat(priceStr.replace('$', ''));
            const image = modalImg.src;
            const color = selectedColorName.innerText;


            const originalText = modalAddBtn.innerHTML;
            modalAddBtn.innerText = "Agregado";
            modalAddBtn.style.background = "#fff";
            modalAddBtn.style.color = "#000";


            setTimeout(() => {

                if (emptyMsg) emptyMsg.style.display = 'none';
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('cart-item');
                itemDiv.innerHTML = `
                    <div class="cart-item-img">
                        <img src="${image}" alt="${title}">
                    </div>
                    <div class="cart-item-info">
                        <h4>${title}</h4>
                        <span class="cart-item-variant">${color}</span>
                        <span class="cart-item-price">${priceStr}</span>
                    </div>
                    <button class="remove-item">&times;</button>
                `;


                itemDiv.style.display = "flex";
                itemDiv.style.gap = "15px";
                itemDiv.style.marginBottom = "20px";
                itemDiv.style.alignItems = "center";

                const imgEl = itemDiv.querySelector('img');

                itemDiv.querySelector('.remove-item').addEventListener('click', () => {

                    itemDiv.remove();

                    const removeIndex = cart.findIndex(i => i.title === title && i.unit_price === price);
                    if (removeIndex > -1) {
                        cart.splice(removeIndex, 1);
                    }

                    cartTotal -= price;
                    cartCount--;

                    updateCartUI();
                });

                cartItemsContainer.appendChild(itemDiv);


                cartTotal += price;
                cartCount++;


                cart.push({
                    title: title,
                    quantity: 1,
                    unit_price: price,
                    currency_id: 'MXN'
                });


                updateCartUI();


                closeProductModal();
                toggleCart();


                setTimeout(() => {
                    modalAddBtn.innerHTML = originalText;
                    modalAddBtn.style.background = "";
                    modalAddBtn.style.color = "";
                }, 500);

            }, 600);
        });

        function updateCartUI() {

            if (cartCount === 0) {
                if (emptyMsg) emptyMsg.style.display = 'block';
            } else {
                if (emptyMsg) emptyMsg.style.display = 'none';
            }


            if (cartTotalEl) cartTotalEl.innerText = '$' + cartTotal.toFixed(2);


            const subtotalEl = document.getElementById('cart-subtotal');
            if (subtotalEl) subtotalEl.innerText = '$' + cartTotal.toFixed(2);

            // Update Shipping Display
            const shippingEl = document.getElementById('cart-shipping');
            if (shippingEl) {
                if (currentShippingCost === 0) {
                    shippingEl.innerText = 'Gratis';
                } else {
                    shippingEl.innerText = '$' + currentShippingCost.toFixed(2);
                }
            }

            cartCountEls.forEach(el => {
                if (el.id.includes('mobile')) el.innerText = `CARRITO (${cartCount})`;
                else el.innerText = `Carrito (${cartCount})`;
            });

            // If user hasn't selected shipping yet, we can default to 0 or prompt. 
            // For now, let's just add whatever is current (0 if not selected)
            // Or only add shipping if they picked something? 
            // Let's assume 0 if unselected for pure UI, but maybe warn on checkout?

            const finalTotal = cartCount > 0 ? (cartTotal + currentShippingCost) : 0;
            const btnTotalSpan = document.getElementById('btn-total');
            if (btnTotalSpan) btnTotalSpan.innerText = '$' + finalTotal.toFixed(2);

            const shippingRow = document.querySelector('.shipping-row');
            if (shippingRow) {
                shippingRow.style.display = cartCount > 0 ? 'flex' : 'none';
            }
        }
    }



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

    let products = [];

    /* -------------------------------------------------------------------------- */
    /*                            SEARCH FUNCTIONALITY                            */
    /* -------------------------------------------------------------------------- */
    function initSearch() {
        const searchTrigger = document.getElementById('search-trigger');
        const searchOverlay = document.getElementById('search-overlay');
        const searchBackdrop = document.getElementById('search-backdrop'); // Added backdrop
        const closeSearchBtn = document.getElementById('close-search');
        const overlaySearchInput = document.getElementById('overlay-search-input');
        const resultsContainer = document.getElementById('search-results-container');
        const searchCountMsg = document.getElementById('search-count-msg');

        if (!searchTrigger || !searchOverlay) return;

        function openSearch() {
            searchOverlay.classList.add('active');
            if (searchBackdrop) searchBackdrop.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
            if (overlaySearchInput) {
                overlaySearchInput.value = ''; // Clean input
                performSearch(''); // Reset results
                setTimeout(() => overlaySearchInput.focus(), 100);
            }
        }

        function closeSearch() {
            searchOverlay.classList.remove('active');
            if (searchBackdrop) searchBackdrop.classList.remove('active');
            document.body.style.overflow = '';
        }

        searchTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            openSearch();
        });

        if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearch);
        if (searchBackdrop) searchBackdrop.addEventListener('click', closeSearch); // Click outside to close

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
                closeSearch();
            }
        });

        // Perform Search
        function performSearch(query) {
            const rawQuery = query.toLowerCase().trim();

            if (!rawQuery) {
                if (resultsContainer) resultsContainer.innerHTML = '';
                if (searchCountMsg) searchCountMsg.innerText = '';
                return;
            }

            // STRICT Category logic
            const categoryMap = {
                'labios': 'Labios',
                'piel': 'Rostro',
                'cara': 'Rostro',
                'rostro': 'Rostro',
                'sets': 'Sets'
            };

            let targetCategory = null;

            // Check if query is EXACTLY a category keyword
            if (categoryMap.hasOwnProperty(rawQuery)) {
                targetCategory = categoryMap[rawQuery];
            }

            let searchResults = [];

            if (targetCategory) {
                // strict category match
                searchResults = products.filter(p => p.category === targetCategory);
            } else {
                // Free text search (Name, Brand) - Case insensitive
                searchResults = products.filter(p => {
                    return p.title.toLowerCase().includes(rawQuery) ||
                        p.brand.toLowerCase().includes(rawQuery);
                });
            }

            // Render Logic
            if (resultsContainer && searchCountMsg) {
                // Clean container
                resultsContainer.innerHTML = '';

                if (searchResults.length === 0) {
                    searchCountMsg.innerText = '0 resultados';
                    const noResult = document.createElement('div');
                    noResult.style.padding = '20px 0';
                    noResult.style.color = '#999';
                    noResult.style.textAlign = 'center';
                    noResult.innerText = 'No se encontraron productos';
                    resultsContainer.appendChild(noResult);
                } else {
                    searchCountMsg.innerText = `${searchResults.length} resultados`;
                    searchResults.forEach(p => {
                        const row = document.createElement('div');
                        row.classList.add('search-item-row');
                        // Minimalist Row: Image Left, Title Right (uppercase)
                        row.innerHTML = `
                            <img src="${p.imageMain}" alt="${p.title}" class="search-thumb">
                            <div class="search-item-info">
                                <h4 class="search-item-title">${p.title}</h4>
                            </div>
                        `;

                        row.addEventListener('click', () => {
                            openProductModal(p);
                            closeSearch();
                        });
                        resultsContainer.appendChild(row);
                    });
                }
            }
        }

        if (overlaySearchInput) {
            overlaySearchInput.addEventListener('input', (e) => {
                performSearch(e.target.value);
            });
        }
    }

    // Initialize Search Immediately
    initSearch();

    /* -------------------------------------------------------------------------- */
    /*                                SHOP & HOME RENDERING                       */
    /* -------------------------------------------------------------------------- */
    const shopGrid = document.getElementById('shop-product-grid');
    const homeGrid = document.getElementById('home-product-grid');

    if (shopGrid || homeGrid) {

        function renderPage() {
            /* -------------------------------------------------------------------------- */
            /*                               SHOP PAGE LOGIC                              */
            /* -------------------------------------------------------------------------- */
            if (shopGrid) {
                const urlParams = new URLSearchParams(window.location.search);
                const categoryKey = urlParams.get('cat') || 'all';

                // Map URL param to actual Category Name in data
                const CAT_MAP = {
                    'all': 'All',
                    'skin': 'Piel', // Fixed: Maps correctly to Piel products
                    'lips': 'Labios',
                    'face': 'Rostro',
                    'sets': 'Sets'
                };

                const targetCat = CAT_MAP[categoryKey] || 'All';

                // Update Header
                const pageTitle = document.querySelector('.shop-page-title');
                const pageSubtitle = document.querySelector('.shop-page-subtitle');

                const TITLES = {
                    'All': { title: 'ver todo', subtitle: 'explora nuestra colección completa' },
                    'Rostro': { title: 'rostro', subtitle: 'perfección para tu cara' },
                    'Piel': { title: 'piel', subtitle: 'cuidado esencial' }, // Added Title for Piel
                    'Labios': { title: 'labios', subtitle: 'nutrición y tinte' },
                    'Sets': { title: 'sets', subtitle: 'rutinas seleccionadas' }
                };

                const info = TITLES[targetCat] || TITLES['All'];
                if (pageTitle) pageTitle.innerText = info.title;
                if (pageSubtitle) pageSubtitle.innerText = info.subtitle;

                // Filter
                let items = targetCat === 'All' ? products : products.filter(p => p.category === targetCat);
                // If filtering for "Rostro" (formerly skin logic), we might show Rostro items
                renderGrid(shopGrid, items);
            }

            /* -------------------------------------------------------------------------- */
            /*                               HOME PAGE LOGIC                              */
            /* -------------------------------------------------------------------------- */
            if (homeGrid) {
                // Modified: Only show products with "Best Seller" badge as requested by user
                let displayItems = products.filter(p => p.badge && p.badge.includes('Best Seller'));

                // NO fallback: If no best sellers, show nothing or "No products found" via renderGrid
                renderGrid(homeGrid, displayItems);
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
                    card.classList.add('fade-in-scroll');

                    card.innerHTML = `
                        <div class="card-header">
                            <span class="big-cat-title">${product.category}</span>
                            ${product.badge ? `<span class="pill-badge">${product.badge}</span>` : '<span></span>'}
                        </div>
                        <div class="card-image-area">
                            <img src="${product.imageMain}" alt="${product.title}" class="product-img main-img">
                            <img src="${product.imageHover}" alt="${product.title} swatch" class="product-img hover-img">
                        </div>
                        <div class="card-details">
                            <div class="rating">
                                ★★★★★ <span class="count">(${product.reviews})</span>
                            </div>
                            <div class="title-row">
                                <h3>${product.title}</h3>
                                <span class="price">${product.price}</span>
                            </div>
                            <p class="desc">${product.desc}</p>
                            <button class="add-to-cart-btn">Comprar</button>
                        </div>
                    `;

                    const buyBtn = card.querySelector('.add-to-cart-btn');
                    buyBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openProductModal(product);
                    });

                    container.appendChild(card);
                    if (typeof observer !== 'undefined') observer.observe(card);
                });
            }
        }

        // DYNAMIC PRODUCT SYNC
        // This ensures products added via Admin Panel show up automatically
        const syncProducts = async () => {
            try {
                const res = await fetch('/products');
                if (res.ok) {
                    const dbProducts = await res.json();
                    if (dbProducts && dbProducts.length > 0) {
                        const CAT_MAP = { 'lips': 'Labios', 'face': 'Rostro', 'skin': 'Piel', 'sets': 'Sets' };
                        products = dbProducts.map(p => ({
                            ...p,
                            category: CAT_MAP[p.category] || p.category,
                            brand: p.brand || (p.title.toLowerCase().includes('rhode') ? 'Rhode' : 'Milo Concept'),
                            variants: typeof p.variants === 'string' ? p.variants : JSON.stringify(p.variants || [])
                        }));
                        renderPage(); // Update UI with DB items
                    }
                }
            } catch (e) {
                console.log("Static mode: Using bundled products.");
            }
        };

        syncProducts();
        renderPage();
    }

    // Checkout Logic (MOCKED)
    // Checkout Logic (REAL)
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (cart.length === 0) {
                alert("Tu carrito está vacío.");
                return;
            }

            const btnText = checkoutBtn.querySelector('span:first-child');
            if (btnText) btnText.innerText = "Procesando...";

            try {
                const response = await fetch('/create_preference', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        items: cart.map(item => {
                            let price = 0;
                            if (item.unit_price !== undefined) {
                                price = Number(item.unit_price);
                            } else if (item.price !== undefined) {
                                const pStr = String(item.price);
                                price = parseFloat(pStr.replace(/[^0-9.]/g, ''));
                            }
                            return {
                                title: item.title,
                                quantity: Number(item.quantity || 1),
                                unit_price: price,
                                currency_id: 'MXN'
                            };
                        })
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.init_point) {
                        window.location.href = data.init_point;
                    } else {
                        alert("Error: No se recibió enlace de pago.");
                    }
                } else {
                    const errorText = await response.text();
                    console.error("Server Error:", response.status, errorText);
                    alert(`Error del servidor (${response.status}): ${errorText}`);
                }
            } catch (error) {
                console.error("Error checkout:", error);
                alert(`Error de conexión: ${error.message}\nVerifica que estés en http://localhost:3001 (no un archivo) y que el servidor esté activo.`);
            } finally {
                if (btnText) btnText.innerText = "Continuar";
            }
        });
    }

});

// Global Suggestion Form Logic (ensure it runs if elements exist)
const suggestionForm = document.getElementById('suggestion-form');
const feedbackMsg = document.getElementById('suggestion-feedback');

if (suggestionForm) {
    suggestionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // MOCK SUGGESTION SUBMIT
        suggestionForm.reset();
        if (feedbackMsg) {
            feedbackMsg.innerText = "¡Gracias! Tu sugerencia ha sido enviada (Simulación).";
            feedbackMsg.style.display = 'block';
            setTimeout(() => { feedbackMsg.style.display = 'none'; }, 4000);
        }
    });
}
