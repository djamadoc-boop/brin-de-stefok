/**
 * ====================================================================
 * BRIN DE STEF - MOTEUR E-COMMERCE SÉCURISÉ
 * ====================================================================
 */

// ===== 1. CONFIGURATION GLOBALE =====
const CONFIG = {
    SUPABASE_URL: "https://bnugdfehnamfgkapymev.supabase.co",
    SUPABASE_KEY: "sb_publishable__qbUzq8ULFT2Ghz2si9aSw_nxQMXEcc",
    COUPON_CODE: "BIENVENUE10",
    DISCOUNT_RATE: 0.10, // 10%
    SHIPPING_COST: 4.90,
    FREE_SHIPPING_THRESHOLD: 50
};

// ===== 2. ÉTAT DE L'APPLICATION (Stockage des données en cours) =====
window.AppState = {
    supabase: null,
    products: [],
    cart: JSON.parse(localStorage.getItem('stef_cart') || '[]'),
    currentUser: null,
    currentQty: 1,
    discountApplied: false
};

// ===== 3. PRODUITS DE SECOURS (Si la base de données est inaccessible) =====
const LOCAL_PRODUCTS = [
    { id: 1, name: "Boucles d'oreilles Créoles Coeurs Dorés Brillant", category: "boucles", price: 7.90, badge: "Élégant", description: "Fines créoles dorées ornées d'un pendentif cœur brillant.", materials: ["Créoles fines dorées", "Pendentifs cœurs métalliques dorés"], images: ["images/brin-de-stef-boucle-oreille-créoles-doré-coeur-bijoux-artisanaux.webp"], rating: 5, reviews: 0 },
    { id: 2, name: "Boucles d'oreilles Pendantes Navettes Jaune Moutarde et Perles Turquoises", category: "boucles", price: 8.50, badge: "Original", description: "Légères et colorées, ces boucles d'oreilles arborent une touche ethnique.", materials: ["Crochets d'oreilles dorés en acier inoxydable", "Pendentifs navettes émaillés jaune moutarde", "Petites perles de rocailles turquoises et dorées"], images: ["images/brin-de-stef-boucle-oreille-goutte-jaune-longues-bijoux-artisanaux.webp"], rating: 4, reviews: 3 },
    { id: 3, name: "Boucles d'oreilles Navettes Émaillées Rouge Corail et Dorées", category: "boucles", price: 6.90, badge: "Élégant", description: "Discrètes et colorées, ces boucles d'oreilles apportent une touche d'élégance.", materials: ["Crochets d'oreilles dorés en acier inoxydable", "Pendentifs navettes émaillés rouge corail"], images: ["images/brin-de-stef-boucle-oreille-goutte-rouge1-courtes-bijoux-artisanaux.webp"], rating: 4, reviews: 3 },
    { id: 4, name: "Boucles d'oreilles Disques Martelés Dorés et Perles Roses", category: "boucles", price: 8.90, badge: "Nouveauté", description: "Délicates boucles pendantes ornées de disques martelés pour une touche de lumière et d'élégance.", materials: ["Crochets d'oreilles longs dorés", "Pendentifs disques ronds martelés", "Perles de rocailles roses et métallisées"], images: ["images/brin-de-stef-boucle-oreille-rond-doré-perle-rose-bijoux-artisanaux.webp"], rating: 5, reviews: 0 },
    { id: 5, name: "Boucles d'oreilles Disques Martelés Dorés et Perles Bleues", category: "boucles", price: 8.90, badge: "Nouveauté", description: "Bohèmes et lumineuses, ces boucles d'oreilles pendantes sont ornées de disques martelés et d'une touche de bleu.", materials: ["Crochets d'oreilles longs dorés", "Pendentifs disques ronds martelés", "Perles de rocailles bleues et métallisées"], images: ["images/brin-de-stef-boucle-oreille-rond-doré-perle-bleu-bijoux-artisanaux.webp"], rating: 5, reviews: 0 },
    { id: 6, name: "Bracelet Cordon Noir et Croix Argentée Minimaliste", category: "bracelets", price: 9.50, badge: "Indémodable", description: "Bracelet fin et ajustable, idéal pour une touche sobre et élégante au quotidien.", materials: ["Cordon noir résistant", "Croix en métal argenté", "Fermoir mousqueton et apprêts argentés"], images: ["images/brin-de-stef-bracelet-poignet-noir-croix-argent-bijoux-artisanaux.webp"], rating: 5, reviews: 0 },
    { id: 7, name: "Bracelet Cordon Noir et Pendentif Cœur Doré-Rose Minimaliste", category: "bracelets", price: 9.90, badge: "Romantique", description: "Fina et discret, ce bracelet sur cordon arbore un joli petit cœur doré-rose pour une touche de douceur.", materials: ["Cordon noir fin résistant", "Petit pendentif cœur doré-rose", "Fermoir mousqueton argenté"], images: ["images/brin-de-stef-bracelet-poignet-noir-coeur-doré-bijoux-artisanaux.webp"], rating: 4, reviews: 3 },
    { id: 8, name: "Bracelet Cordon Rouge et Croix Dorée", category: "bracelets", price: 9.90, badge: "Éclatant", description: "Un bracelet minimaliste et lumineux, mêlant la vivacité du cordon rouge à l'élégance d'une croix dorée.", materials: ["Cordon rouge fin et résistant", "Croix en métal doré", "Fermoir mousqueton et apprêts dorés"], images: ["images/brin-de-stef-bracelet-poignet-rouge-croix-doré-bijoux-artisanaux.webp"], rating: 5, reviews: 0 },
    { id: 9, name: "Bracelet Cordon Noir et Perle Bleue Nacrée", category: "bracelets", price: 8.50, badge: "Nouveauté", description: "Un bracelet minimaliste et élégant, parfait pour accessoiriser tes tenues avec une touche de bleu intense.", materials: ["Cordon noir ajustable", "Perle bleue nacrée", "Apprêts dorés"], images: ["images/brin-de-stef-bracelet-poignet-noir-perle-bleu-bijoux-artisanaux.webp"], rating: 5, reviews: 0 },
];

