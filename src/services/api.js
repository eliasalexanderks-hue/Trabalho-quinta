const API_URL = import.meta.env.VITE_API_URL || "https://dummyjson.com";
const CART_KEY = "show-de-bola-cart";
const ORDERS_KEY = "show-de-bola-orders";
const USERS_KEY = "show-de-bola-registered-users";
export const foodProducts = [
  { id: "lanche-1", title: "Xis Show de Bola", category: "Lanches", description: "Pão, hambúrguer, queijo, salada e molho especial.", price: 24.9, thumbnail: "/images/burger-portrait.jpg" },
  { id: "lanche-2", title: "Combo Gamer", category: "Lanches", description: "Xis bacon, batata frita e refrigerante.", price: 34.9, thumbnail: "/images/burger-fries.jpg" },
  { id: "lanche-3", title: "Batata Turbo", category: "Lanches", description: "Batata frita crocante com cheddar e bacon.", price: 18.9, thumbnail: "/images/burger-bite.jpg" },
  { id: "lanche-4", title: "Xis Bacon Crocante", category: "Lanches", description: "Hambúrguer artesanal, bacon crocante, queijo e molho da casa.", price: 29.9, thumbnail: "/images/hero-burger-mouse.jpg" },
  { id: "lanche-5", title: "Xis Frango Cremoso", category: "Lanches", description: "Frango grelhado, queijo, milho e maionese temperada.", price: 26.9, thumbnail: "/images/vitao-thumbs-up.jpg" },
  { id: "lanche-6", title: "Dog Duplo", category: "Lanches", description: "Dois salsichões, purê, queijo e batata palha.", price: 22.9, thumbnail: "/images/gamer-portrait.jpg" },
  { id: "lanche-7", title: "Smash da Casa", category: "Lanches", description: "Dois smash burgers, cheddar, cebola caramelizada e molho especial.", price: 32.9, thumbnail: "/images/burger-bite.jpg" },
  { id: "lanche-8", title: "Onion Rings", category: "Lanches", description: "Anéis de cebola empanados, crocantes e dourados.", price: 16.9, thumbnail: "/images/burger-fries.jpg" },
  { id: "lanche-9", title: "Milk-shake de Chocolate", category: "Lanches", description: "Milk-shake cremoso de chocolate com calda.", price: 14.9, thumbnail: "/images/milkshake.jpg" },
];
async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
  return response.json();
}

function notifyCartChanged() {
  window.dispatchEvent(new Event("cartchange"));
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  notifyCartChanged();
}

export function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

export function clearCart() {
  saveCart([]);
}

export async function getPeripherals() {
  const data = await request("/products/category/mobile-accessories");
  return data.products ?? [];
}

export function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  const next = existing
    ? cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
    : [...cart, { ...product, quantity: 1 }];
  saveCart(next);
}

export function setCartQuantity(productId, quantity) {
  const cart = getCart().map((item) => item.id === productId ? { ...item, quantity } : item);
  saveCart(cart.filter((item) => item.quantity > 0));
}

export function removeFromCart(productId) {
  saveCart(getCart().filter((item) => item.id !== productId));
}

export async function createMockOrder(cart, orderDetails) {
  return request("/carts/add", {
    method: "POST",
    body: JSON.stringify({ userId: 1, products: cart.map(({ id, quantity }) => ({ id, quantity })), paymentMethod: orderDetails.paymentMethod }),
  });
}

export async function updateMockOrder(cart, updates = {}) {
  return request("/carts/1", {
    method: "PUT",
    body: JSON.stringify({ userId: 1, products: cart.map(({ id, quantity }) => ({ id, quantity })), ...updates }),
  });
}

export async function deleteMockOrder() {
  return request("/carts/1", { method: "DELETE" });
}

export function getOrders() {
  try {
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    return Array.isArray(orders) ? orders : [];
  } catch {
    return [];
  }
}

export function saveOrder(cart, apiOrderId, details) {
  const items = cart.map((item) => ({ ...item }));
  const order = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    apiOrderId,
    createdAt: new Date().toISOString(),
    status: "pending",
    username: details.username,
    paymentMethod: details.paymentMethod,
    paymentStatus: details.paymentMethod === "card" ? "confirmed" : "pending",
    customer: { ...details.customer },
    notes: details.notes,
    items,
    total: items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
  };
  const orders = [order, ...getOrders()];
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event("orderschange"));
  return order;
}

export function updateSavedOrder(orderId, updates) {
  const orders = getOrders().map((order) => order.id === orderId
    ? { ...order, ...updates, updatedAt: new Date().toISOString() }
    : order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event("orderschange"));
}

export function getRegisteredUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

export function registerUser({ username, password, email }) {
  const users = getRegisteredUsers();
  if (username === "admin" || username === "teste" || users.some((user) => user.username === username)) {
    throw new Error("Esse nome de usuário já está em uso.");
  }
  if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("Já existe uma conta com esse e-mail.");
  }
  const user = { username, password, email, role: "user" };
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
  return user;
}

export function authenticateUser(username, password) {
  const demoAccounts = [
    { username: "admin", password: "admin", role: "admin" },
    { username: "teste", password: "teste", role: "user" },
  ];
  return [...demoAccounts, ...getRegisteredUsers()].find((user) => user.username === username && user.password === password) || null;
}
