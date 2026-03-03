// Splash
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("splash").classList.add("hidden");
    document.getElementById("ageGate").classList.remove("hidden");
  }, 1500);
});

// Age gate
function enterSite() {
  document.getElementById("ageGate").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  loadProducts();
}

// Load products
function loadProducts() {
  fetch("products.json")
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("products");
      container.innerHTML = "";
      data.forEach(p => {
        container.innerHTML += `
          <div>
            <h3>${p.name}</h3>
            <p>$${p.price}</p>
          </div>
        `;
      });
    });
}

// Service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
