const WHATSAPP_NUMBER = "5426423703514";
const CURRENCY = "ARS";

const state = {
  products: [],
  filtered: [],
  cart: new Map(),
  activeCategory: "Todo",
  search: ""
};

const $ = (sel) => document.querySelector(sel);

const fmt = (n) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0
  }).format(n);

function makePlaceholder(text) {
  return `https://via.placeholder.com/600x400/111111/ffffff?text=${encodeURIComponent(text)}`;
}

async function loadProducts() {
  try {
    const res = await fetch("./products.json");
    const data = await res.json();

    state.products = data.map(p => ({
      ...p,
      image: makePlaceholder(p.imageText)
    }));

    state.filtered = state.products;
    renderCategories();
    renderProducts();
  } catch (err) {
    console.error("Error cargando productos:", err);
  }
}

function renderCategories() {
  const container = $("#categories");
  const categories = ["Todo", ...new Set(state.products.map(p => p.category))];

  container.innerHTML = "";

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "cat";
    btn.innerText = cat;

    btn.onclick = () => {
      state.activeCategory = cat;
      filterProducts();
    };

    container.appendChild(btn);
  });
}

function filterProducts() {
  let list = state.products;

  if (state.activeCategory !== "Todo") {
    list = list.filter(p => p.category === state.activeCategory);
  }

  if (state.search) {
    list = list.filter(p =>
      p.name.toLowerCase().includes(state.search.toLowerCase())
    );
  }

  state.filtered = list;
  renderProducts();
}

function renderProducts() {
  const container = $("#products");
  container.innerHTML = "";

  state.filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <strong>${fmt(p.price)}</strong>
      <button onclick="addToCart('${p.id}')">Agregar</button>
    `;

    container.appendChild(card);
  });
}

function addToCart(id) {
  const qty = state.cart.get(id) || 0;
  state.cart.set(id, qty + 1);
  alert("Producto agregado al carrito");
}

function checkout() {
  if (state.cart.size === 0) {
    alert("El carrito está vacío");
    return;
  }

  let message = "Hola Liquorland! Quiero pedir:\n\n";
  let total = 0;

  state.cart.forEach((qty, id) => {
    const p = state.products.find(x => x.id === id);
    const subtotal = p.price * qty;

    message += `${qty}x ${p.name} - ${fmt(subtotal)}\n`;
    total += subtotal;
  });

  message += `\nTotal: ${fmt(total)}`;

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
}

document.addEventListener("DOMContentLoaded", loadProducts);
