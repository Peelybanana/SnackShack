const items = [
  {id:'parfait', name:'Fresh Berry Parfait', desc:'Vanilla yogurt, granola + fresh berries.', price:4.5, image:'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=85', alt:'Berry parfait with yogurt and granola'},
  {id:'pretzel', name:'Classic Soft Pretzel', desc:'Warm, salted, and served with dip.', price:3.5, image:'https://ind-zin.com/wp-content/uploads/2023/03/1102_0002-2048x1365.jpg', fallback:'https://speedy.uenicdn.com/ac3f00a4-5d89-40d2-8455-4ee94da433f6/c1500_a/image/upload/v1727357599/business/8c45b1c6b0da44f3805ae795d71a1668.jpg', alt:'Golden soft pretzel on a blue plate'},
  {id:'cookie', name:'Chocolate Chip Cookie', desc:'Soft-baked with extra chocolate chunks.', price:2, image:'https://cdn12.picryl.com/photo/2016/12/31/chocolate-chip-cookie-chocolate-cookie-food-drink-6034d7-1024.jpg', alt:'Single chocolate chip cookie on a white background'},
  {id:'fruit', name:'Watermelon Snack Cup', desc:'A colorful cup of seasonal fruit.', price:3, image:'https://images.unsplash.com/photo-1692024427699-394c2e19d101?auto=format&fit=crop&w=800&q=85', alt:'Watermelon pieces in a snack cup'},
  {id:'sandwich', name:'Turkey & Cheddar Sandwich', desc:'Turkey, cheddar, lettuce on toasted sourdough.', price:6, image:'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=85', alt:'Turkey and cheese sandwich'},
  {id:'trailmix', name:'Classic Trail Mix', desc:'Crunchy, chewy, sweet, and just a little salty.', price:3.5, image:'https://jaybeesnuts.com/cdn/shop/articles/bigmix2.jpg?v=1656360586', alt:'Trail mix with nuts and dried fruit'}
];
let cart = JSON.parse(localStorage.getItem('snack-shack-cart') || '{}');
const money = value => `$${value.toFixed(2)}`;
const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[character]));
const menuGrid = document.querySelector('#menu-grid');
const cartPanel = document.querySelector('#cart-panel');
const overlay = document.querySelector('#overlay');

