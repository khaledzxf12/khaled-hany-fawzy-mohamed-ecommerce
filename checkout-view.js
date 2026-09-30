const checks = {
    fullName(val) {
        const clean = val.trim();
        if (clean.length === 0) return 'Please enter your name.';
        if (clean.length < 3) return 'Name is too short.';
        return '';
    },
    email(val) {
        const clean = val.trim();
        if (clean.length === 0) return 'Email is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return 'Invalid email format.';
        return '';
    },
    phone(val) {
        const clean = val.trim();
        if (clean.length === 0) return 'Phone number is required.';
        if (!/^\+?\d{9,15}$/.test(clean)) return 'Enter a valid phone number.';
        return '';
    },
    address(val) {
        const clean = val.trim();
        if (clean.length === 0) return 'Address cannot be empty.';
        if (clean.length < 6) return 'Provide a full address.';
        return '';
    }
};

function validateInput(inputEl) {
    const fn = checks[inputEl.name];
    if (!fn) return true;

    const errorMsg = fn(inputEl.value);
    const errSpan = document.getElementById(`err-${inputEl.name}`);

    if (errorMsg) {
        inputEl.classList.add('invalid');
        if (errSpan) errSpan.textContent = errorMsg;
        return false;
    }

    inputEl.classList.remove('invalid');
    if (errSpan) errSpan.textContent = '';
    return true;
}

function renderCheckoutSummary() {
    const list = document.getElementById('summary-items-list');
    if (!list) return;

    const items = getDetailedBasket();
    if (items.length === 0) {
        window.location.href = 'index.html';
        return;
    }

    list.innerHTML = items.map(i => `
        <div class="mini-item">
            <span>${i.name} (x${i.count})</span>
            <span>${currency(i.lineTotal)}</span>
        </div>
    `).join('');

    const total = computeOrderTotal(items);
    document.getElementById('final-amount').textContent = currency(total);
}

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('order-form');
    if (!form) return;

    await fetchProducts();
    renderCheckoutSummary();

    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateInput(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('invalid')) validateInput(input);
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let isFormValid = true;
        inputs.forEach(input => {
            if (!validateInput(input)) isFormValid = false;
        });

        if (!isFormValid) return;

        const customer = form.fullName.value.trim();
        const refId = 'SD-' + Math.floor(100000 + Math.random() * 900000);

        document.getElementById('checkout-panel').classList.add('hidden');
        const confirmScreen = document.getElementById('confirmation-screen');
        
        document.getElementById('confirm-msg').textContent = `Thanks, ${customer}. Your order is being processed.`;
        document.getElementById('order-ref-id').textContent = `Reference ID: ${refId}`;
        
        confirmScreen.classList.remove('hidden');
        purgeBasket();
    });
});