// ===== 4. INITIALISATION SUPABASE & PRODUITS =====
try {
    if (typeof window.supabase !== 'undefined') {
        window.AppState.supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
    }
} catch (e) { 
    console.error("Supabase n'a pas pu être chargé :", e); 
}

async function loadProducts() {
    try {
        if (!window.AppState.supabase) { 
            window.AppState.products = LOCAL_PRODUCTS; 
            return; 
        }
        
        const { data, error } = await window.AppState.supabase
            .from('products')
            .select('*')
            .order('id', { ascending: true });
            
        if (error) throw error;
        window.AppState.products = (data && data.length > 0) ? data : LOCAL_PRODUCTS;

    } catch (err) { 
        console.warn("Utilisation des produits de secours suite à une erreur :", err);
        window.AppState.products = LOCAL_PRODUCTS; 
    }
}

/**
 * ====================================================================
 * PARTIE 2 : UTILITAIRES, PANIER & INITIALISATION UI (Dréa Digital)
 * ====================================================================
 */

// ===== 5. UTILITAIRES D'INTERFACE (UI) =====
window.showNotification = function(txt) {
    const n = document.getElementById('notification');
    if (n) {
        document.getElementById('notifText').textContent = txt;
        n.classList.add('show');
        setTimeout(() => n.classList.remove('show'), 3000);
    }
};

window.toggleMobileMenu = function() {
    const toggleBtn = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    
    toggleBtn?.classList.toggle('open');
    navLinks?.classList.toggle('open');
    
    // UX & Accessibilité (A11y)
    if (toggleBtn) {
        const isOpen = toggleBtn.classList.contains('open');
        toggleBtn.setAttribute('aria-expanded', isOpen);
    }
};

window.toggleSearch = function() {
    document.getElementById('searchOverlay')?.classList.toggle('open');
    document.getElementById('searchBar')?.classList.toggle('open');
};

window.toggleCart = function() {
    document.getElementById('cartOverlay')?.classList.toggle('open');
    document.getElementById('cartSidebar')?.classList.toggle('open');
};

// Changement de style de la barre de navigation au scroll
window.addEventListener('scroll', () => { 
    document.querySelector('.navbar')?.classList.toggle('scrolled', window.scrollY > 50); 
});

// ===== 6. LOGIQUE DU PANIER (SÉCURISÉE) =====
window.saveCart = function() { 
    localStorage.setItem('stef_cart', JSON.stringify(window.AppState.cart)); 
};

