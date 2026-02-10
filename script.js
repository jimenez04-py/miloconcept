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


    /* -------------------------------------------------------------------------- */
    /*                             PRODUCT DATA (STATIC)                          */
    /* -------------------------------------------------------------------------- */
    const products = [
        {
            "id": 59,
            "title": "lip glow oil dior",
            "price": "$1000.00",
            "desc": "Luminous matte finish foundation",
            "rating": 5,
            "reviews": 1204,
            "category": "Labios",
            "badge": "Best Seller",
            "imageMain": "https://www.dior.com/dw/image/v2/BGXS_PRD/on/demandware.static/-/Sites-master_dior/default/dwfb4d284e/Y0124000/Y0124000_background_ZHC.png?sw=3000&sh=1600",
            "imageHover": "https://www.uhlala.mx/cdn/shop/products/image_f74f157d-fe14-4763-9a53-05712882f38f.webp?v=1677597412&width=700",
            "brand": "Dior",
            "variants": "[]"
        },
        {
            "id": 60,
            "title": "Rhodde Peptide lip tint",
            "price": "$768.00",
            "desc": "Tinta-gloss con péptidos hidratante. 3 raspberry jelly.",
            "rating": 4.8,
            "reviews": 856,
            "category": "Labios",
            "badge": "Limited Edition",
            "imageMain": "https://juicyskinmx.com/cdn/shop/files/IMG-9965.webp?v=1750288801&width=1445",
            "imageHover": "https://houseophilia.com/cdn/shop/files/46998109-D02C-4416-9EF5-523E6B3737E5.webp?v=1760657758&width=1946",
            "brand": "Rhode",
            "variants": "[{\"name\":\"Espresso\",\"image\":\"https://mrshoesaccessories.com/cdn/shop/files/83_af7515d2-2cc8-4ac9-b7fa-d3717ddf731e.png?v=1753334859&width=2970\",\"hex\":\"#6E3F35\"},{\"name\":\"Raspberry Jelly \",\"image\":\"https://www.rhodeskin.com/cdn/shop/files/flatlay-square-rasp_grande.png?v=1695255630\",\"hex\":\"#B03A5B\"},{\"name\":\"Salty Tan \",\"image\":\"https://www.rhodeskin.com/cdn/shop/files/mainimage-saltytan-SQ_grande.png?v=1718258327\",\"hex\":\"#C15A6A\"},{\"name\":\"Rhode vanilla\",\"image\":\"https://www.rhodeskin.com/cdn/shop/files/main-png-2000x2000_watermelon_cc3c028b-5e97-40c7-aa0e-e6b10a808fd3.png?v=1709759894\",\"hex\":\"#F2A3B8\"}]"
        },
        {
            "id": 66,
            "title": "Micro Brow Pencil",
            "price": "$420",
            "desc": "Crayon micro para cejas",
            "rating": 4.5,
            "reviews": 14500,
            "category": "Rostro",
            "badge": "",
            "imageMain": "https://www.nyxcosmetics.com.mx/dw/image/v2/AATL_PRD/on/demandware.static/-/Sites-nyx-latam-master-ng-catalog/default/dwd8b9540d/ProductImages/Eyes/Micro_Brow_Pencil/microbrowpencil_main.jpg?sw=1400&sh=1400&sm=cut&sfrm=jpg&q=70",
            "imageHover": "https://www.nyxcosmetics.com.mx/dw/image/v2/AATL_PRD/on/demandware.static/-/Sites-nyx-latam-master-ng-catalog/default/dwa8f10135/ProductImages/Eyes/Micro_Brow_Pencil/assets_202021/NYX-PMU-Makeup-Eyes-Eyebrows-MBP01-Taupe-000-0800897836702-Application-Valerie-01.jpg?sw=1400&sh=1400&sm=cut&sfrm=jpg&q=70",
            "brand": "NYX",
            "variants": "[]"
        },
        {
            "id": 67,
            "title": "Refy face primer",
            "price": "$710.00",
            "desc": "Glow and sculpt primer",
            "rating": 4.6,
            "reviews": 890,
            "category": "Piel",
            "badge": "Trending",
            "imageMain": "https://sfycdn.speedsize.com/d2d3381f-f48a-4389-b41e-1d53123fab1b/https://refybeauty.com/cdn/shop/files/FACE_PRIMER_GLOW_AND_SCULPT_-_FLAT_-_OPEN_-_RESHOOT.jpg?v=1756990524&width=1024",
            "imageHover": "https://sfycdn.speedsize.com/d2d3381f-f48a-4389-b41e-1d53123fab1b/refybeauty.com/cdn/shop/files/PRIMER-5.jpg?v=1756990524&width=1296",
            "brand": "Refy",
            "variants": "[]"
        },
        {
            "id": 71,
            "title": "Haus Labs Precision Sculpt Baume Contouring",
            "price": "$967",
            "desc": "Una revolucionaria barra de contorno que redefine tu rutina. Contornea, moldea y reafirma visiblemente. Tono Angle.",
            "rating": 4.8,
            "reviews": 432,
            "category": "Rostro",
            "badge": "Trending",
            "imageMain": "https://www.hauslabs.com/cdn/shop/files/2025__0008_HL_Precision_Shaping_Balm_Angle_2376x.jpg?v=1755018854",
            "imageHover": "https://www.hauslabs.com/cdn/shop/files/Shaping_Balm_BA_ANGLE_1512x.jpg?v=1755018859",
            "brand": "Haus Labs",
            "variants": "[{\"name\":\"Angle\",\"image\":\"https://www.hauslabs.com/cdn/shop/files/2025__0008_HL_Precision_Shaping_Balm_Angle_2376x.jpg?v=1755018854\",\"hex\":\"#B49378\"},{\"name\":\"Chisel\",\"image\":\"https://www.hauslabs.com/cdn/shop/files/2025__0007_HL_Precision_Shaping_Balm_Chisel_1296x.jpg?v=1755018854\",\"hex\":\"#9B7B6B\"}]"
        },
        {
            "id": 72,
            "title": "Sacapuntas Ulta Beauty",
            "price": "$160",
            "desc": "Sacapuntas para lápices de maquillaje",
            "rating": 4.6,
            "reviews": 1621,
            "category": "Rostro",
            "badge": "",
            "imageMain": "https://media.ulta.com/i/ulta/1951196?w=1080&h=1080&fmt=auto",
            "imageHover": "https://media.ulta.com/i/ulta/1951196?w=1080&h=1080&fmt=auto",
            "brand": "Ulta Beauty",
            "variants": "[]"
        },
        {
            "id": 73,
            "title": "Spotty protection patches",
            "price": "$250.00",
            "desc": "Parches hidrocoloides ultra-delgados diseñados para tratar y proteger granitos e imperfecciones",
            "rating": 4.5,
            "reviews": 340,
            "category": "Piel",
            "badge": "",
            "imageMain": "https://m.media-amazon.com/images/I/61wORikyNUL._AC_UF1000,1000_QL80_.jpg",
            "imageHover": "https://m.media-amazon.com/images/I/61nYl5+954L._AC_UF1000,1000_QL80_.jpg",
            "brand": "Milo Concept",
            "variants": "[]"
        },
        {
            "id": 74,
            "title": "Elf Halo Glow - Polvo compacto",
            "price": "$420.00",
            "desc": "Polvo compacto para rostro que reduce el brillo. ",
            "rating": 4.6,
            "reviews": 10,
            "category": "Rostro",
            "badge": "",
            "imageMain": "https://www.recapbeauty.com/cdn/shop/files/19_cream-39.png?v=1751302589&width=600",
            "imageHover": "https://www.sephora.com.mx/on/demandware.static/-/Sites-masterCatalog_Sephora/es_MX/dw5433e7cc/images/hi-res/boletos/Roc%C3%ADo%20Mart%C3%ADnez/E.L.F/E.L.F.%202025/609332845435_3.jpg",
            "brand": "Elf",
            "variants": "[{\"name\":\"Fair Neutral Cool \",\"image\":\"https://www.elfcosmetics.com/dw/image/v2/BBXC_PRD/on/demandware.static/-/Sites-elf-master/default/dw30607d6a/2024/HaloGlowPowderFilter/84543_CLOSED_v5_R.jpg?sfrm=png&sw=780&q=90&strip=false\",\"hex\":\"#E6BFAE\"},{\"name\":\"Fair Warm \",\"image\":\"https://www.elfcosmetics.com/dw/image/v2/BBXC_PRD/on/demandware.static/-/Sites-elf-master/default/dw1bb42ff7/2024/HaloGlowPowderFilter/84544_CLOSED_v6_R.jpg?sfrm=png&sw=780&q=90&strip=false\",\"hex\":\"#E7C58F\"}]"
        },
        {
            "id": 79,
            "title": "Elf Monochromatic Multi Stick ",
            "price": "$355",
            "desc": "Barra de color multiusos para ojos, labios y mejillas. ",
            "rating": 4.2,
            "reviews": 3406,
            "category": "Rostro",
            "badge": "",
            "imageMain": "https://images.asos-media.com/products/elf-monochromatic-multi-stick-sparkling-rose/202524028-1-sparklingrose?$n_640w$&wid=513&fit=constrain",
            "imageHover": "https://elgabachito.com/cdn/shop/files/81327_VALYN_MONOCHROMATIC_2_051_v1-jpg.jpg?v=1733783401&width=1445",
            "brand": "Elf",
            "variants": "[{\"name\":\"Dazzling Peony \",\"image\":\"https://images.asos-media.com/products/elf-colorete-multiusos-en-barra-monochromatic-tono-dazzling-peony/202527049-3?$n_640w$&wid=513&fit=constrain\",\"hex\":\"#E89A9D\"},{\"name\":\"Sparkling Rose \",\"image\":\"https://images.asos-media.com/products/elf-monochromatic-multi-stick-sparkling-rose/202524028-1-sparklingrose?$n_640w$&wid=513&fit=constrain\",\"hex\":\"#B8645F\"}]"
        },
        {
            "id": 80,
            "title": "Huda Beauty - Easy Bake",
            "price": "$970.00",
            "desc": "Polvo compacto superfino con control de brillo de 12 horas para un acabado mate con aerógrafo que no se apelmaza.",
            "rating": 4.8,
            "reviews": 320,
            "category": "Rostro",
            "badge": "",
            "imageMain": "https://hudabeauty.com/cdn/shop/files/PDP-SECTION1-EASYBAKEPRESSEDPOWDER-PEACHCUPCAKE-TILE1_2.jpg?v=1766386817&width=1946",
            "imageHover": "https://hudabeauty.com/cdn/shop/files/PDP-SECTION1-EASYBAKEPRESSEDPOWDER-PEACHCUPCAKE-TILE6.jpg?v=1766386833&width=1946",
            "brand": "Huda Beauty",
            "variants": "[{\"name\":\"Peach cupcake\",\"image\":\"https://hudabeauty.com/cdn/shop/files/PDP-SECTION1-EASYBAKEPRESSEDPOWDER-PEACHCUPCAKE-TILE1_2.jpg?v=1766386817&width=1946\",\"hex\":\"#F2C6B5\"}]"
        },
        {
            "id": 81,
            "title": "Touchland Desinfectante de Manos",
            "price": "$484",
            "desc": "Pensado para el cuidado de la piel que deja las manos desinfectadas, hidratadas y perfumadas.\n\n",
            "rating": 4.9,
            "reviews": 5166,
            "category": "Piel",
            "badge": "Trending",
            "imageMain": "https://touchland.com/cdn/shop/files/TheEssentialIconsProductCard.jpg?v=1738245573&width=900",
            "imageHover": "https://i.pinimg.com/736x/b6/a9/f8/b6a9f8c1efd1a4c5df825e8c1ecb9156.jpg",
            "brand": "Touchland",
            "variants": "[{\"name\":\"Applelicious \",\"image\":\"https://touchland.com/cdn/shop/files/HeroImage_Applelicious.jpg?v=1737728273&width=2000\",\"hex\":\"#B8CFA4\"},{\"name\":\"Vainilla Blossom \",\"image\":\"https://touchland.com/cdn/shop/files/HeroImage_VanillaBlossom.jpg?v=1738215033&width=2000\",\"hex\":\"#E4E06A\"}]"
        },
        {
            "id": 82,
            "title": "Patrick Ta Sombra de Ojos ",
            "price": "$1,140",
            "desc": "Dúo de sombras de ojo con brillo. Formula vegana y libre de parabenos. ",
            "rating": 4.9,
            "reviews": 637,
            "category": "Rostro",
            "badge": "Trending",
            "imageMain": "https://patrickta.com/cdn/shop/files/Holiday_MD-EyeShadowDuos_PDP_StillAtTheClub_Angled-Compact.jpg?v=1758733382&width=800",
            "imageHover": "https://beautyloversmexico.com/cdn/shop/products/3F232587-20ED-4EB9-B999-AF742E6B4F2E_1445x.jpg?v=1633191854",
            "brand": "Patrick Ta",
            "variants": "[]"
        },
        {
            "id": 83,
            "title": "Patrick Ta Mini Plump Gloss",
            "price": "$690",
            "desc": "Gloss Voluminizador hidratante, no pegajoso. ",
            "rating": 4.7,
            "reviews": 23,
            "category": "Labios",
            "badge": "",
            "imageMain": "https://patrickta.com/cdn/shop/files/PT_Plumping-Gloss-Mini-2CCs-Closed.jpg?v=1746220865&width=800",
            "imageHover": "https://patrickta.com/cdn/shop/files/2CCs-av-02.jpg?v=1746220865&width=800",
            "brand": "Patrick Ta",
            "variants": "[]"
        },
        {
            "id": 84,
            "title": "SAIE - LA BROCHA GRANDE ",
            "price": "$1,156",
            "desc": "Hecha para fórmulas líquidas, de crema o polvo. ",
            "rating": 4.9,
            "reviews": 980,
            "category": "Rostro",
            "badge": "",
            "imageMain": "https://saiehello.com/cdn/shop/products/saie-big-brush-2022-featured-2.jpg?v=1646844864",
            "imageHover": "https://saiehello.com/cdn/shop/products/ded7ad70ba584348be76ee758048b6bd.thumbnail.0000000.jpg?v=1623754049",
            "brand": "Saie",
            "variants": "[]"
        },
        {
            "id": 85,
            "title": "Saie - La brocha para base ",
            "price": "$945",
            "desc": "Brocha para base.",
            "rating": 5,
            "reviews": 100,
            "category": "Rostro",
            "badge": "",
            "imageMain": "https://saiehello.com/cdn/shop/products/thebasebrush._1080x.png?v=1678466390",
            "imageHover": "https://womensbeauty.mx/cdn/shop/files/imagen_2024-06-11_102837471.png?v=1718126677&width=1445",
            "brand": "Saie",
            "variants": "[]"
        },
        {
            "id": 86,
            "title": "Saie - Brocha Fluffly para Polvo Fijador ",
            "price": "$865",
            "desc": "Brocha para polvo fijador y productos en crema. ",
            "rating": 4.9,
            "reviews": 324,
            "category": "Rostro",
            "badge": "",
            "imageMain": "https://damarbeauty.com/cdn/shop/files/s2513042-main-zoom.webp?v=1693512139",
            "imageHover": "https://saiehello.com/cdn/shop/products/ecc3f7ea52c74d0f887e9cfcb218179a.thumbnail.0000000.jpg?v=1643078655",
            "brand": "Saie",
            "variants": "[]"
        },
        {
            "id": 87,
            "title": "Patrick Ta Brocha Contorno Nariz ",
            "price": "$1,245",
            "desc": "Brocha de dos puntas que aplica cremas y polvos en áreas pequeñas del rostro.",
            "rating": 4.9,
            "reviews": 100,
            "category": "Rostro",
            "badge": "Exclusive",
            "imageMain": "https://www.uhlala.mx/cdn/shop/files/PrecisionDualEndedNoseBrush.webp?v=1706812218&width=1400",
            "imageHover": "https://www.uhlala.mx/cdn/shop/files/PrecisionDualEndedNoseBrush1.webp?v=1706812219&width=1200",
            "brand": "Patrick Ta",
            "variants": "[]"
        },
        {
            "id": 88,
            "title": "Huda Mini Polvo Fijador",
            "price": "$686",
            "desc": "Difumina las líneas finas y los poros y fija el maquillaje durante 16 horas",
            "rating": 4.9,
            "reviews": 107,
            "category": "Rostro",
            "badge": "Trending",
            "imageMain": "https://hudabeauty.com/cdn/shop/files/PDP-SECTION1-MINIEASYBAKELOOSEPOWDER-PEACHPIE-TILE1.webp?v=1759873549&width=1946",
            "imageHover": "https://hudabeauty.com/cdn/shop/files/PDP-SECTION1-MINIEASYBAKELOOSEPOWDER-PEACHPIE-TILE2.webp?v=1759873552&width=1946",
            "brand": "Huda Beauty",
            "variants": "[]"
        },
        {
            "id": 89,
            "title": "Huda Dúo de Esponjas ",
            "price": "$375",
            "desc": "Esponja grande y mini para polvo fijador de maquillaje ",
            "rating": 4.8,
            "reviews": 100,
            "category": "Sets",
            "badge": "",
            "imageMain": "https://www.sephora.com.mx/dw/image/v2/BFJC_PRD/on/demandware.static/-/Sites-masterCatalog_Sephora/es_MX/dw14cf04c9/images/hi-res/boletos/Roc%C3%ADo%20Mart%C3%ADnez/HUDA%20BEAUTY/BLUSH%20FILTER%202025/6291107573779-hero.jpg?sw=1200&sh=1200&sm=fit",
            "imageHover": "https://damarbeauty.com/cdn/shop/files/s2742229-av-01-zoom.webp?v=1746203234&width=1445",
            "brand": "Huda Beauty",
            "variants": "[]"
        },
        {
            "id": 90,
            "title": "Benefit Mini Primer The Porefessional",
            "price": "$340",
            "desc": "Primer antes del maquillaje para tapar poros y suavizar la piel",
            "rating": 4.5,
            "reviews": 206,
            "category": "Piel",
            "badge": "",
            "imageMain": "https://www.sephora.com.mx/on/demandware.static/-/Sites-masterCatalog_Sephora/es_MX/dw72594010/images/hi-res/boletos/Regina%20G/BENEFIT/primer-benefit-the-porefessional-mini-294281-A.jpg",
            "imageHover": "https://www.sephora.com.mx/on/demandware.static/-/Sites-masterCatalog_Sephora/es_MX/dw72594010/images/hi-res/boletos/Regina%20G/BENEFIT/primer-benefit-the-porefessional-mini-294281-A.jpg",
            "brand": "Benefit",
            "variants": "[]"
        },
        {
            "id": 91,
            "title": "Summer Fridays ",
            "price": "$720",
            "desc": "Bálsamo labial vegano que acondiciona y suaviza los labios secos con un toque de color",
            "rating": 4.8,
            "reviews": 4278,
            "category": "Labios",
            "badge": "Best Seller",
            "imageMain": "https://alealarconbeauty.com/cdn/shop/files/LIP_BUTTER_BALMS_SHADES_TEINTES_7-scaled_webp.jpg?v=1705354438",
            "imageHover": "https://m.media-amazon.com/images/I/810svqoDCvL._AC_SX679_.jpg",
            "brand": "Summer Fridays",
            "variants": "[{\"name\":\"Pink Sugar\",\"image\":\"https://www.spacenk.com/on/demandware.static/-/Sites-spacenkmastercatalog/default/dwc6628ba1/products/SUMMER_FRI/UK200037846_SUMMER_FRI.jpg\",\"hex\":\"#F47E8A\"},{\"name\":\"Brown Sugar \",\"image\":\"https://apothecabeauty.com/cdn/shop/files/SummerFridays-LipButterBalm-BrownSugar_1.jpg?v=1704787419\",\"hex\":\"#6B2F2A\"}]"
        },
        {
            "id": 92,
            "title": "Fenty Icon Velvet Labial Líquido ",
            "price": "$890",
            "desc": "Labial matte de alta duración con color de alto impacto ",
            "rating": 4,
            "reviews": 1143,
            "category": "Labios",
            "badge": "",
            "imageMain": "https://cdn.shopify.com/s/files/1/0341/3458/9485/files/FB_POSTHOL22_T2PRODUCT_CONCRETE_FENTY_ICON_VELVET_LIQUID_LIP_OPEN_WICKEDWHINE_1200x1500_daa2d7b4-8eaf-4bf3-9f36-db2631e19e82.jpg?v=1762279033&width=2048",
            "imageHover": "https://cdn.shopify.com/s/files/1/0341/3458/9485/files/FB_FALL23_T2PRODUCT_EDITORIAL_ICON_LIQUID_VELVET_WICKEDWHINE_1200X1500_72DPI.jpg?v=1768520901&width=2048",
            "brand": "Fenty Beauty",
            "variants": "[{\"name\":\"Whicked Wine\",\"image\":\"https://cdn.shopify.com/s/files/1/0341/3458/9485/files/FB_POSTHOL22_T2PRODUCT_CONCRETE_FENTY_ICON_VELVET_LIQUID_LIP_OPEN_WICKEDWHINE_1200x1500_daa2d7b4-8eaf-4bf3-9f36-db2631e19e82.jpg?v=1762279033&width=2048\",\"hex\":\"#8B1F2D\"},{\"name\":\"Noodz & Dudez\",\"image\":\"https://cdn.shopify.com/s/files/1/0341/3458/9485/files/FB_POSTHOL22_T2PRODUCT_CONCRETE_FENTY_ICON_VELVET_LIQUID_LIP_OPEN_NOODZ_DUDEZ_1200x1500_c693f07c-6c84-4370-868b-5e2df921bb33.jpg?v=1762279030&width=2048\",\"hex\":\"#C96E5C\"}]"
        },
        {
            "id": 93,
            "title": "Westman Atelier Rubor ",
            "price": "$1,498",
            "desc": "Rubor en barra de la más alta gama, en tono petal. ",
            "rating": 4.8,
            "reviews": 2063,
            "category": "Rostro",
            "badge": "Best Seller",
            "imageMain": "https://www.westman-atelier.com/cdn/shop/files/BlushStick-PLP-First_96b4932a-ea3b-4b4f-9dc8-3a1df24887bd.jpg?format=pjpg&v=1723504126&width=1200",
            "imageHover": "https://www.westman-atelier.com/cdn/shop/files/BABYCHEEKS_Petal_Model_WA.jpg?format=pjpg&v=1758573770&width=1200",
            "brand": "Westman Atelier",
            "variants": "[]"
        },
        {
            "id": 94,
            "title": "Saie Spray fijador ligero Mini CitySet ",
            "price": "$595",
            "desc": "Fijador Mini para que tu maquillaje sea de 16 horas de más alta duración.",
            "rating": 5,
            "reviews": 3,
            "category": "Rostro",
            "badge": "",
            "imageMain": "https://saiehello.com/cdn/shop/files/Saie_CitySet_Full_Component_WithShadow_1200x1200.png?v=1764878407",
            "imageHover": "https://saiehello.com/cdn/shop/files/Saie_CitySet_Full_Component_Model_1_1200x1200.png?v=1764878407",
            "brand": "Saie",
            "variants": "[]"
        },
        {
            "id": 95,
            "title": "Saie Rubor en polvo SuperSuede",
            "price": "$899",
            "desc": "Batido y horneado a mano con técnicas italianas de larga tradición - Tono Mia",
            "rating": 4.9,
            "reviews": 256,
            "category": "Rostro",
            "badge": "",
            "imageMain": "https://http2.mlstatic.com/D_Q_NP_706653-CBT88495726709_072025-O.webp",
            "imageHover": "https://http2.mlstatic.com/D_NQ_NP_613082-CBT88495498997_072025-O.webp",
            "brand": "Saie",
            "variants": "[]"
        },
        {
            "id": 96,
            "title": "Summer Fridays Mini Jet Lag Mask + Hidratante",
            "price": "$865",
            "desc": "Puede usarse como hidratante de cara, mascarilla y crema de manos o corporal.",
            "rating": 4.7,
            "reviews": 1205,
            "category": "Piel",
            "badge": "Trending",
            "imageMain": "https://summerfridays.com/cdn/shop/files/Mini-Jet-Lag-Main-Square_1024x1024.jpg?v=1720469004",
            "imageHover": "https://summerfridays.com/cdn/shop/files/PDP_JLM.jpg?v=1733879671&width=2000",
            "brand": "Summer Fridays",
            "variants": "[]"
        },
        {
            "id": 97,
            "title": "Haus Labs rubor en polvo",
            "price": "$1,156",
            "desc": "Rubor sin talco con árnica fermentada",
            "rating": 4.9,
            "reviews": 2145,
            "category": "Rostro",
            "badge": "Best Seller",
            "imageMain": "https://www.hauslabs.com/cdn/shop/files/HL_MAR24_PDP_BlushPwdr_SILO-DTC_FrenchRosette_1296x.jpg?v=1709226173",
            "imageHover": "https://www.uhlala.mx/cdn/shop/files/ColorFuseTalc-FreeBlush1.jpg?v=1709926399&width=1280",
            "brand": "Haus Labs",
            "variants": "[{\"name\":\"Hibiscus Haze\",\"image\":\"https://www.hauslabs.com/cdn/shop/files/HL_MAR24_PDP_BlushPwdr_SILO-DTC_HibiscusHaze_1296x.jpg?v=1709226173\",\"hex\":\"#D96B7A\"},{\"name\":\"French Rosette\",\"image\":\"https://www.hauslabs.com/cdn/shop/files/HL_MAR24_PDP_BlushPwdr_SILO-DTC_FrenchRosette_1296x.jpg?v=1709226173\",\"hex\":\"#E07463\"}]"
        },
        {
            "id": 98,
            "title": "Saie Polvo Fijador",
            "price": "$978",
            "desc": "Acabado radiante y matificante - Translucent 2",
            "rating": 4.8,
            "reviews": 340,
            "category": "Rostro",
            "badge": "",
            "imageMain": "https://www.uhlala.mx/cdn/shop/files/SaieSlipTint_UndetectableBakedSettingPowder.webp?v=1752174486&width=2048",
            "imageHover": "https://www.uhlala.mx/cdn/shop/files/SaieSlipTint_UndetectableBakedSettingPowder3.webp?v=1752174486&width=1400",
            "brand": "Saie",
            "variants": "[]"
        }
    ]; function initSearch() {
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
                const bestSellers = products.filter(p => p.badge && p.badge.includes('Best Seller') || p.badge.includes('Viral'));
                renderGrid(homeGrid, bestSellers);
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

        renderPage();
    }

    // Checkout Logic (MOCKED)
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (cart.length === 0) {
                alert("Tu carrito está vacío.");
                return;
            }
            alert("Esta es una versión DEMO estática. El checkout real requiere un servidor Node.js.");
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
