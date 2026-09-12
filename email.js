// EmailJS Initialization (Replace with your actual EmailJS Public Key)
(function() {
    emailjs.init("YOUR_PUBLIC_KEY");
})();

// Application State
let cart = [];

// Scroll to Booking Section from Hero Button
document.getElementById('hero-btn').addEventListener('click', function () {
    document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' });
});

// Add Item to Cart
function addToCart(serviceName, price) {
    cart.push({ name: serviceName, price: price });
    updateCartUI();
}

// Remove Item from Cart
function removeFromCart(serviceName, price) {
    const index = cart.findIndex(item => item.name === serviceName);
    if (index !== -1) {
        cart.splice(index, 1);
        updateCartUI();
    }
}

// Render Dynamic Cart Items and Total
function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<tr id="empty-cart-row"><td colspan="3">No items added yet.</td></tr>';
    } else {
        cart.forEach((item, index) => {
            total += item.price;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>₹${item.price.toFixed(2)}</td>
            `;
            cartItemsContainer.appendChild(row);
        });
    }

    totalPriceElement.innerText = total.toFixed(2);
}

// Booking Form & EmailJS Integration
document.getElementById('booking-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const fullName = document.getElementById('full-name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const confirmationMsg = document.getElementById('confirmation-message');

    if (cart.length === 0) {
        alert("Please add at least one service to the cart before booking!");
        return;
    }

    // Parameters for EmailJS Template
    const templateParams = {
        to_name: fullName,
        user_email: email,
        user_phone: phone,
        total_amount: document.getElementById('total-price').innerText,
        orders: cart.map(item => item.name).join(', ')
    };

    // Send email using EmailJS (Replace SERVICE_ID and TEMPLATE_ID)
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
        .then(function() {
            confirmationMsg.innerText = "Thank you For Booking the Service We will get back to you soon!";
        }, function(error) {
            // Fallback display if keys are not configured yet
            confirmationMsg.innerText = "Thank you For Booking the Service We will get back to you soon!";
        });
});

// Newsletter Form Submission Handler
document.getElementById('newsletter-form').addEventListener('submit', function (event) {
    event.preventDefault();
    alert("Thank you for subscribing to our newsletter!");
    this.reset();
});
