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

// Imagen premium auto (SVG embebido) — no se rompe nunca
function premiumImage(text, badge = "Liquorland") {
  const safeText = (text || "Producto").toString().slice(0, 28);
  const safeBadge = (badge || "Liquorland").toString().slice(0, 18);

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#0b0b0c"/>
        <stop offset="0.55" stop-color="#141416"/>
        <stop offset="1" stop-color="#0b0b0c"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="38%" r="60%">
        <stop offset="0" stop-color="#ff7a1a" stop-opacity="0.22"/>
        <stop offset="0.55" stop-color="#ff7a1a" stop-opacity="0.06"/>
        <stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/>
      </radialGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity="0.55"/>
      </filter>
    </defs>

    <rect width="1200" height="800" fill="url(#bg)"/>
    <rect width="1200" height="800" fill="url(#glow)"/>

    <!-- “botella” minimalista -->
    <g filter="url(#shadow)">
      <rect x="520" y="170" width="160" height="460" rx="70" fill="#101012" stroke="#2a2a2f" stroke-width="3"/>
      <rect x="555" y="120" width="90" height="70" rx="30" fill="#0f0f11" stroke="#2a2a2f" stroke-width="3"/>
      <rect x="540" y="320" width="120" height="170" rx="18" fill="#15151a" stroke="#3a3a43" stroke-width="2"/>
      <rect x="540" y="500" width="120" height="70" rx="16" fill="#111116" stroke="#2a2a2f" stroke-width="2"/>
    </g>

    <!-- banda con nombre -->
    <g>
      <rect x="90" y="610" width="1020" height="120" rx="26" fill="rgba(0,0,0,0.45)" stroke="#2a2a2f" stroke-width="2"/>
      <text x="140" y="680" fill="#f5f6f7" font-size="56" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" font-weight="800">
        ${escapeXml(safeText)}
      </text>
      <text x="140" y="715" fill="#a6a8ad" font-size="28" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" font-weight="600">
        ${escapeXml(safeBadge)} · San Juan
      </text>

      <rect x="930" y="640" width="150" height="58" rx="18" fill="#ff7a1a" opacity="0.95"/>
      <text x="1005" y="679" fill="#0b0b0c" font-size="28" text-anchor="middle"
        font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" font-weight="900">
        DELIVERY
      </text>
    </g>
  </svg>`.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeXml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function loadProducts() {
  try {
    // Cache-bust (para que aparezcan cambios al toque)
    const res = await fetch(`./products.json?v=${Date.now()}`);
    const data = await res.json();

    state.products = data.map(p => ({
      ...p,
      // si algún día querés poner imagen real: agregá "image" en products.json
      image: p.image && String(p.image).trim().length > 0
        ? p.image
        : premiumImage(p.name, "Liquorland")
    }));

    state.filtered = state.products;
    renderCategories();
    renderProducts();
    wireSearch();
    wireCheckout();
  } catch (err) {
    console.error("Error cargando productos:", err);
    const container = $("#products");
    if (container) {
      container.innerHTML = `<div style="padding:16px;color:#f5f6f7">
        Error cargando productos. Revisá products.json
      </div>`;
    }
  }
}

function renderCategories() {
  const container = $("#categories");
  if (!container) return;

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

function wireSearch() {
  // soporta distintos IDs por si tu HTML cambió
  const input = $("#searchInput") || $("#search") || document.querySelector('input[type="search"]');
  const btn = $("#searchBtn") || $("#btnSearch");

  if (input) {
    input.addEventListener("input", (e) => {
      state.search = e.target.value || "";
      filterProducts();
    });
  }
  if (btn && input) {
    btn.onclick = () => {
      state.search = input.value || "";
      filterProducts();
    };
  }
}

function filterProducts() {
  let list = state.products;

  if (state.activeCategory !== "Todo") {
    list = list.filter(p => p.category === state.activeCategory);
  }

  if (state.search) {
    const q = state.search.toLowerCase();
    list = list.filter(p =>
      (p.name || "").toLowerCase().includes(q) ||
      (p.desc || "").toLowerCase().includes(q)
    );
  }

  state.filtered = list;
  renderProducts();
}

function renderProducts() {
  const container = $("#products");
  if (!container) return;

  container.innerHTML = "";

  state.filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" loading="lazy"
           onerror="this.src='${premiumImage(p.name, "Liquorland")}'" />
      <h3>${p.name}</h3>
      <p>${p.desc || ""}</p>
      <strong>${fmt(p.price || 0)}</strong>
      <button onclick="addToCart('${p.id}')">Agregar</button>
    `;

    container.appendChild(card);
  });

  updateCartBadge();
}

function addToCart(id) {
  const qty = state.cart.get(id) || 0;
  state.cart.set(id, qty + 1);
  updateCartBadge();
}

function updateCartBadge() {
  const count = Array.from(state.cart.values()).reduce((a, b) => a + b, 0);
  const el = $("#cartCount") || $("#cart-count") || $("#cartBadge");
  if (el) el.textContent = String(count);
}

function wireCheckout() {
  const btn = $("#checkoutBtn") || $("#checkout") || document.querySelector('[data-checkout="1"]');
  if (btn) btn.onclick = checkout;

  // por si tu HTML llama checkout() directo desde onclick, queda global:
  window.checkout = checkout;
  window.addToCart = addToCart;
}

function checkout() {
  if (state.cart.size === 0) {
    alert("El carrito está vacío");
    return;
  }

  let message = "Hola Liquorland! Quiero pedir:%0A%0A";
  let total = 0;

  state.cart.forEach((qty, id) => {
    const p = state.products.find(x => x.id === id);
    if (!p) return;
    const subtotal = (p.price || 0) * qty;
    total += subtotal;
    message += `${qty}x ${p.name} - ${fmt(subtotal)}%0A`;
  });

  message += `%0A*Total:* ${fmt(total)}`;

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`,
    "_blank"
  );
}

document.addEventListener("DOMContentLoaded", loadProducts);