window.getCartTotal = function() {
    let total = window.AppState.cart.reduce((sum, item) => { 
        const p = window.AppState.products.find(prod => String(prod.id) === String(item.id)); 
        return sum + (p ? parseFloat(p.price) * item.qty : 0); 
    }, 0);
    
    return window.AppState.discountApplied ? total * (1 - CONFIG.DISCOUNT_RATE) : total;
};

window.updateCartUI = function() {
    const countEl = document.querySelector('.cart-count');
    if (countEl) countEl.textContent = window.AppState.cart.reduce((sum, item) => sum + item.qty, 0);
    
    const container = document.getElementById('cartItems');
    if (!container) return;

    if (window.AppState.cart.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:20px; color:var(--gray);">Votre panier est vide</p>`;
    } else {
        container.innerHTML = window.AppState.cart.map(item => {
            const p = window.AppState.products.find(prod => String(prod.id) === String(item.id));
            if (!p) return '';
            const prix = parseFloat(p.price);
            
            // On ajoute alt, width, height et loading lazy pour la performance CLS
            return `<div class="cart-item">
                <div class="cart-item-img">
                    <img src="${p.images[0]}" alt="${p.name}" width="80" height="80" style="width:100%; height:100%; object-fit:cover;" loading="lazy">
                </div>
                <div class="cart-item-info">
                    <h4>${p.name}</h4>
                    <p>${prix.toFixed(2).replace('.', ',')}€ x ${item.qty}</p>
                    <button class="cart-item-remove" onclick="removeFromCart(${p.id})">Supprimer</button>
                </div>
            </div>`;
        }).join('');
    }

    const footer = document.getElementById('cartFooter');
    if (footer) { 
        footer.style.display = window.AppState.cart.length ? 'block' : 'none'; 
        document.getElementById('cartTotal').textContent = window.getCartTotal().toFixed(2).replace('.', ',') + ' €'; 
    }
};

window.removeFromCart = function(id) { 
    window.AppState.cart = window.AppState.cart.filter(i => String(i.id) !== String(id)); 
    window.saveCart(); 
    window.updateCartUI(); 
};

window.addToCart = function(productId) {
    const existing = window.AppState.cart.find(i => String(i.id) === String(productId));
    if (existing) {
        existing.qty += window.AppState.currentQty; 
    } else {
        window.AppState.cart.push({ id: productId, qty: window.AppState.currentQty });
    }
    window.saveCart(); 
    window.updateCartUI(); 
    window.showNotification('✨ Ajouté au panier !');
    
    // Remettre la quantité à 1 après l'ajout
    window.AppState.currentQty = 1; 
    const qtyInput = document.getElementById('qtyValue');
    if (qtyInput) qtyInput.value = 1;
};

window.goToCheckout = function() {
    window.toggleCart();
    if (window.AppState.cart.length > 0) {
        window.location.href = "checkout.html";
    } else {
        window.showNotification('⚠️ Votre panier est vide.');
    }
};

// ===== 7. INITIALISATION DU CHARGEMENT DE LA PAGE =====
let authListenerInitialized = false;

window.addEventListener('DOMContentLoaded', async () => {
    // 1. On charge les bijoux (BDD Supabase ou Local)
    await loadProducts();
    
    // 2. On met à jour l'interface du panier
    window.updateCartUI();

    // 3. Routage dynamique : On lance les fonctions selon la page en cours
    if (document.getElementById('bestsellersGrid')) {
        if (typeof window.renderBestsellers === 'function') window.renderBestsellers();
    }

    if (document.getElementById('shopGrid')) {
        const urlParams = new URLSearchParams(window.location.search);
        const prodId = urlParams.get('prod');
        const cat = urlParams.get('cat');

        if (prodId && typeof window.showProductDetail === 'function') {
            window.showProductDetail(prodId);
        } else if (cat && typeof window.filterProductsUI === 'function') {
            const targetBtn = document.querySelector(`[data-filter="${cat}"]`);
            if (targetBtn) window.filterProductsUI(cat, targetBtn);
            else if (typeof window.renderShop === 'function') window.renderShop('all');
        } else {
            if (typeof window.renderShop === 'function') window.renderShop('all');
        }
        
        if (typeof window.updateResultCount === 'function') window.updateResultCount();
    }

    // 4. Gestion sécurisée de la session utilisateur
    if (window.AppState.supabase) {
        try {
            const { data: { session } } = await window.AppState.supabase.auth.getSession();
            window.AppState.currentUser = session ? session.user : null;
            if (typeof window.updateOnlineStatusUI === 'function') window.updateOnlineStatusUI(window.AppState.currentUser);
        } catch (e) { 
            console.warn("Erreur session discrète :", e); 
        }

        if (!authListenerInitialized) {
            authListenerInitialized = true;
            window.AppState.supabase.auth.onAuthStateChange(async (event, session) => {
                window.AppState.currentUser = session ? session.user : null;
                if (typeof window.updateOnlineStatusUI === 'function') window.updateOnlineStatusUI(window.AppState.currentUser);
                
                // Si on est sur le checkout et que l'utilisateur vient de se connecter
                if (document.getElementById('checkoutMasterContainer') && window.AppState.currentUser && typeof window.proceedToCheckout === 'function') {
                    window.proceedToCheckout();
                }
            });
        }
    }
});

