async function markDelivered(orderId) {
  const sanitizedOrderId = orderId.replace(/[\s:]/g, '_');
  const codeInput = document.getElementById(`code-${sanitizedOrderId}`);
  const code = codeInput ? codeInput.value.trim() : '';

  if (!codeInput) {
      alert('Verification code input not found');
      return;
  }

  if (!code) {
      alert('Please enter a verification code');
      return;
  }

  const formData = new FormData();
  formData.append('order_id', orderId);
  formData.append('code', code);

  try {
      const response = await fetch('/mark_delivered', {
          method: 'POST',
          body: formData
      });
      const result = await response.json();

      if (result.success) {
          alert('Order marked as delivered!');
          location.reload();
      } else {
          alert(`Error: ${result.error || 'Failed to mark as delivered'}`);
      }
  } catch (e) {
      console.error('Error marking delivered:', e);
      alert('Network error');
  }
}

// Handle worker addition form
const addWorkerForm = document.getElementById('add-worker-form');
if (addWorkerForm) {
  addWorkerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);

      try {
          const response = await fetch('/add_worker', {
              method: 'POST',
              body: formData
          });
          const result = await response.json();

          const errorP = document.getElementById('worker-error');
          if (result.success) {
              errorP.style.display = 'none';
              alert('Worker added successfully!');
              e.target.reset();
          } else {
              errorP.textContent = result.error || 'Failed to add worker';
              errorP.style.display = 'block';
          }
      } catch (e) {
          console.error('Error adding worker:', e);
          document.getElementById('worker-error').textContent = 'Network error';
          document.getElementById('worker-error').style.display = 'block';
      }
  });
}

// Fetch and render orders
async function loadOrders() {
  try {
      const response = await fetch('/get_orders');
      const result = await response.json();

      if (!result.success) {
          console.error('Error fetching orders:', result.error);
          document.getElementById('pending-orders').innerHTML = '<p>Error loading orders</p>';
          document.getElementById('delivered-orders').innerHTML = '<p>Error loading orders</p>';
          return;
      }

      const pendingOrders = result.pending_orders || [];
      const deliveredOrders = result.delivered_orders || [];
      const pendingContainer = document.getElementById('pending-orders');
      pendingContainer.innerHTML = '';

      // Render pending orders
      if (pendingOrders.length === 0) {
          pendingContainer.innerHTML = '<p>No pending orders available.</p>';
      } else {
          pendingOrders.forEach(order => {
              const items = JSON.parse(order.items || '[]');
              const itemsDisplay = items.map(item => `${item.name}: ${Number(item.price).toFixed(2)}`).join(', ')+' bir' || 'No items';
              const isWorkerDashboard = document.querySelector('#worker-dashboard') !== null;
              const sanitizedOrderId = order.timestamp.replace(/[\s:]/g, '_');

              pendingContainer.innerHTML += `
                  <div class="order" data-items='${JSON.stringify(items)}'>
                      <p><strong>Order Time:</strong> ${order.timestamp}</p>
                      <p><strong>Customer:</strong> ${order.customer_name}</p>
                      <p><strong>Address:</strong> ${order.address}</p>
                      <p><strong>Contact:</strong> ${order.contact}</p>
                      <p><strong>Items:</strong> <span class="items-display">${itemsDisplay}</span></p>
                      <p><strong>Verification Code:</strong> ${order.verification_code}</p>
                      ${isWorkerDashboard ? `
                          <input type="text" id="code-${sanitizedOrderId}" placeholder="Enter verification code" required>
                          <button class="mark-delivered" data-order-id="${order.timestamp}">Mark as Delivered</button>
                      ` : ''}
                  </div>`;
          });
      }

      // Attach event listener for mark-delivered buttons
      pendingContainer.addEventListener('click', (e) => {
          if (e.target.classList.contains('mark-delivered')) {
              const orderId = e.target.dataset.orderId;
              markDelivered(orderId);
          }
      });

      // Render delivered orders
      const deliveredContainer = document.getElementById('delivered-orders');
      if (deliveredContainer) {
          deliveredContainer.innerHTML = '';
          if (deliveredOrders.length === 0) {
              deliveredContainer.innerHTML = '<p>No delivered orders available.</p>';
          } else {
              deliveredOrders.forEach(order => {
                  const items = JSON.parse(order.items || '[]');
                  const itemsDisplay = items.map(item => `${item.name}: ${Number(item.price).toFixed(2)}`).join(', ') || 'No items';

                  deliveredContainer.innerHTML += `
                      <div class="order" data-items='${JSON.stringify(items)}'>
                          <p><strong>Order Time:</strong> ${order.timestamp}</p>
                          <p><strong>Customer:</strong> ${order.customer_name}</p>
                          <p><strong>Address:</strong> ${order.address}</p>
                          <p><strong>Contact:</strong> ${order.contact}</p>
                          <p><strong>Items:</strong> <span class="items-display">${itemsDisplay}</span></p>
                          <p><strong>Delivered By:</strong> ${order.worker}</p>
                          <p><strong>Delivery Time:</strong> ${order.delivery_timestamp}</p>
                          <p><strong>Verification Code:</strong> ${order.verification_code}</p>
                      </div>`;
              });
          }
      }
  } catch (e) {
      console.error('Error loading orders:', e);
      document.getElementById('pending-orders').innerHTML = '<p>Error loading orders</p>';
      if (document.getElementById('delivered-orders')) {
          document.getElementById('delivered-orders').innerHTML = '<p>Error loading orders</p>';
      }
  }
}

// Load orders on page load
document.addEventListener('DOMContentLoaded', loadOrders);