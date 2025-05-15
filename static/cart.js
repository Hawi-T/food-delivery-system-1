// static/cart.js
// Initialize cart array
let cart = [];

// Function to update cart display
function updateCartDisplay() {
  const cartContainer = document.getElementById('cart');
  cartContainer.innerHTML = '';

  if (cart.length === 0) {
    cartContainer.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }

  const cartList = document.createElement('ul');
  cart.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${item.name} - ${Number(item.price).toFixed(2)+' bir'}
      <button class="remove-from-cart" data-index="${index}">Remove</button>
    `;
    cartList.appendChild(li);
  });

  const total = cart.reduce((sum, item) => sum + Number(item.price), 0);
  cartContainer.appendChild(cartList);
  cartContainer.innerHTML += `<p><strong>Total:</strong> ${total.toFixed(2)} bir</p>`
}

// Function to add item to cart
function addToCart(name, price) {
  cart.push({ name, price });
  updateCartDisplay();
}

// Function to remove item from cart
function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartDisplay();
}

// Attach event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Add to cart buttons
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
      const name = button.dataset.name;
      const price = parseFloat(button.dataset.price);
      if (name && !isNaN(price)) {
        addToCart(name, price);
      } else {
        console.error('Invalid item data:', { name, price });
        alert('Error adding item to cart');
      }
    });
  });

  // Remove from cart buttons
  document.getElementById('cart').addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-from-cart')) {
      const index = parseInt(e.target.dataset.index);
      if (!isNaN(index)) {
        removeFromCart(index);
      }
    }
  });

  // Order form submission
  const orderForm = document.getElementById('order-form');
  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    const formData = new FormData(orderForm);
    formData.append('items', JSON.stringify(cart));

    try {
      const response = await fetch('/place_order', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();

      if (result.success) {
        alert(`Order placed successfully! Verification code: ${result.verification_code}`);
        cart = [];
        updateCartDisplay();
        orderForm.reset();
      } else {
        alert(`Error: ${result.error || 'Failed to place order'}`);
      }
    } catch (e) {
      console.error('Error placing order:', e);
      alert('Network error');
    }
  });
});