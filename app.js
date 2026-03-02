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

// SVG premium embebido (nunca se rompe)
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

    <!-- botella minimalista -->
    <g filter="url(#shadow)">
      <rect x="520" y="170" width="160" height="460" rx="70" fill="#101012" stroke="#2a2a2f" stroke-width="3"/>
      <rect x="555" y="120" width="90" height="70" rx="30" fill="#0f0f11" stroke="#2a2a2f" stroke-width="3"/>
      <rect x="540" y="320" width="120" height="170" rx="18" fill="#15151a" stroke="#3a3a43" stroke-width="2"/>
      <rect x="540" y="500" width="120" height="70" rx="16" fill="#111116" stroke="#2a2a2f" stroke-width="2"/>
    </g>

    <!-- banda -->
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

// ------------------ HERO (BANNERS) ------------------
const HERO = [
  {
    title: "BIG SAVINGS 💥",
    sub: "Descuentos en productos seleccionados · Stock limitado",
    chip: "Ver ofertas",
    bg: "linear-gradient(135deg, rgba(255,122,26,.38), rgba(0,0,0,.10))"
  },
  {
    title: "Bebidas frías ❄️",
    sub: "Ideal para previa / asado · Pedí rápido",
    chip: "Ver frías",
    bg: "linear-gradient(135deg, rgba(42,167,255,.28), rgba(0,0,0,.12))"
  },
  {
    title: "Combos 🔥",
    sub: "Armados para la noche · Enviás el pedido por WhatsApp",
    chip: "Ver combos",
    bg: "linear-gradient(135deg, rgba(255,122,26,.28), rgba(42,167,255,.14))"
  }
];

function renderHero() {
  const track = $("#heroTrack");
  const dots = $("#heroDots");
  if (!track || !dots) return;

  track.innerHTML = HERO.map((b, i) => `
    <div class="heroCard" data-hero="${i}" style="background:${b.bg}">
      <div class="heroCard__inner">
        <div>
          <div class="heroTitle">${b.title}</div>
          <div class="heroSub">${b.sub}</div>
        </div>
        <div class="heroCta">
          <span class="chip">${b.chip}</span>
          <span class="chip">Delivery</span>
        </div>
      </div>
    </div>
  `).join("");

  dots.innerHTML = HERO.map((_, i)=>`<div class="dot ${i===0?'dot--on':''}" data-dot="${i}"></div>`).join("");

  // dots active según scroll
  track.addEventListener("scroll", () => {
    const cards = [...track.querySelectorAll(".heroCard")];
    const idx = cards.reduce((best, el, i) => {
      const r = el.getBoundingClientRect();
      const dist = Math.abs(r.left - 12);
      return dist < best.dist ? {i, dist} : best;
    }, {i:0, dist:1e9}).i;

    [...dots.querySelectorAll(".dot")].forEach((d, j)=> d.classList.toggle("dot--on", j===idx));
  });
}

// ------------------ PRODUCTS ------------------
async function loadProducts() {
  try {
    const res = await fetch(`./products.json?v=${Date.now()}`);
    const data = await res.json();

    state.products = data.map(p => ({
      ...p,
      image: p.image && String(p.image).trim().length > 0
        ? p.image
        : premiumImage(p.name, "Liquorland")
    }));

    state.filtered = state.products;

    renderHero();
    renderCategories();
    renderOffers();
    renderProducts();
    wireSearch();
    wireCheckout();
    wireWhatsFab();
    wireInstall();
    registerSW();

  } catch (err) {
    console.error("Error cargando productos:", err);
    const container = $("#products");
    if (container) container.innerHTML = `<div style="padding:16px;color:#f5f6f7">Error cargando productos. Revisá products.json</div>`;
  }
}

// OFERTAS: promo:true o category Combos o name contiene "combo" u "oferta"
function getOffers() {
  const offers = state.products.filter(p =>
    p.promo === true ||
    String(p.category||"").toLowerCase() === "combos" ||
    /combo|oferta|promo|descuento/i.test(String(p.name||""))
  );
  // si no hay suficientes, completa con los más baratos
  if (offers.length < 6) {
    const more = [...state.products]
      .sort((a,b)=>(a.price||0)-(b.price||0))
      .filter(p => !offers.includes(p))
      .slice(0, 6 - offers.length);
    return [...offers, ...more].slice(0, 8);
  }
  return offers.slice(0, 8);
}

function renderOffers() {
  const row = $("#offersRow");
  if (!row) return;

  const offers = getOffers();

  row.innerHTML = offers.map(p => `
    <div class="offerCard">
      <img src="${p.image}" alt="${p.name}" loading="lazy"
           onerror="this.src='${premiumImage(p.name, "Liquorland")}'" />
      <h3>${p.name}</h3>
      <p>${p.desc || ""}</p>
      <div class="offerBottom">
        <strong>${fmt(p.price || 0)}</strong>
        <button onclick="addToCart('${p.id}')">Agregar</button>
      </div>
    </div>
  `).join("");

  window.scrollOffers = (dir) => {
    row.scrollBy({left: dir * 320, behavior: "smooth"});
  };
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
  const input = $("#searchInput");
  const btn = $("#searchBtn");
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
  const el = $("#cartCount");
  if (el) el.textContent = String(count);
}

// ------------------ CHECKOUT WhatsApp ------------------
function wireCheckout() {
  const btn = $("#checkoutBtn");
  if (btn) btn.onclick = checkout;

  // dejarlo global por si el HTML lo llama
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

// Floating WhatsApp
function wireWhatsFab() {
  const fab = $("#fabWhats");
  if (!fab) return;
  fab.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola Liquorland! Quiero hacer un pedido 👋")}`;
}

// ------------------ PWA INSTALL ------------------
let deferredPrompt = null;

function wireInstall() {
  const installBtn = $("#installBtn");
  if (!installBtn) return;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = "inline-flex";
  });

  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.style.display = "none";
  });
}

// ------------------ SERVICE WORKER ------------------
function registerSW() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("./sw.js").catch(()=>{});
}

document.addEventListener("DOMContentLoaded", loadProducts);