/**
 * ====================================================================
 * PARTIE 3 : VITRINE, RECHERCHE & SEO SÉMANTIQUE
 * ====================================================================
 */

// ===== 8. AFFICHAGE DES PRODUITS (VITRINE) =====
window.createProductCard = function(product) {
    const prix = parseFloat(product.price);
    return `<div class="product-card" onclick="window.location.href='boutique.html?prod=${product.id}'">
        <div class="product-card-img">
            <img src="${product.images[0]}" alt="Bijou artisanal : ${product.name}" width="500" height="500" loading="lazy">
            ${product.badge ? `<div class="product-card-badge">${product.badge}</div>` : ''}
        </div>
        <div class="product-info">
            <p class="product-cat">${product.category}</p>
            <h3>${product.name}</h3>
            <p class="product-price">${prix.toFixed(2).replace('.', ',')}€</p>
        </div>
    </div>`;
};

window.renderBestsellers = function() {
    const grid = document.getElementById('bestsellersGrid');
    if (grid && window.AppState.products.length > 0) {
        grid.innerHTML = window.AppState.products.slice(0, 4).map(window.createProductCard).join('');
    }
};

window.renderShop = function(categoryFilter) {
    const grid = document.getElementById('shopGrid');
    if (!grid) return;
    
    const filtered = categoryFilter === 'all' 
        ? window.AppState.products 
        : window.AppState.products.filter(p => p.category === categoryFilter);
        
    grid.innerHTML = filtered.map(window.createProductCard).join('');
};

window.filterProductsUI = function(category, btnElement) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');
    window.renderShop(category);
    window.updateResultCount();
};

window.updateResultCount = function() {
    setTimeout(() => {
        const res = document.getElementById('shopResults');
        const count = document.querySelectorAll('#shopGrid .product-card').length;
        if (res) res.textContent = count + (count > 1 ? " créations" : " création");
    }, 50);
};

window.handleSearch = function(q) {
    const resEl = document.getElementById('searchResults');
    if (!resEl) return;
    if (q.length < 2) { 
        resEl.classList.remove('active'); 
        return; 
    }
    
    const filtered = window.AppState.products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
    
    resEl.innerHTML = filtered.map(p => {
        const prix = parseFloat(p.price);
        return `<div class="search-result-item" onclick="window.location.href='boutique.html?prod=${p.id}'">
            <div class="search-result-img">
                <img src="${p.images[0]}" alt="${p.name}" width="50" height="50" loading="lazy">
            </div>
            <div class="search-result-info">
                <h4>${p.name}</h4>
                <div class="sr-price">${prix.toFixed(2).replace('.', ',')} €</div>
            </div>
        </div>`;
    }).join('');
    resEl.classList.add('active');
};

/**
 * ====================================================================
 * PARTIE 3 : VITRINE, RECHERCHE & SEO SÉMANTIQUE
 * ====================================================================
 */

// ===== 8. AFFICHAGE DES PRODUITS (VITRINE) =====
window.createProductCard = function(product) {
    const prix = parseFloat(product.price);
    return `<div class="product-card" onclick="window.location.href='boutique.html?prod=${product.id}'">
        <div class="product-card-img">
            <img src="${product.images[0]}" alt="Bijou artisanal : ${product.name}" width="500" height="500" loading="lazy">
            ${product.badge ? `<div class="product-card-badge">${product.badge}</div>` : ''}
        </div>
        <div class="product-info">
            <p class="product-cat">${product.category}</p>
            <h3>${product.name}</h3>
            <p class="product-price">${prix.toFixed(2).replace('.', ',')}€</p>
        </div>
    </div>`;
};

