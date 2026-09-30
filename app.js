const STORAGE_KEY = 'sd_user_basket';

const IMAGE_PLACEHOLDERS = {
    101: "img/1.jpg",
    102: "img/2.png",
    103: "img/3.jpg",
    104: "img/4.jpg",
    105: "img/5.jpg",
    106: "img/6.jpg"
};

const DEFAULT_IMAGE = "images/placeholder.jpg";

let cachedProducts = null;

function readBasket() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed.filter(i => i && i.id && i.count > 0) : [];
    } catch (e) {
        return [];
    }
}

function writeBasket(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    refreshBadge();
}

function addItem(id, amount = 1) {
    const basket = readBasket();
    const match = basket.find(entry => entry.id === Number(id));
    
    if (match) {
        match.count += amount;
    } else {
        basket.push({ id: Number(id), count: amount });
    }
    
    writeBasket(basket);
}

function updateItemCount(id, count) {
    let basket = readBasket();
    if (count <= 0) {
        basket = basket.filter(entry => entry.id !== Number(id));
    } else {
        const match = basket.find(entry => entry.id === Number(id));
        if (match) match.count = count;
    }
    writeBasket(basket);
}

function removeItem(id) {
    const filtered = readBasket().filter(entry => entry.id !== Number(id));
    writeBasket(filtered);
}

function purgeBasket() {
    writeBasket([]);
}

function getBasketTotalCount() {
    return readBasket().reduce((sum, item) => sum + item.count, 0);
}

async function fetchProducts() {
    if (cachedProducts) return cachedProducts;
    try {
        const response = await fetch('data/items.json');
        const data = await response.json();
        cachedProducts = data.products.map(p => ({
            ...p,
            image: IMAGE_PLACEHOLDERS[p.id] || DEFAULT_IMAGE
        }));
        return cachedProducts;
    } catch (err) {
        return [];
    }
}

function findProduct(id) {
    if (!cachedProducts) return null;
    return cachedProducts.find(p => p.id === Number(id)) || null;
}

function getDetailedBasket() {
    return readBasket().map(item => {
        const info = findProduct(item.id);
        if (!info) return null;
        return {
            ...info,
            count: item.count,
            lineTotal: info.price * item.count
        };
    }).filter(Boolean);
}

function computeOrderTotal(details) {
    return details.reduce((acc, current) => acc + current.lineTotal, 0);
}

function currency(val) {
    return '$' + Number(val).toFixed(2);
}

function refreshBadge() {
    const badges = document.querySelectorAll('.basket-badge');
    const total = getBasketTotalCount();
    badges.forEach(b => b.textContent = total);
}

function notify(msg) {
    const alertBox = document.getElementById('toast-alert');
    if (!alertBox) return;
    alertBox.textContent = msg;
    alertBox.classList.add('visible');
    setTimeout(() => {
        alertBox.classList.remove('visible');
    }, 2500);
}

document.addEventListener('DOMContentLoaded', () => {
    refreshBadge();
    
    const menuToggle = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-links');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
});