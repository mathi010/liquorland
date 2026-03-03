// app.js (FIX: enterSite global + listener + logs)

function $(id){ return document.getElementById(id); }

window.addEventListener("load", () => {
  // Oculta splash y muestra age gate
  const splash = $("splash");
  const ageGate = $("ageGate");

  if (splash) {
    setTimeout(() => splash.classList.add("hidden"), 1200);
  }
  if (ageGate) {
    setTimeout(() => ageGate.classList.remove("hidden"), 1200);
  }

  // Por si el botón no usa onclick o quedó raro, le ponemos listener también
  const btn = document.querySelector("#ageGate button");
  if (btn) {
    btn.addEventListener("click", () => window.enterSite());
  }

  // Service worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(console.error);
  }
});

// ✅ IMPORTANTÍSIMO: global para que funcione desde onclick=""
window.enterSite = function enterSite() {
  const ageGate = $("ageGate");
  const app = $("app");

  if (ageGate) ageGate.classList.add("hidden");
  if (app) app.classList.remove("hidden");

  loadProducts();
};

function loadProducts() {
  fetch("products.json?v=" + Date.now())
    .then(res => res.json())
    .then(data => {
      const container = $("products");
      if (!container) return;

      container.innerHTML = "";
      data.forEach(p => {
        container.innerHTML += `
          <div style="padding:12px;margin:10px;background:#111;border-radius:12px;">
            <h3 style="margin:0 0 6px;">${p.name}</h3>
            <p style="margin:0;font-weight:700;">$${p.price}</p>
          </div>
        `;
      });
    })
    .catch(err => {
      alert("Error cargando productos. Revisá products.json");
      console.error(err);
    });
}