window.renderBestsellers = function() {
    const grid = document.getElementById('bestsellersGrid');
    if (grid && window.AppState.products.length > 0) {
        grid.innerHTML = window.AppState.products.slice(0, 4).map(window.createProductCard).join('');
    }
};

window.renderShop = function(categoryFilter) {
    const grid = document.getElementById('shopGrid');
    if (!grid) return;
    
    const filtered = categoryFilter === 'all' 
        ? window.AppState.products 
        : window.AppState.products.filter(p => p.category === categoryFilter);
        
    grid.innerHTML = filtered.map(window.createProductCard).join('');
};

window.filterProductsUI = function(category, btnElement) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');
    window.renderShop(category);
    window.updateResultCount();
};

window.updateResultCount = function() {
    setTimeout(() => {
        const res = document.getElementById('shopResults');
        const count = document.querySelectorAll('#shopGrid .product-card').length;
        if (res) res.textContent = count + (count > 1 ? " créations" : " création");
    }, 50);
};

window.handleSearch = function(q) {
    const resEl = document.getElementById('searchResults');
    if (!resEl) return;
    if (q.length < 2) { 
        resEl.classList.remove('active'); 
        return; 
    }
    
    const filtered = window.AppState.products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
    
    resEl.innerHTML = filtered.map(p => {
        const prix = parseFloat(p.price);
        return `<div class="search-result-item" onclick="window.location.href='boutique.html?prod=${p.id}'">
            <div class="search-result-img">
                <img src="${p.images[0]}" alt="${p.name}" width="50" height="50" loading="lazy">
            </div>
            <div class="search-result-info">
                <h4>${p.name}</h4>
                <div class="sr-price">${prix.toFixed(2).replace('.', ',')} €</div>
            </div>
        </div>`;
    }).join('');
    resEl.classList.add('active');
};

// ===== 9. FICHE PRODUIT DÉTAILLÉE & SEO =====
window.showProductDetail = function(id) {
    const product = window.AppState.products.find(p => String(p.id) === String(id));
    if (!product) return;

    const prix = parseFloat(product.price);
    window.AppState.currentQty = 1;

    const shopView = document.getElementById('shopView');
    const productView = document.getElementById('productView');
    if (shopView) shopView.style.display = 'none';
    if (productView) productView.style.display = 'block';
    window.scrollTo({top: 0, behavior: 'smooth'});

    const layout = document.getElementById('productLayout');
    if (!layout) return;

    const thumbnails = product.images.map(img => 
        `<div class="thumb-box" onclick="document.getElementById('mainProdImg').src='${img}'">
            <img src="${img}" alt="Miniature ${product.name}" width="100" height="100" style="width:100%; height:100%; object-fit:cover;" loading="lazy">
        </div>`
    ).join('');
    
    const mats = product.materials.map(m => `<li>${m}</li>`).join('');

    layout.innerHTML = `
        <div class="product-gallery">
             <div class="product-main-img" onclick="window.openZoom(document.getElementById('mainProdImg').src)" style="cursor:zoom-in;">
                <img id="mainProdImg" src="${product.images[0]}" alt="${product.name}" width="600" height="600" fetchpriority="high">
             </div>
             <div class="product-thumbnails">${thumbnails}</div>
        </div>
        <div class="product-details">
            <p class="product-cat">${product.category}</p>
            <h1>${product.name}</h1>
            <div class="product-price-tag">${prix.toFixed(2).replace('.', ',')} €</div>
            <p class="product-desc">${product.description}</p>
            <h4 style="margin-bottom:10px; font-family:'Lato', sans-serif; font-size:0.95rem; text-transform:uppercase; letter-spacing:1px; color:var(--black);">Détails & Matières :</h4>
            <ul class="materials-list">${mats}</ul>
            <div class="product-inline-reviews">
                <div style="display:flex; gap:15px; margin-top:40px;">
                    <div style="display:flex;">
                        <button class="qty-btn" onclick="window.changeQty(-1)">-</button>
                        <input type="text" id="qtyValue" class="qty-value" value="1" readonly>
                        <button class="qty-btn" onclick="window.changeQty(1)">+</button>
                    </div>
                    <button class="add-to-cart-btn" onclick="window.addToCart(${product.id})">Ajouter au panier</button>
                </div>
            </div>
        </div>
    `;

    // SEO Technique : Mise à jour de la balise Canonical
    const canonicalTag = document.getElementById('canonicalTag');
    if (canonicalTag) canonicalTag.href = window.location.origin + window.location.pathname + '?prod=' + product.id;

    // SEO Technique : Injection du Schéma JSON-LD
    if (typeof window.injectProductSchema === 'function') {
        window.injectProductSchema(product);
    }
};

