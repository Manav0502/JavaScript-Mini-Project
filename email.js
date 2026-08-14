const services = [
    { id: 1, name: 'Dry Cleaning', price: 200.00, icon: 'fa-shirt' },
    { id: 2, name: 'Wash & Fold', price: 100.00, icon: 'fa-basket-shopping' },
    { id: 3, name: 'Ironing', price: 30.00, icon: 'fa-temperature-high' },
    { id: 4, name: 'Stain Removal', price: 500.00, icon: 'fa-wand-magic-sparkles' },
    { id: 5, name: 'Leather & Suede Cleaning', price: 999.00, icon: 'fa-vest' },
    { id: 6, name: 'Wedding Dress Cleaning', price: 2800.00, icon: 'fa-person-dress' }
];

const CART_STORAGE_KEY = 'velvetclean-cart';
const emailConfig = {
    publicKey: '',
    serviceId: '',
    templateId: ''
};

const servicesListEl = document.getElementById('servicesList');
const cartItemsBody = document.getElementById('cartItemsBody');
const emptyCartMsg = document.getElementById('emptyCartMsg');
const totalAmountDisplay = document.getElementById('totalAmountDisplay');
const bookingForm = document.getElementById('bookingForm');
const confirmationMsg = document.getElementById('confirmationMsg');
const heroBookBtn = document.getElementById('heroBookBtn');
const newsletterForm = document.getElementById('newsletterForm');

let cart = getCartFromStorage();

function getCartFromStorage() {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
        console.warn('Cart could not be loaded from localStorage.', error);
        return [];
    }
}

function saveCartToStorage() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function formatCurrency(value) {
    return `₹${Number(value).toFixed(2)}`;
}

function renderServices() {
    servicesListEl.innerHTML = '';

    services.forEach((service) => {
        const isInCart = cart.some(item => item.id === service.id);
        const serviceDiv = document.createElement('div');
        serviceDiv.className = 'service-item';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = `btn-service-action ${isInCart ? 'remove' : 'add'}`;
        button.dataset.id = String(service.id);
        button.innerHTML = `
            ${isInCart ? 'Remove Item' : 'Add Item'}
            <i class="fa-solid ${isInCart ? 'fa-circle-minus' : 'fa-circle-plus'}"></i>
        `;

        const info = document.createElement('div');
        info.className = 'service-info';
        info.innerHTML = `
            <i class="fa-solid ${service.icon}"></i>
            <span class="service-name">${service.name}</span>
            <span class="service-price">• ${formatCurrency(service.price)}</span>
        `;

        serviceDiv.appendChild(info);
        serviceDiv.appendChild(button);
        servicesListEl.appendChild(serviceDiv);
    });
}

function toggleCartItem(serviceId) {
    const service = services.find(item => item.id === serviceId);
    if (!service) return;

    const index = cart.findIndex(item => item.id === serviceId);

    if (index >= 0) {
        cart.splice(index, 1);
    } else {
        cart.push({ ...service });
    }

    saveCartToStorage();
    updateCartUI();
    renderServices();
}

function updateCartUI() {
    cartItemsBody.innerHTML = '';

    if (cart.length === 0) {
        emptyCartMsg.style.display = 'block';
    } else {
        emptyCartMsg.style.display = 'none';

        cart.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${formatCurrency(item.price)}</td>
            `;
            cartItemsBody.appendChild(row);
        });
    }

    const total = cart.reduce((sum, item) => sum + Number(item.price), 0);
    totalAmountDisplay.textContent = formatCurrency(total);
}

function showConfirmationMessage(text, type = 'success') {
    confirmationMsg.textContent = text;
    confirmationMsg.classList.remove('success', 'error');
    confirmationMsg.classList.add(type);
    confirmationMsg.style.display = 'block';
}

function validateBookingForm() {
    const name = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (name.length < 2) {
        return 'Please enter your full name.';
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return 'Please enter a valid email address.';
    }

    const phonePattern = /^[6-9]\d{9}$/;
    if (!phonePattern.test(phone.replace(/\D/g, ''))) {
        return 'Please enter a valid 10-digit phone number.';
    }

    if (cart.length === 0) {
        return 'Please add at least one service before booking.';
    }

    return '';
}

async function sendBookingEmail(formData) {
    const hasEmailSetup = emailConfig.publicKey && emailConfig.serviceId && emailConfig.templateId;

    if (!hasEmailSetup) {
        console.info('EmailJS is not configured. Showing local confirmation only.');
        return true;
    }

    if (!window.emailjs || typeof window.emailjs.send !== 'function') {
        console.warn('EmailJS library is unavailable. Falling back to local confirmation.');
        return true;
    }

    try {
        await window.emailjs.send(emailConfig.serviceId, emailConfig.templateId, formData);
        return true;
    } catch (error) {
        console.warn('EmailJS send failed. Booking still accepted locally.', error);
        return true;
    }
}

function resetBookingState() {
    bookingForm.reset();
    cart = [];
    saveCartToStorage();
    updateCartUI();
    renderServices();
}

servicesListEl.addEventListener('click', (event) => {
    const button = event.target.closest('.btn-service-action');
    if (!button) return;

    const serviceId = Number(button.dataset.id);
    toggleCartItem(serviceId);
});

heroBookBtn.addEventListener('click', () => {
    document.getElementById('booking-section').scrollIntoView({
        behavior: 'smooth'
    });
});

bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const validationMessage = validateBookingForm();
    if (validationMessage) {
        showConfirmationMessage(validationMessage, 'error');
        return;
    }

    const bookNowBtn = document.getElementById('bookNowBtn');
    const formData = {
        from_name: document.getElementById('fullName').value.trim(),
        from_email: document.getElementById('email').value.trim(),
        phone_number: document.getElementById('phone').value.trim(),
        total_amount: totalAmountDisplay.textContent,
        services_booked: cart.map(item => item.name).join(', ')
    };

    bookNowBtn.disabled = true;
    bookNowBtn.textContent = 'Sending...';

    const result = await sendBookingEmail(formData);

    if (result) {
        showConfirmationMessage('Thank you! Your booking request has been received. We will contact you soon.', 'success');
        resetBookingState();
    }

    bookNowBtn.disabled = false;
    bookNowBtn.textContent = 'Book now';
});

newsletterForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = newsletterForm.querySelector('input[type="email"]').value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        alert('Please enter a valid email address to subscribe.');
        return;
    }

    alert('Thank you for subscribing to our newsletter!');
    newsletterForm.reset();
});

document.addEventListener('DOMContentLoaded', () => {
    renderServices();
    updateCartUI();
});
