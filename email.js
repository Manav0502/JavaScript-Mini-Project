(function () {
    emailjs.init("YOUR_PUBLIC_KEY"); 
})();

const services = [
    { id: 1, name: 'Dry Cleaning', price: 200.00, icon: 'fa-shirt' },
    { id: 2, name: 'Wash & Fold', price: 100.00, icon: 'fa-basket-shopping' },
    { id: 3, name: 'Ironing', price: 30.00, icon: 'fa-temperature-high' },
    { id: 4, name: 'Stain Removal', price: 500.00, icon: 'fa-wand-magic-sparkles' },
    { id: 5, name: 'Leather & Suede Cleaning', price: 999.00, icon: 'fa-vest' },
    { id: 6, name: 'Wedding Dress Cleaning', price: 2800.00, icon: 'fa-person-dress' }
];

let cart = [];

const servicesListEl = document.getElementById('servicesList');
const cartItemsBody = document.getElementById('cartItemsBody');
const emptyCartMsg = document.getElementById('emptyCartMsg');
const totalAmountDisplay = document.getElementById('totalAmountDisplay');
const bookingForm = document.getElementById('bookingForm');
const confirmationMsg = document.getElementById('confirmationMsg');
const heroBookBtn = document.getElementById('heroBookBtn');
const newsletterForm = document.getElementById('newsletterForm');

function renderServices() {
    servicesListEl.innerHTML = '';
    
    services.forEach(service => {
        const isInCart = cart.some(item => item.id === service.id);
        
        const serviceDiv = document.createElement('div');
        serviceDiv.className = 'service-item';
        serviceDiv.innerHTML = `
            <div class="service-info">
                <i class="fa-solid ${service.icon}"></i>
                <span class="service-name">${service.name}</span>
                <span class="service-price">• ₹${service.price.toFixed(2)}</span>
            </div>
            ${
                isInCart 
                ? `<button class="btn-service-action remove" onclick="toggleCartItem(${service.id})">
                     Remove Item <i class="fa-solid fa-circle-minus"></i>
                   </button>`
                : `<button class="btn-service-action add" onclick="toggleCartItem(${service.id})">
                     Add Item <i class="fa-solid fa-circle-plus"></i>
                   </button>`
            }
        `;
        servicesListEl.appendChild(serviceDiv);
    });
}

function toggleCartItem(serviceId) {
    const existingIndex = cart.findIndex(item => item.id === serviceId);
    
    if (existingIndex > -1) {
        cart.splice(existingIndex, 1);
    } else {
        const serviceToAdd = services.find(s => s.id === serviceId);
        cart.push(serviceToAdd);
    }
    
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
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>₹${item.price.toFixed(2)}</td>
            `;
            cartItemsBody.appendChild(tr);
        });
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    totalAmountDisplay.innerText = `₹${total.toFixed(2)}`;
}

heroBookBtn.addEventListener('click', () => {
    document.getElementById('booking-section').scrollIntoView({
        behavior: 'smooth'
    });
});

bookingForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    if (cart.length === 0) {
        alert('Please add at least one service to your cart before booking.');
        return;
    }

    const bookNowBtn = document.getElementById('bookNowBtn');
    bookNowBtn.innerText = 'Sending...';
    bookNowBtn.disabled = true;

    const templateParams = {
        from_name: fullName,
        from_email: email,
        phone_number: phone,
        total_amount: totalAmountDisplay.innerText,
        services_booked: cart.map(item => item.name).join(', ')
    };

    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
        .then(() => {
            handleBookingSuccess();
        })
        .catch((error) => {
            console.warn('EmailJS sending failed or key unconfigured. Displaying confirmation fallback.', error);
            handleBookingSuccess();
        });
});

function handleBookingSuccess() {
    const bookNowBtn = document.getElementById('bookNowBtn');
    bookNowBtn.innerText = 'Book now';
    bookNowBtn.disabled = false;
    
    confirmationMsg.style.display = 'block';
    
    bookingForm.reset();
    cart = [];
    updateCartUI();
    renderServices();
}

newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for subscribing to our newsletter!');
    newsletterForm.reset();
});

document.addEventListener('DOMContentLoaded', () => {
    renderServices();
    updateCartUI();
});