window.changeQty = function(step) {
    window.AppState.currentQty += step;
    if (window.AppState.currentQty < 1) window.AppState.currentQty = 1; 
    const qtyInput = document.getElementById('qtyValue');
    if (qtyInput) qtyInput.value = window.AppState.currentQty;
};

window.hideProductDetail = function() {
    const shopView = document.getElementById('shopView');
    const productView = document.getElementById('productView');
    if (shopView) shopView.style.display = 'block';
    if (productView) productView.style.display = 'none';
    
    window.history.pushState({}, '', 'boutique.html');
    
    // SEO : On remet l'URL canonique par défaut
    const canonicalTag = document.getElementById('canonicalTag');
    if (canonicalTag) canonicalTag.href = window.location.origin + window.location.pathname;
};

window.openZoom = function(src) {
    const modal = document.getElementById('zoomModal');
    const img = document.getElementById('zoomImg');
    if (modal && img) { 
        img.src = src; 
        modal.classList.add('active'); 
    }
};

window.closeZoom = function() { 
    document.getElementById('zoomModal')?.classList.remove('active'); 
};

// ===== 10. SEO JSON-LD =====
window.injectProductSchema = function(product) {
    document.getElementById('dynamicProductSchema')?.remove();
    
    const baseUrl = window.location.origin + window.location.pathname;
    const itemUrl = `${baseUrl}?prod=${product.id}`;
    
    const schemaData = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": [ window.location.origin + '/' + product.images[0] ],
        "description": product.description,
        "sku": `BDS-${product.id}`,
        "offers": {
            "@type": "Offer",
            "url": itemUrl,
            "priceCurrency": "EUR",
            "price": parseFloat(product.price).toFixed(2),
            "itemCondition": "https://schema.org/NewCondition",
            "availability": "https://schema.org/InStock"
        }
    };

    const script = document.createElement('script');
    script.id = 'dynamicProductSchema';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaData);
    document.head.appendChild(script);
};

/**
 * ====================================================================
 * PARTIE 4 : AUTHENTIFICATION, CHECKOUT SÉCURISÉ & AVIS (Dréa Digital)
 * ====================================================================
 */

// ===== 11. AUTHENTIFICATION & COMPTE =====
window.handleAuth = async function(mode) {
    const email = document.getElementById('authEmail')?.value.trim();
    const pass = document.getElementById('authPassword')?.value.trim();
    
    if (!email || !pass) return window.showNotification('⚠️ Veuillez remplir email et mot de passe.');
    
    try {
        if (!window.AppState.supabase) throw new Error("Supabase non chargé");
        
        if (mode === 'signup') {
            const { error } = await window.AppState.supabase.auth.signUp({ email, password: pass });
            if (error) throw error;
            window.showNotification('✉️ Compte créé ! Vérifiez votre email.');
        } else {
            const { error } = await window.AppState.supabase.auth.signInWithPassword({ email, password: pass });
            if (error) throw error;
            window.showNotification('✅ Connecté !');
        }
        if (typeof window.proceedToCheckout === 'function') window.proceedToCheckout();
    } catch (err) {
        window.showNotification('❌ ' + err.message);
    }
};

window.continueAsGuest = function() {
    window.showNotification('👤 Achat en invité activé.');
    window.proceedToCheckout();
};

window.handlePasswordReset = async function() {
    const email = document.getElementById('resetEmail')?.value.trim();
    if (!email) return window.showNotification('⚠️ Veuillez entrer votre adresse e-mail.');

    try {
        if (!window.AppState.supabase) throw new Error("Supabase non connecté");
        const { error } = await window.AppState.supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/nouveau_mot_de_passe.html',
        });
        if (error) throw error;
        window.showNotification('✅ Un lien de réinitialisation a été envoyé.');
    } catch (err) {
        window.showNotification('❌ Erreur : ' + err.message);
    }
};

