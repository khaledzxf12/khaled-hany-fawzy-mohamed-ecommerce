function drawCart() {
    const list = document.getElementById('cart-items-list');
    const layout = document.getElementById('cart-wrapper');
    const emptyMsg = document.getElementById('empty-notice');
    
    if (!list) return;

    const items = getDetailedBasket();

    if (items.length === 0) {
        layout.classList.add('hidden');
        emptyMsg.classList.remove('hidden');
        return;
    }

    layout.classList.remove('hidden');
    emptyMsg.classList.add('hidden');

    list.innerHTML = items.map(item => `
        <div class="cart-row" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}">
            <div class="info">
                <h4>${item.name}</h4>
                <p>${currency(item.price)} each</p>
            </div>
            <div class="stepper">
                <button class="step-btn dec" data-id="${item.id}">-</button>
                <span>${item.count}</span>
                <button class="step-btn inc" data-id="${item.id}">+</button>
            </div>
            <div class="subtotal">${currency(item.lineTotal)}</div>
            <button class="del-btn" data-id="${item.id}">&times;</button>
        </div>
    `).join('');

    const total = computeOrderTotal(items);
    document.getElementById('subtotal-val').textContent = currency(total);
    document.getElementById('total-val').textContent = currency(total);
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!document.getElementById('cart-items-list')) return;

    await fetchProducts();
    drawCart();

    const list = document.getElementById('cart-items-list');
    
    list.addEventListener('click', (e) => {
        const id = Number(e.target.dataset.id);
        if (!id) return;

        if (e.target.classList.contains('dec')) {
            const current = readBasket().find(i => i.id === id);
            if (current) {
                updateItemCount(id, current.count - 1);
                drawCart();
            }
        }

        if (e.target.classList.contains('inc')) {
            const current = readBasket().find(i => i.id === id);
            if (current) {
                updateItemCount(id, current.count + 1);
                drawCart();
            }
        }

        if (e.target.classList.contains('del-btn')) {
            removeItem(id);
            drawCart();
        }
    });

    const proceedBtn = document.getElementById('proceed-btn');
    if (proceedBtn) {
        proceedBtn.addEventListener('click', () => {
            window.location.href = 'checkout.html';
        });
    }
});