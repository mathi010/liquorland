// ===============================
// LIQUORLAND APP JS
// ===============================

const WHATSAPP_NUMBER = "5426423703514";

let products = [];
let cart = {};

// ---------- FORMAT PRICE ----------
function fmt(price) {
  return "$" + price.toLocaleString("es-AR");
}

// ---------- LOAD PRODUCTS ----------
async function loadProducts() {
  try {
    const res = await fetch("./products.json");
    products = await res.json();
    renderProducts(products);
  } catch (e) {
    console.error("Error cargando productos:", e);
  }
}

// ---------- RENDER PRODUCTS ----------
function renderProducts(list) {
  const container = document.getElementById("products");
  if (!container) return;

  container.innerHTML = "";

  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <div class="product-image">
        ${p.imageText || "Liquorland"}
      </div>

      <div class="product-info">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>

        <div class="product-bottom">
          <span class="price">${fmt(p.price)}</span>
          <button onclick="addToCart('${p.id}')">
            Agregar
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

// ---------- ADD TO CART ----------
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  updateCart();
}

// ---------- UPDATE CART ----------
function updateCart() {
  const badge = document.getElementById("cartCount");
  const totalItems = Object.values(cart).reduce((a,b)=>a+b,0);

  if (badge) badge.textContent = totalItems;
}

// ---------- WHATSAPP CHECKOUT ----------
function checkout() {
  let message = "Pedido Liquorland San Juan:%0A";
  let total = 0;

  Object.keys(cart).forEach(id => {
    const product = products.find(p => p.id === id);
    const qty = cart[id];

    total += product.price * qty;

    message += `${qty}x ${product.name} - ${fmt(product.price)}%0A`;
  });

  message += `%0ATotal: ${fmt(total)}`;

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`,
    "_blank"
  );
}

// ---------- AGE GATE ----------
document.addEventListener("DOMContentLoaded", () => {

  const ageGate = document.getElementById("ageGate");
  const accept = document.getElementById("ageYes");

  if (accept) {
    accept.onclick = () => {
      ageGate.style.display = "none";
      localStorage.setItem("ageVerified", "true");
    };
  }

  if (localStorage.getItem("ageVerified")) {
    ageGate.style.display = "none";
  }

  loadProducts();
});