// ===== 12. CHECKOUT SÉCURISÉ (MÉTHODE DRÉA DIGITAL) =====
window.proceedToCheckout = function() {
    const authStep = document.getElementById('authStep');
    const checkoutStep = document.getElementById('checkoutStep');
    
    if (authStep) authStep.style.display = 'none';
    if (checkoutStep) {
        checkoutStep.style.display = 'grid';
        if (window.AppState.currentUser) {
            const chkEmail = document.getElementById('chkEmail');
            if (chkEmail) chkEmail.value = window.AppState.currentUser.email;
        }
        window.initCheckoutPage();
    }
};

window.initCheckoutPage = function() {
    const itemsContainer = document.getElementById('checkoutItems');
    if (!itemsContainer) return;

    if (window.AppState.cart.length === 0) {
        itemsContainer.innerHTML = '<p style="text-align:center; padding:20px; color:var(--gray);">Votre panier est vide</p>';
        const btn = document.getElementById('btnFinalizeOrder');
        if (btn) btn.disabled = true;
        return;
    }

    itemsContainer.innerHTML = window.AppState.cart.map(item => {
        const p = window.AppState.products.find(prod => String(prod.id) === String(item.id));
        return p ? `<div class="order-summary-item">
            <span class="order-summary-item-name">${p.name} <span class="order-summary-item-qty">x${item.qty}</span></span>
            <span class="order-summary-item-price">${(parseFloat(p.price) * item.qty).toFixed(2).replace('.',',')} €</span>
        </div>` : '';
    }).join('');

    window.updateCheckoutTotals();

    const finalizeBtn = document.getElementById('btnFinalizeOrder');
    if (finalizeBtn) {
        // C'EST ICI QUE SE JOUE LA SÉCURITÉ : Appel vers Netlify Functions
        finalizeBtn.onclick = async (e) => {
            e.preventDefault();
            const email = document.getElementById('chkEmail')?.value.trim();
            const prenom = document.getElementById('chkPrenom')?.value.trim();
            
            if (!email || !prenom) return window.showNotification('⚠️ Prénom et Email requis.');

            finalizeBtn.disabled = true;
            finalizeBtn.innerHTML = '<span class="spinner"></span> ⏳ Sécurisation de la commande...';
            
            try {
                // Création du Payload sécurisé (Uniquement IDs et Quantités)
                const payload = {
                    items: window.AppState.cart.map(item => ({
                        product_id: item.id,
                        quantity: item.qty
                    })),
                    email: email,
                    prenom: prenom,
                    coupon_code: window.AppState.discountApplied ? CONFIG.COUPON_CODE : null
                };

                // Appel au backend sécurisé (Netlify Function)
                const response = await fetch('/.netlify/functions/create-checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.error || 'Erreur serveur');
                }

                // Redirection vers la vraie session Stripe Checkout
                window.location.href = result.checkout_url;

            } catch (err) {
                console.error('Erreur checkout:', err);
                finalizeBtn.disabled = false;
                finalizeBtn.innerHTML = 'Payer ma commande';
                
                // FALLBACK TEMPORAIRE le temps qu'on crée la fonction Netlify :
                // window.showNotification('⚠️ Fonction Stripe non trouvée. Mode test activé.');
                // alert("Ici, on redirigera vers Stripe de manière sécurisée !");
                window.showNotification('❌ Erreur : ' + (err.message || 'Veuillez réessayer.'));
            }
        };
    }
};

