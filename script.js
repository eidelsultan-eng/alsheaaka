document.addEventListener('DOMContentLoaded', () => {
    const cartBtn = document.getElementById('cart-btn');
    const closeCart = document.getElementById('close-cart');
    const cartSidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('overlay');
    const addToCartBtns = document.querySelectorAll('.add-to-cart');
    const cartCount = document.querySelector('.cart-count');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotal = document.getElementById('cart-total');

    let cart = [];

    // Toggle Cart
    const toggleCart = () => {
        cartSidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    };

    if (cartBtn) cartBtn.addEventListener('click', toggleCart);
    if (closeCart) closeCart.addEventListener('click', toggleCart);
    if (overlay) overlay.addEventListener('click', toggleCart);

    // Add to Cart (Deprecated but kept for stability)
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const id = card.dataset.id;
            const name = card.querySelector('h3').innerText;
            const price = parseInt(card.querySelector('.price')?.innerText.replace(' ر.س', '') || 0);
            const img = card.querySelector('img').src;

            addItemToCart({ id, name, price, img });
            updateCartUI();
        });
    });

    function addItemToCart(product) {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ ...product, qty: 1 });
        }
    }

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        if (cartCount) cartCount.innerText = totalItems;

        if (cart.length === 0) {
            if (cartItemsContainer) cartItemsContainer.innerHTML = '<p class="empty-msg">السلة فارغة حالياً</p>';
        } else {
            if (cartItemsContainer) cartItemsContainer.innerHTML = cart.map(item => `
                <div class="cart-item" style="display: flex; gap: 15px; margin-bottom: 20px; align-items: center;">
                    <img src="${item.img}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px;">
                    <div style="flex: 1;">
                        <h4 style="font-size: 0.9rem;">${item.name}</h4>
                        <p style="color: var(--accent); font-weight: 700;">${item.price} ر.س</p>
                    </div>
                </div>
            `).join('');
        }

        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        if (cartTotal) cartTotal.innerText = `${total} ر.س`;
    }

    // Hide Preloader
    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }
    });

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            if (navLinks.style.display === 'flex') {
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = '#fff';
                navLinks.style.padding = '20px';
                navLinks.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
            }
        });
    }

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // WhatsApp Ordering Function
    window.orderWhatsApp = (name, imgSrc) => {
        const phone = "201220189879";

        // Ensure the image path is URL-safe (encodes spaces and special characters)
        const safeImgSrc = encodeURI(imgSrc);

        // Construct the full URL
        let fullImgUrl = "";
        if (window.location.protocol === 'file:') {
            fullImgUrl = "(رابط الصورة متاح عند رفع الموقع على الإنترنت)";
        } else {
            const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '').replace(/\/$/, '');
            fullImgUrl = baseUrl + '/' + safeImgSrc;
        }

        // Simpler format as requested by the user
        const message = `مرحباً الشياكة، أود الاستفسار عن: ${name}\n${fullImgUrl}`;

        const encodedMsg = encodeURIComponent(message);
        window.open(`https://wa.me/${phone}?text=${encodedMsg}`, '_blank');
    };
});
