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

    // --- Firebase Configuration ---
    const firebaseConfig = {
        apiKey: "AIzaSyBnaCO886pZQWvmFS8DKrqC1jqDrdT9_CM",
        authDomain: "siond-a6c34.firebaseapp.com",
        projectId: "siond-a6c34",
        storageBucket: "siond-a6c34.firebasestorage.app",
        messagingSenderId: "875547108455",
        appId: "1:875547108455:web:693bd7cfd119debf9be0c2",
        measurementId: "G-ZSCLYKRJQ4"
    };

    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();
    const storage = firebase.storage();

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // --- Admin Panel Logic ---
    const adminLoginTrigger = document.getElementById('admin-login-trigger');
    const adminLoginModal = document.getElementById('admin-login-modal');
    const adminPanelModal = document.getElementById('admin-panel-modal');
    const loginError = document.getElementById('login-error');
    const adminPasswordInput = document.getElementById('admin-password');

    const adminPassword = "010qw";

    if (adminLoginTrigger) {
        adminLoginTrigger.addEventListener('click', () => {
            if (sessionStorage.getItem('isAdmin')) {
                adminPanelModal.classList.add('active');
            } else {
                adminLoginModal.classList.add('active');
            }
        });
    }

    window.closeAdminModals = () => {
        adminLoginModal.classList.remove('active');
        adminPanelModal.classList.remove('active');
        loginError.style.display = 'none';
        renderDynamicProducts();
    };

    window.checkAdminPassword = () => {
        if (adminPasswordInput.value === adminPassword) {
            sessionStorage.setItem('isAdmin', 'true');
            adminLoginModal.classList.remove('active');
            adminPanelModal.classList.add('active');
            adminPasswordInput.value = '';
            renderDynamicProducts();
        } else {
            loginError.style.display = 'block';
        }
    };

    window.logoutAdmin = () => {
        sessionStorage.removeItem('isAdmin');
        closeAdminModals();
        renderDynamicProducts();
    };

    // Load and Render Dynamic Products
    const renderDynamicProducts = async () => {
        const categories = {
            'collection-grid': [],
            'thobe-arabi-grid': [],
            'thobe-shaarawy-grid': [],
            'thobe-wool-grid': []
        };

        try {
            const snapshot = await db.collection('products').orderBy('createdAt', 'desc').get();
            snapshot.forEach(doc => {
                const prod = doc.data();
                if (categories[prod.category]) {
                    categories[prod.category].push({ id: doc.id, ...prod });
                }
            });

            Object.keys(categories).forEach(catId => {
                const grid = document.getElementById(catId);
                if (!grid) return;

                // Remove previous dynamic items
                grid.querySelectorAll('.dynamic-product').forEach(el => el.remove());

                categories[catId].forEach(prod => {
                    const card = document.createElement('div');
                    card.className = 'product-card dynamic-product';
                    card.innerHTML = `
                        <div class="product-img-container" onclick="orderWhatsApp('${prod.name}', '${prod.img}')">
                            <img src="${prod.img}" class="product-img" alt="${prod.name}">
                        </div>
                        <div class="product-info">
                            <h3>${prod.name}</h3>
                            ${prod.specs ? `
                            <ul class="product-specs-list">
                                ${prod.specs.split('\n').filter(s => s.trim()).map(s => `<li><i class="fa-solid fa-check"></i> ${s}</li>`).join('')}
                            </ul>
                            ` : ''}
                            <a href="#" onclick="orderWhatsApp('${prod.name}', '${prod.img}')" class="whatsapp-order-btn">
                                <i class="fa-brands fa-whatsapp"></i> اطلب الآن
                            </a>
                            ${sessionStorage.getItem('isAdmin') ? `
                            <button class="delete-product-btn" onclick="deleteProduct('${prod.id}')">حذف الموديل</button>
                            ` : ''}
                        </div>
                    `;
                    grid.appendChild(card);
                });
            });
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    window.addNewModel = async () => {
        const name = document.getElementById('model-name').value;
        const specs = document.getElementById('model-specs').value;
        const category = document.getElementById('model-category').value;
        const imgFile = document.getElementById('model-image').files[0];
        const addBtn = document.querySelector('#admin-panel-modal .btn-primary');

        if (!name || !imgFile) {
            alert('يرجى إدخال اسم الموديل واختيار صورة');
            return;
        }

        try {
            addBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الرفع...';
            addBtn.disabled = true;

            const fileName = Date.now() + "_" + imgFile.name;
            const storageRef = storage.ref('products/' + fileName);
            const uploadTask = await storageRef.put(imgFile);
            const downloadURL = await uploadTask.ref.getDownloadURL();

            await db.collection('products').add({
                name,
                specs,
                category,
                img: downloadURL,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            alert('تم إضافة الموديل بنجاح');
            document.getElementById('model-name').value = '';
            document.getElementById('model-specs').value = '';
            document.getElementById('model-image').value = '';
            addBtn.innerHTML = 'إضافة الموديل';
            addBtn.disabled = false;

            renderDynamicProducts();
            closeAdminModals();
        } catch (error) {
            console.error("Error adding product:", error);
            alert('حدث خطأ أثناء الإضافة');
            addBtn.innerHTML = 'إضافة الموديل';
            addBtn.disabled = false;
        }
    };

    window.deleteProduct = async (id) => {
        if (confirm('هل أنت متأكد من حذف هذا الموديل؟')) {
            try {
                await db.collection('products').doc(id).delete();
                renderDynamicProducts();
            } catch (error) {
                console.error("Error deleting product:", error);
                alert('حدث خطأ أثناء الحذف');
            }
        }
    };

    // Initial Render
    renderDynamicProducts();

    // WhatsApp Ordering Function
    window.orderWhatsApp = (name, imgSrc) => {
        const phone = "201220189879";

        // If it's a data URL (Base64), we can't send the full URL but we can mention it
        let message = "";
        if (imgSrc.startsWith('data:')) {
            message = `مرحباً الشياكة، أود الاستفسار عن الموديل: ${name}\n(صورة مرفقة لدى العميل)`;
        } else {
            const safeImgSrc = encodeURI(imgSrc);
            let fullImgUrl = "";
            if (window.location.protocol === 'file:') {
                fullImgUrl = "(رابط الصورة متاح عند رفع الموقع على الإنترنت)";
            } else {
                const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '').replace(/\/$/, '');
                fullImgUrl = baseUrl + '/' + safeImgSrc;
            }
            message = `مرحباً الشياكة، أود الاستفسار عن: ${name}\n${fullImgUrl}`;
        }

        const encodedMsg = encodeURIComponent(message);
        window.open(`https://wa.me/${phone}?text=${encodedMsg}`, '_blank');
    };
});
