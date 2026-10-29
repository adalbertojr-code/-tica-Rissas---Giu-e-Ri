(function () {
  "use strict";

  var body = document.body;
  var WHATSAPP = "https://wa.me/5535988836974";
  var BLACK_FRIDAY_DATE = "2026-11-27T00:00:00-03:00";
  var SHIPPING_FREE_FROM = 350;
  var SHIPPING_FLAT = 24.9;

  function money(value) {
    return "R$ " + value.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ---------- Menu mobile ---------- */
  var menuToggle = document.getElementById("menuToggle");
  var nav = document.getElementById("mainNav");
  var navClose = document.getElementById("navClose");
  var navOverlay = document.getElementById("navOverlay");

  function openNav() {
    nav.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    navOverlay.hidden = false;
    body.classList.add("no-scroll");
    navClose.focus();
  }

  function closeNav() {
    nav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    navOverlay.hidden = true;
    body.classList.remove("no-scroll");
  }

  menuToggle.addEventListener("click", function () {
    nav.classList.contains("is-open") ? closeNav() : openNav();
  });
  navClose.addEventListener("click", closeNav);
  navOverlay.addEventListener("click", closeNav);
  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });

  /* ---------- Busca e atendimento ---------- */
  var searchToggle = document.getElementById("searchToggle");
  var searchForm = document.getElementById("searchForm");
  var searchInput = document.getElementById("searchInput");
  var accountToggle = document.getElementById("accountToggle");
  var accountMenu = document.getElementById("accountMenu");

  function togglePanel(button, panel) {
    var hidden = panel.hasAttribute("hidden");
    panel.toggleAttribute("hidden", !hidden);
    button.setAttribute("aria-expanded", hidden ? "true" : "false");
    if (hidden && panel === searchForm) searchInput.focus();
  }

  searchToggle.addEventListener("click", function () {
    togglePanel(searchToggle, searchForm);
  });
  accountToggle.addEventListener("click", function () {
    togglePanel(accountToggle, accountMenu);
  });

  document.addEventListener("click", function (event) {
    if (!searchToggle.contains(event.target) && !searchForm.contains(event.target)) {
      searchForm.setAttribute("hidden", "");
      searchToggle.setAttribute("aria-expanded", "false");
    }
    if (!accountToggle.contains(event.target) && !accountMenu.contains(event.target)) {
      accountMenu.setAttribute("hidden", "");
      accountToggle.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (nav.classList.contains("is-open")) closeNav();
    searchForm.setAttribute("hidden", "");
    searchToggle.setAttribute("aria-expanded", "false");
    accountMenu.setAttribute("hidden", "");
    accountToggle.setAttribute("aria-expanded", "false");
    closeCart();
  });

  /* ---------- Contagem Black Friday ---------- */
  var bfTarget = new Date(BLACK_FRIDAY_DATE).getTime();
  var bfFields = {
    days: document.getElementById("bfDays"),
    hours: document.getElementById("bfHours"),
    minutes: document.getElementById("bfMinutes"),
    seconds: document.getElementById("bfSeconds")
  };

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tickCountdown() {
    var diff = bfTarget - Date.now();
    if (diff < 0) diff = 0;
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var minutes = Math.floor((diff % 3600000) / 60000);
    var seconds = Math.floor((diff % 60000) / 1000);
    bfFields.days.textContent = pad(days);
    bfFields.hours.textContent = pad(hours);
    bfFields.minutes.textContent = pad(minutes);
    bfFields.seconds.textContent = pad(seconds);
  }

  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ---------- Produtos ---------- */
  var PRODUCTS = (window.PRODUTOS || []).map(function (row) {
    return {
      img: "assets/produtos-clean/" + row[0],
      category: row[1],
      tag: row[2],
      code: row[3],
      name: row[4],
      alt: row[5],
      price: row[6],
      old: row[7],
      specs: row[8]
    };
  });

  var grid = document.getElementById("productGrid");
  var searchStatus = document.getElementById("searchStatus");
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
  var activeFilter = "all";
  var activeQuery = "";

  function isOffer(product) {
    return typeof product.old === "number";
  }

  function matchesFilter(product, filter) {
    if (filter === "all") return true;
    if (filter === "black") return isOffer(product);
    return product.category === filter;
  }

  function normalize(text) {
    return String(text).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }

  function matchesQuery(product, query) {
    if (!query) return true;
    var haystack = normalize(product.name + " " + product.code + " " + product.tag);
    return haystack.indexOf(normalize(query)) !== -1;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function icon(id, extraClass) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icon" + (extraClass ? " " + extraClass : ""));
    svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  }

  function buildCard(product) {
    var li = el("li", "product-card");
    li.dataset.name = product.name;

    var media = el("div", "product-media");
    var img = el("img");
    img.src = product.img;
    img.alt = product.alt;
    img.width = 900;
    img.height = 900;
    img.loading = "lazy";
    media.appendChild(img);

    if (product.tag) media.appendChild(el("span", "product-tag", product.tag));

    var addBtn = el("button", "product-add");
    addBtn.type = "button";
    addBtn.setAttribute("aria-label", "Adicionar " + product.name + " ao carrinho");
    addBtn.appendChild(icon("icon-plus", "icon-sm"));
    addBtn.addEventListener("click", function () {
      addToCart(product);
      addBtn.classList.add("is-added");
      setTimeout(function () {
        addBtn.classList.remove("is-added");
      }, 900);
    });
    media.appendChild(addBtn);
    li.appendChild(media);

    var bodyEl = el("div", "product-body");
    bodyEl.appendChild(el("p", "product-code", "Código " + product.code));
    bodyEl.appendChild(el("h3", null, product.name));

    var priceRow = el("p", "product-price");
    if (isOffer(product)) priceRow.appendChild(el("span", "price-old", money(product.old)));
    priceRow.appendChild(el("span", "price-now", money(product.price)));
    bodyEl.appendChild(priceRow);

    bodyEl.appendChild(el("p", "product-installments", "2x de " + money(product.price / 2) + " sem juros"));

    var detailsBtn = el("button", "product-details", "Ver detalhes");
    detailsBtn.type = "button";
    detailsBtn.setAttribute("aria-expanded", "false");

    var specs = el("ul", "product-specs");
    specs.hidden = true;
    product.specs.forEach(function (spec) {
      var item = el("li");
      item.appendChild(el("span", null, spec[0]));
      item.appendChild(el("span", null, spec[1]));
      specs.appendChild(item);
    });

    detailsBtn.addEventListener("click", function () {
      var open = specs.hidden;
      specs.hidden = !open;
      detailsBtn.setAttribute("aria-expanded", open ? "true" : "false");
      detailsBtn.textContent = open ? "Ocultar detalhes" : "Ver detalhes";
    });

    bodyEl.appendChild(detailsBtn);
    bodyEl.appendChild(specs);
    li.appendChild(bodyEl);
    return li;
  }

  function renderProducts() {
    var query = activeQuery.trim().toLowerCase();
    var visible = 0;

    grid.innerHTML = "";
    PRODUCTS.forEach(function (product) {
      if (!matchesFilter(product, activeFilter)) return;
      if (!matchesQuery(product, query)) return;
      grid.appendChild(buildCard(product));
      visible++;
    });

    if (!visible) {
      var empty = el("li", "product-empty", "Nenhum produto encontrado. Tente outro filtro ou fale com a gente.");
      grid.appendChild(empty);
    }

    if (query) {
      searchStatus.textContent = visible
        ? visible + " produto(s) encontrado(s) para \"" + activeQuery + "\"."
        : "Nenhum produto encontrado para \"" + activeQuery + "\".";
    } else {
      searchStatus.textContent = "";
    }
  }

  function setFilter(filter) {
    activeFilter = filter;
    filterButtons.forEach(function (button) {
      var isActive = button.dataset.filter === filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
    renderProducts();
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setFilter(button.dataset.filter);
    });
  });

  document.querySelectorAll("[data-filter-link]").forEach(function (link) {
    link.addEventListener("click", function () {
      setFilter(link.dataset.filterLink);
    });
  });

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    activeQuery = searchInput.value;
    renderProducts();
    document.getElementById("produtos").scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start"
    });
  });

  searchInput.addEventListener("input", function () {
    activeQuery = searchInput.value;
    renderProducts();
  });

  /* ---------- Carrinho ---------- */
  var cart = [];
  var cartCountEl = document.getElementById("cartCount");
  var cartToggle = document.getElementById("cartToggle");
  var cartDrawer = document.getElementById("cartDrawer");
  var cartClose = document.getElementById("cartClose");
  var cartList = document.getElementById("cartList");
  var drawerOverlay = document.getElementById("drawerOverlay");
  var cartSubtotalEl = document.getElementById("cartSubtotal");
  var cartTotalEl = document.getElementById("cartTotal");
  var cartCheckout = document.getElementById("cartCheckout");
  var cepInput = document.getElementById("cepInput");
  var cepCalc = document.getElementById("cepCalc");
  var shippingResult = document.getElementById("shippingResult");
  var shippingCost = null;

  function openCart() {
    cartDrawer.hidden = false;
    requestAnimationFrame(function () {
      cartDrawer.classList.add("is-open");
    });
    drawerOverlay.hidden = false;
    cartToggle.setAttribute("aria-expanded", "true");
    body.classList.add("no-scroll");
  }

  function closeCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove("is-open");
    drawerOverlay.hidden = true;
    cartToggle.setAttribute("aria-expanded", "false");
    body.classList.remove("no-scroll");
    setTimeout(function () {
      cartDrawer.hidden = true;
    }, 250);
  }

  function cartSubtotal() {
    return cart.reduce(function (sum, item) {
      return sum + item.product.price * item.qty;
    }, 0);
  }

  function addToCart(product) {
    var existing = cart.find(function (item) {
      return item.product.code === product.code;
    });
    if (existing) existing.qty++;
    else cart.push({ product: product, qty: 1 });
    shippingCost = null;
    shippingResult.textContent = "";
    shippingResult.className = "cart-shipping-result";
    renderCart();
  }

  function removeFromCart(code) {
    cart = cart.filter(function (item) {
      return item.product.code !== code;
    });
    renderCart();
  }

  function renderCart() {
    var count = cart.reduce(function (sum, item) {
      return sum + item.qty;
    }, 0);
    cartCountEl.textContent = count;
    cartToggle.setAttribute("aria-label", "Carrinho de compras, " + count + " itens");

    cartList.innerHTML = "";
    if (!cart.length) {
      cartList.appendChild(el("li", "cart-empty", "Seu carrinho está vazio."));
    }

    cart.forEach(function (item) {
      var li = el("li", "cart-line");
      var info = el("div");
      info.appendChild(el("p", "cart-line-name", item.product.name));
      info.appendChild(el("p", "cart-line-qty", item.qty + "x " + money(item.product.price) + " · " + money(item.product.price * item.qty)));
      li.appendChild(info);

      var removeBtn = el("button");
      removeBtn.type = "button";
      removeBtn.setAttribute("aria-label", "Remover " + item.product.name);
      removeBtn.appendChild(icon("icon-trash", "icon-sm"));
      removeBtn.addEventListener("click", function () {
        removeFromCart(item.product.code);
      });
      li.appendChild(removeBtn);
      cartList.appendChild(li);
    });

    var subtotal = cartSubtotal();
    var total = subtotal + (shippingCost || 0);
    cartSubtotalEl.textContent = money(subtotal);
    cartTotalEl.textContent = money(total);

    var message = "Olá! Quero finalizar meu pedido na Rissas Ótica:\n\n";
    cart.forEach(function (item) {
      message += "• " + item.qty + "x " + item.product.name + " (" + item.product.code + ") — " + money(item.product.price * item.qty) + "\n";
    });
    message += String.fromCharCode(10) + "Subtotal: " + money(subtotal);
    if (shippingCost !== null) {
      message += "\nFrete: " + (shippingCost === 0 ? "Grátis" : money(shippingCost));
      message += "\nTotal: " + money(total);
    }
    cartCheckout.href = WHATSAPP + "?text=" + encodeURIComponent(message);
  }

  function calculateShipping() {
    var digits = cepInput.value.replace(/\D/g, "");
    if (digits.length !== 8) {
      shippingResult.textContent = "Digite um CEP válido com 8 dígitos.";
      shippingResult.className = "cart-shipping-result is-error";
      cepInput.focus();
      return;
    }
    if (!cart.length) {
      shippingResult.textContent = "Adicione um produto antes de calcular o frete.";
      shippingResult.className = "cart-shipping-result is-error";
      return;
    }

    var region = parseInt(digits.charAt(0), 10);
    var free = cartSubtotal() >= SHIPPING_FREE_FROM;
    var base = region <= 1 ? 15.9 : region <= 3 ? SHIPPING_FLAT : region <= 6 ? 34.9 : 45.9;
    shippingCost = free ? 0 : base;
    var days = region <= 1 ? "2 a 4" : region <= 3 ? "4 a 7" : "6 a 12";

    shippingResult.textContent = free
      ? "Frete grátis · entrega em " + days + " dias úteis."
      : "Frete " + money(base) + " · entrega em " + days + " dias úteis.";
    shippingResult.className = "cart-shipping-result cart-shi-ok";
    renderCart();
  }

  cartToggle.addEventListener("click", function () {
    cartDrawer.classList.contains("is-open") ? closeCart() : openCart();
  });
  cartClose.addEventListener("click", closeCart);
  drawerOverlay.addEventListener("click", closeCart);
  cepCalc.addEventListener("click", calculateShipping);
  cepInput.addEventListener("input", function () {
    var digits = cepInput.value.replace(/\D/g, "").slice(0, 8);
    cepInput.value = digits.replace(/(\d{5})(\d{1,3})/, "$1-$2");
  });

  /* ---------- Newsletter ---------- */
  var newsletterForm = document.getElementById("newsletterForm");
  var newsletterEmail = document.getElementById("newsletterEmail");
  var newsletterFeedback = document.getElementById("newsletterFeedback");

  newsletterForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var value = newsletterEmail.value.trim();
    var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    if (!valid) {
      newsletterFeedback.textContent = "Digite um e-mail válido.";
      newsletterFeedback.className = "newsletter-feedback is-error";
      newsletterEmail.focus();
      return;
    }

    newsletterFeedback.textContent = "Cadastro recebido! Fale com a gente no WhatsApp para novidades.";
    newsletterFeedback.className = "newsletter-feedback is-success";
    newsletterForm.reset();
  });

  renderProducts();
  renderCart();
})();