function renderMenu() {
  menuGrid.innerHTML = items.map(item => `<article class="menu-card">
    <div class="food-image"><img src="${item.image}" data-fallback="${item.fallback || ''}" alt="${item.alt}" loading="lazy"></div>
    <div class="menu-card-body"><h3>${item.name}</h3><p>${item.desc}</p><div class="item-meta"><span class="price">${money(item.price)}</span><div class="menu-actions"><div class="quantity-control" aria-label="Quantity for ${item.name}"><button type="button" class="quantity-step" data-menu-minus="${item.id}" aria-label="Subtract one ${item.name}">−</button><input class="quantity-input" data-menu-qty="${item.id}" type="number" min="1" step="1" value="1" aria-label="Quantity of ${item.name}"><button type="button" class="quantity-step" data-menu-plus="${item.id}" aria-label="Add one ${item.name}">+</button></div><button type="button" class="add-button" data-add="${item.id}" aria-label="Add selected quantity of ${item.name} to cart">Add</button></div></div></div>
  </article>`).join('');
  document.querySelectorAll('.food-image img').forEach(image => image.addEventListener('error', handleImageError));
  document.querySelectorAll('[data-menu-minus]').forEach(button => button.addEventListener('click', () => updateMenuQuantity(button.dataset.menuMinus, -1)));
  document.querySelectorAll('[data-menu-plus]').forEach(button => button.addEventListener('click', () => updateMenuQuantity(button.dataset.menuPlus, 1)));
  document.querySelectorAll('[data-menu-qty]').forEach(input => input.addEventListener('change', () => clampMenuQuantity(input)));
  document.querySelectorAll('[data-add]').forEach(button => button.addEventListener('click', () => {
    const input = document.querySelector(`[data-menu-qty="${button.dataset.add}"]`);
    addToCart(button.dataset.add, clampMenuQuantity(input));
  }));
}
function handleImageError(event) {
  const image = event.currentTarget;
  if (image.dataset.fallback) { image.src = image.dataset.fallback; image.removeAttribute('data-fallback'); return; }
  image.style.display = 'none';
}
function totalItems() { return Object.values(cart).reduce((sum, qty) => sum + qty, 0); }
function cartTotal() { return items.reduce((sum, item) => sum + (cart[item.id] || 0) * item.price, 0); }
function saveCart() { localStorage.setItem('snack-shack-cart', JSON.stringify(cart)); renderCart(); }
function clampMenuQuantity(input) {
  const quantity = Math.max(1, Math.floor(Number(input.value) || 1));
  input.value = quantity;
  return quantity;
}
function updateMenuQuantity(id, amount) {
  const input = document.querySelector(`[data-menu-qty="${id}"]`);
  input.value = Math.max(1, Math.floor(Number(input.value) || 1) + amount);
}
function addToCart(id, quantity = 1) { cart[id] = (cart[id] || 0) + quantity; saveCart(); openCart(); }
function changeQuantity(id, amount) { cart[id] = (cart[id] || 0) + amount; if (cart[id] <= 0) delete cart[id]; saveCart(); }
function clearItem(id) { delete cart[id]; saveCart(); }
function renderCart() {
  document.querySelector('#cart-count').textContent = totalItems();
  const content = document.querySelector('#cart-content');
  const footer = document.querySelector('#cart-footer');
  const selected = items.filter(item => cart[item.id]);
  if (!selected.length) { content.innerHTML = '<p class="empty-cart">Your cart is empty for now.<br>Add something delicious from the menu!</p>'; footer.innerHTML = ''; return; }
  content.innerHTML = selected.map(item => `<div class="cart-item"><div class="cart-thumb"><img src="${item.image}" data-fallback="${item.fallback || ''}" alt="" loading="lazy"></div><div><h3>${item.name}</h3><small>${money(item.price)} each</small><div class="quantity-controls"><button type="button" data-minus="${item.id}" aria-label="Remove one ${item.name}">−</button><span>${cart[item.id]}</span><button type="button" data-plus="${item.id}" aria-label="Add one ${item.name}">+</button></div></div><div class="cart-item-side"><span class="item-total">${money(item.price * cart[item.id])}</span><button type="button" class="clear-item" data-clear="${item.id}">Clear</button></div></div>`).join('');
  document.querySelectorAll('.cart-thumb img').forEach(image => image.addEventListener('error', handleImageError));
  footer.innerHTML = `<div class="total-row"><span>Total</span><strong>${money(cartTotal())}</strong></div><button class="checkout-button" id="checkout-button" type="button">Continue to checkout</button>`;
  document.querySelectorAll('[data-minus]').forEach(button => button.addEventListener('click', () => changeQuantity(button.dataset.minus, -1)));
  document.querySelectorAll('[data-plus]').forEach(button => button.addEventListener('click', () => changeQuantity(button.dataset.plus, 1)));
  document.querySelectorAll('[data-clear]').forEach(button => button.addEventListener('click', () => clearItem(button.dataset.clear)));
  document.querySelector('#checkout-button').addEventListener('click', openCheckout);
}
function openCart() { cartPanel.classList.add('open'); cartPanel.setAttribute('aria-hidden','false'); overlay.hidden = false; document.body.classList.add('lock'); }
function closeCart() { cartPanel.classList.remove('open'); cartPanel.setAttribute('aria-hidden','true'); overlay.hidden = true; document.body.classList.remove('lock'); }
function openCheckout() {
  closeCart();
  const dialog = document.querySelector('#checkout-dialog');
  document.querySelector('#checkout-content').innerHTML = `<p class="eyebrow"><span></span> One last thing</p><h2>Save your snacks.</h2><p class="dialog-lede">We'll have your order ready at the Commons Courtyard during lunch.</p><form class="checkout-form" id="checkout-form"><label>Your name<input name="name" autocomplete="name" required placeholder="e.g. Alex Kim"></label><label>Homeroom<input name="homeroom" required placeholder="e.g. 204"></label><button class="button button-primary" type="submit">Place pre-order · ${money(cartTotal())}</button></form>`;
  dialog.showModal();
  document.querySelector('#checkout-form').addEventListener('submit', finishOrder);
}
function finishOrder(event) {
  event.preventDefault();
  const data = new FormData(event.target); const name = data.get('name'); const homeroom = data.get('homeroom');
  document.querySelector('#checkout-content').innerHTML = `<p class="eyebrow"><span></span> You're all set</p><h2>See you at lunch, ${escapeHTML(String(name).split(' ')[0])}!</h2><div class="order-success"><h3>Order confirmed ✓</h3><p>Pick up your snacks at the <b>Commons Courtyard</b> by the library entrance, between <b>11:35 AM – 12:05 PM</b>.</p></div><p class="order-summary"><b>Homeroom:</b> ${escapeHTML(homeroom)}<br><b>Total:</b> ${money(cartTotal())}<br>To receive your order, say your name and homeroom to the Snack Shack crew when you arrive.</p><button class="button button-primary" id="done-button" type="button">Done</button>`;
  cart = {}; saveCart(); document.querySelector('#done-button').addEventListener('click', () => document.querySelector('#checkout-dialog').close());
}
document.querySelector('#cart-button').addEventListener('click', openCart);
document.querySelector('#close-cart').addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);
document.querySelector('#close-checkout').addEventListener('click', () => document.querySelector('#checkout-dialog').close());
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeCart(); });
renderMenu(); renderCart();
