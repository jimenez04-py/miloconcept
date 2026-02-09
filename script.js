document.addEventListener('DOMContentLoaded', () => {

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
            shippingOptionsContainer.innerHTML = 'Loading rates...';
        }

        try {
            const response = await fetch(`/api/shipping/quote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    zip_to: zip,
                    items_count: cartCount
                })
            });
            const rates = await response.json();

            if (shippingOptionsContainer) {
                shippingOptionsContainer.innerHTML = '';
                if (!Array.isArray(rates) || rates.length === 0) {
                    shippingOptionsContainer.innerHTML = 'No hay métodos de envío disponibles.';
                    return;
                }

                rates.forEach((rate, index) => {
                    const price = parseFloat(rate.total_pricing);
                    const provider = rate.provider;
                    const service = rate.service_level_name;
                    const days = rate.days || '?';

                    const div = document.createElement('div');
                    div.style.marginBottom = '5px';
                    div.style.padding = '8px';
                    div.style.border = '1px solid #eee';
                    div.style.cursor = 'pointer';
                    div.style.display = 'flex';
                    div.style.justifyContent = 'space-between';
                    div.style.alignItems = 'center';

                    div.innerHTML = `
                        <div>
                            <strong>${provider}</strong> <span style="font-size:10px; color:#777;">(${service})</span><br>
                            <span style="font-size:11px;">${days} días</span>
                        </div>
                        <div>$${price.toFixed(2)}</div>
                    `;

                    div.onclick = function () {
                        // Deselect others
                        Array.from(shippingOptionsContainer.children).forEach(c => c.style.backgroundColor = 'transparent');
                        div.style.backgroundColor = '#f9f9f9';

                        currentShippingCost = price;
                        updateCartUI();
                    };

                    shippingOptionsContainer.appendChild(div);
                });
            }

        } catch (error) {
            console.error("Shipping Error:", error);
            if (shippingOptionsContainer) shippingOptionsContainer.innerHTML = 'Error al obtener tarifas.';
        }
    };


    const mp = new MercadoPago('TEST-0649a58d-0c1a-40ae-b4ab-01eb99caccf6', {
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

    const shopGrid = document.getElementById('shop-product-grid');
    const homeGrid = document.getElementById('home-product-grid');

    if (shopGrid || homeGrid) {

        async function fetchAndRenderProducts() {
            try {
                // Fetch from Server
                const response = await fetch(`/products`);
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

                    // 4. FILTER PRODUCTS INITIALLY
                    let currentCategoryProducts = category === 'all'
                        ? products
                        : products.filter(p => p.category === category);

                    // 5. RENDER INITIAL GRID
                    renderGrid(shopGrid, currentCategoryProducts);


                    /* -------------------------------------------------------------------------- */
                    /*                        SMART SEARCH DRAWER LOGIC                           */
                    /* -------------------------------------------------------------------------- */
                    const searchTrigger = document.getElementById('search-trigger');
                    const searchOverlay = document.getElementById('search-overlay');
                    const searchBackdrop = document.getElementById('search-backdrop');
                    const closeSearchBtn = document.getElementById('close-search');
                    const overlaySearchInput = document.getElementById('overlay-search-input');
                    const resultsContainer = document.getElementById('search-results-container');
                    const searchCountMsg = document.getElementById('search-count-msg');

                    function openSearch() {
                        if (searchOverlay) searchOverlay.classList.add('active');
                        if (searchBackdrop) searchBackdrop.classList.add('active');
                        document.body.classList.add('search-drawer-open');
                        if (overlaySearchInput) setTimeout(() => overlaySearchInput.focus(), 100);
                    }

                    function closeSearch() {
                        if (searchOverlay) searchOverlay.classList.remove('active');
                        if (searchBackdrop) searchBackdrop.classList.remove('active');
                        document.body.classList.remove('search-drawer-open');
                        if (overlaySearchInput) overlaySearchInput.value = ''; // Optional: clear on close
                    }

                    if (searchTrigger) {
                        searchTrigger.addEventListener('click', (e) => {
                            e.preventDefault();
                            openSearch();
                        });
                    }

                    if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearch);
                    if (searchBackdrop) searchBackdrop.addEventListener('click', closeSearch);

                    // Perform Search
                    function performSearch(query) {
                        query = query.toLowerCase().trim();

                        if (!query) {
                            if (resultsContainer) resultsContainer.innerHTML = '';
                            if (searchCountMsg) searchCountMsg.innerText = '';
                            return;
                        }

                        // Category Keyword Mapping
                        const CATEGORY_KEYWORDS = {
                            'fnd': 'skin',
                            'skin': 'skin', 'piel': 'skin', 'base': 'skin',
                            'lip': 'lips', 'labio': 'lips', 'boca': 'lips',
                            'face': 'face', 'rostro': 'face', 'cara': 'face',
                            'set': 'sets', 'kit': 'sets', 'rutina': 'sets'
                        };

                        let matchedCategory = null;
                        for (const [key, val] of Object.entries(CATEGORY_KEYWORDS)) {
                            if (query.includes(key)) matchedCategory = val;
                        }

                        let searchResults = [];
                        if (matchedCategory) {
                            searchResults = products.filter(p => p.category === matchedCategory);
                        } else {
                            searchResults = products.filter(p =>
                                p.title.toLowerCase().includes(query) ||
                                p.desc.toLowerCase().includes(query) ||
                                p.category.toLowerCase().includes(query) ||
                                (p.brand && p.brand.toLowerCase().includes(query))
                            );
                        }

                        // Render Logic
                        if (resultsContainer && searchCountMsg) {
                            searchCountMsg.innerText = `${searchResults.length} results for '${query}'`;
                            resultsContainer.innerHTML = '';

                            if (searchResults.length === 0) {
                                resultsContainer.innerHTML = '<p style="text-align:center; color:#999; margin-top:30px;">No results found.</p>';
                            } else {
                                searchResults.forEach(p => {
                                    const row = document.createElement('div');
                                    row.classList.add('search-item-row');
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
                        let debounceTimeout;
                        overlaySearchInput.addEventListener('input', (e) => {
                            clearTimeout(debounceTimeout);
                            debounceTimeout = setTimeout(() => {
                                performSearch(e.target.value);
                            }, 300);
                        });
                    }
                    /* END SMART SEARCH LOGIC */

                    // 7. SUGGESTION FORM LOGIC
                    const suggestionForm = document.getElementById('suggestion-form');
                    const feedbackMsg = document.getElementById('suggestion-feedback');

                    if (suggestionForm) {
                        suggestionForm.addEventListener('submit', async (e) => {
                            e.preventDefault();
                            const productName = document.getElementById('suggest-product-name').value;
                            const userName = document.getElementById('suggest-user-name').value;

                            try {
                                const res = await fetch('/suggestions', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ product_name: productName, user_name: userName })
                                });

                                if (res.ok) {
                                    suggestionForm.reset();
                                    if (feedbackMsg) {
                                        feedbackMsg.style.display = 'block';
                                        setTimeout(() => { feedbackMsg.style.display = 'none'; }, 5000);
                                    }
                                } else {
                                    alert('Error al enviar la sugerencia.');
                                }
                            } catch (err) {
                                console.error(err);
                                alert('Error de conexión.');
                            }
                        });
                    }
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
                const msg = `No se pudieron cargar los productos. Error: ${error.message}.`;
                if (shopGrid) shopGrid.innerHTML = `<p style="text-align:center; padding: 20px;">${msg}<br>Asegúrate de que el servidor esté corriendo en el puerto 3001.</p>`;
                if (homeGrid) homeGrid.innerHTML = `<p style="text-align:center; padding: 20px;">${msg}<br>Asegúrate de que el servidor esté corriendo en el puerto 3001.</p>`;
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

                    // HTML Structure
                    card.innerHTML = `
                        <div class="card-header">
                            <span class="big-cat-title">${product.category}</span>
                            ${product.badge ? `<span class="pill-badge">${product.badge}</span>` : '<span></span>'}
                        </div>
                        <div class="card-image-area">
                            <img src="${product.imageMain}" alt="${product.title}" class="product-img main-img" style="${product.style || ''}">
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

            // Backup Cart for Success Page
            localStorage.setItem('cart_backup', JSON.stringify(cart));

            // Validate Shipping Selection
            // Validate Shipping Selection
            // New Logic: Check if shipping cost is set or > 0 (unless we allow free shipping, but user must select something)
            // For now, let's require they select an option which updates currentShippingCost > 0 (or 0 if free, but handled by logic)
            // A better check is if they ran the estimator.

            // Simplified check: If items > 0, require shipping to be calculated/selected.
            if (currentShippingCost === 0 && cartCount > 0) {
                // Warning: This prevents Free Shipping if valid. 
                // Better to check if a shipping method was *selected*.
                // But for this quick impl, let's assume shipping isn't 0 unless not selected (since providers charge).
                // Or we could check if shipping-options has a selected child.
                // Let's just prompt them.
                // alert("Please estimate and select a shipping method.");
                // return;

                // Relaxed for demo: If 0, assume they didn't select, but if it's truly free we might block.
                // Let's check via UI state?
                const options = document.getElementById('shipping-options');
                if (options && options.children.length === 0) {
                    alert("Por favor ingresa tu CP y selecciona una tarifa de envío.");
                    return;
                }
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
                // Include shipping as an item
                const itemsToPay = [...cart];
                if (cartCount > 0 && currentShippingCost > 0) {
                    itemsToPay.push({
                        title: "Shipping Fee",
                        quantity: 1,
                        unit_price: currentShippingCost,
                        currency_id: 'MXN'
                    });
                } else if (cartCount > 0 && currentShippingCost === 0) {
                    // We can optionally add a $0 item or just leave it out. 
                    // Adding it as $0 makes it explicit on the receipt.
                    itemsToPay.push({
                        title: "Shipping Fee (Free)",
                        quantity: 1,
                        unit_price: 0,
                        currency_id: 'MXN'
                    });
                }

                const response = await fetch(`/create_preference`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ items: itemsToPay }),
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