window.updateCheckoutTotals = function() {
    // Note : Ce calcul est purement indicatif pour l'affichage (Règle Dréa Digital)
    const subtotal = window.AppState.cart.reduce((sum, item) => {
        const p = window.AppState.products.find(prod => String(prod.id) === String(item.id));
        return sum + (p ? parseFloat(p.price) * item.qty : 0);
    }, 0);
    
    const discount = window.AppState.discountApplied ? subtotal * CONFIG.DISCOUNT_RATE : 0;
    const subtotalAfterDiscount = subtotal - discount;
    const shippingCost = subtotalAfterDiscount >= CONFIG.FREE_SHIPPING_THRESHOLD ? 0 : CONFIG.SHIPPING_COST;
    const total = subtotalAfterDiscount + shippingCost;

    const elSubtotal = document.getElementById('chkSubtotal');
    const elTotal = document.getElementById('chkTotal');
    if (elSubtotal) elSubtotal.textContent = subtotal.toFixed(2).replace('.',',') + ' €';
    if (elTotal) elTotal.textContent = total.toFixed(2).replace('.',',') + ' €';
    
    const shippingEl = document.getElementById('chkShipping');
    if (shippingEl) {
        if (shippingCost === 0) {
            shippingEl.textContent = 'Offerte';
            shippingEl.style.color = 'var(--gold-dark)';
        } else {
            shippingEl.textContent = shippingCost.toFixed(2).replace('.',',') + ' €';
            shippingEl.style.color = 'var(--black)';
        }
    }

    const discRow = document.getElementById('chkDiscountRow');
    if (discRow) {
        if (discount > 0) {
            discRow.style.display = 'flex';
            document.getElementById('chkDiscount').textContent = '-' + discount.toFixed(2).replace('.',',') + ' €';
        } else {
            discRow.style.display = 'none';
        }
    }
};

window.applyCoupon = function() {
    const input = document.getElementById('chkCoupon');
    if (input?.value.trim().toUpperCase() === CONFIG.COUPON_CODE) {
        if (window.AppState.discountApplied) return window.showNotification('⚠️ Code déjà appliqué.');
        window.AppState.discountApplied = true;
        window.updateCheckoutTotals();
        window.showNotification('✅ Code promo appliqué (-10%) !');
    } else {
        window.showNotification('❌ Code invalide.');
    }
};

// ===== 13. AVIS PRODUITS =====
window.chargerAvisProduit = async function(productId) {
    const conteneur = document.getElementById('liste-commentaires-produit');
    if (!conteneur || !window.AppState.supabase) return;

    try {
        const { data: commentaires, error } = await window.AppState.supabase
            .from('commentaires')
            .select('*')
            .eq('produit_id', String(productId))
            .order('date_creation', { ascending: false });

        if (error) throw error;

        if (!commentaires || commentaires.length === 0) {
            conteneur.innerHTML = '<p style="font-size:0.8rem; color:var(--gray);">Soyez la première à donner votre avis.</p>';
            return;
        }

        conteneur.innerHTML = commentaires.map(avis => `
            <div class="mini-review-item" style="margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid #eee;">
                <div style="color:var(--gold); font-size:1rem; margin-bottom:2px;" aria-label="Note: ${avis.note} sur 5">
                    ${'★'.repeat(avis.note)}${'☆'.repeat(5 - avis.note)}
                </div>
                <p style="font-size:0.85rem; font-style:italic; margin:2px 0;">"${avis.message}"</p>
                <strong style="font-size:0.75rem; color:var(--black);">- ${avis.nom_client}</strong>
            </div>
        `).join('');
    } catch (err) {
        console.error("Erreur chargement avis:", err);
        conteneur.innerHTML = '<p style="font-size:0.8rem; color:red;">Erreur de chargement.</p>';
    }
};

// Écouteur pour l'envoi du formulaire d'avis
document.addEventListener('submit', async (e) => {
    if (e.target && e.target.id === 'form-avis-etoiles') {
        e.preventDefault();
        if (!window.AppState.supabase) return;
        
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('prod');
        const btn = e.target.querySelector('button[type="submit"]');
        const note = e.target.querySelector('input[name="note"]:checked');
        
        if (!note) return window.showNotification('⚠️ Veuillez choisir une note !');
        
        btn.textContent = 'Envoi...';
        btn.disabled = true;

        try {
            const { error } = await window.AppState.supabase
                .from('commentaires')
                .insert([{
                    produit_id: String(productId),
                    nom_client: document.getElementById('avis_nom').value,
                    note: parseInt(note.value),
                    message: document.getElementById('avis_message').value
                }]);

            if (error) throw error;
            
            e.target.reset();
            window.showNotification('✅ Merci pour votre avis !');
            window.chargerAvisProduit(productId);
        } catch (err) {
            window.showNotification('❌ Erreur lors de l\'envoi.');
            console.error(err);
        } finally {
            btn.textContent = 'Publier';
            btn.disabled = false;
        }
    }
});

// Liaison automatique des avis au chargement si on est sur une fiche produit
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('prod');
    if (productId) {
        setTimeout(() => window.chargerAvisProduit(productId), 500);
    }
});