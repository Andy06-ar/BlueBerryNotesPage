(function () {
  const STORAGE_KEY = "bbn_cart_v1";

  function getCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function setCart(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("bbn-cart-updated"));
  }

  function formatPrice(n) {
    return "$" + Number(n).toFixed(2);
  }

  function getCount() {
    return getCart().length;
  }

  function addItem(product) {
    const lineId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : "L" + Date.now() + Math.random().toString(36).slice(2);
    const items = getCart();
    items.push({
      lineId,
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image || "",
    });
    setCart(items);
  }

  function removeItem(lineId) {
    setCart(getCart().filter((l) => l.lineId !== lineId));
  }

  function getTotal() {
    return getCart().reduce((s, l) => s + Number(l.price), 0);
  }

  function updateBadge() {
    const el = document.getElementById("cartCount");
    if (el) el.textContent = String(getCount());
  }

  function render(container, options) {
    const root =
      typeof container === "string" ? document.getElementById(container) : container;
    if (!root) return;

    const emptyMsg = options && options.emptyMessage;
    const items = getCart();

    if (items.length === 0) {
      root.innerHTML =
        '<p class="cart-empty muted">' +
        (emptyMsg || "Tu carrito está vacío. Agrega productos desde el catálogo.") +
        "</p>";
      return;
    }

    const rows = items
      .map(
        (l) => `
      <div class="cart-line" data-line-id="${l.lineId}">
        <div class="cart-line-media">
          ${
            l.image
              ? `<img src="${escapeAttr(l.image)}" alt="" width="80" height="80" loading="lazy" />`
              : `<div class="cart-line-placeholder" role="img" aria-label=""></div>`
          }
        </div>
        <div class="cart-line-body">
          <div class="cart-line-name">${escapeHtml(l.name)}</div>
          <div class="cart-line-price">${formatPrice(l.price)}</div>
        </div>
        <button type="button" class="cart-line-remove" data-remove="${l.lineId}" aria-label="Eliminar del carrito">
          Quitar
        </button>
      </div>
    `
      )
      .join("");

    root.innerHTML = '<div class="cart-lines">' + rows + "</div>";

    root.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        removeItem(btn.getAttribute("data-remove"));
        render(container, options);
        updateBadge();
        if (options && typeof options.onChange === "function") options.onChange();
      });
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replaceAll("'", "&#39;");
  }

  window.BBNCart = {
    STORAGE_KEY,
    getCart,
    setCart,
    addItem,
    removeItem,
    getCount,
    getTotal,
    formatPrice,
    updateBadge,
    render,
  };

  window.addEventListener("bbn-cart-updated", () => updateBadge());
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateBadge);
  } else {
    updateBadge();
  }
})();
