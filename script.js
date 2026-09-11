(function(){
  var body = document.body;
  function prefersReducedMotion(){ return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

  /* ---------- Menu mobile ---------- */
  var menuToggle = document.getElementById('menuToggle');
  var nav = document.getElementById('mainNav');
  var navClose = document.getElementById('navClose');
  var navOverlay = document.getElementById('navOverlay');

  function openNav(){
    nav.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded','true');
    navOverlay.hidden = false;
    body.classList.add('no-scroll');
    navClose.focus();
  }
  function closeNav(){
    nav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded','false');
    navOverlay.hidden = true;
    body.classList.remove('no-scroll');
  }
  menuToggle.addEventListener('click', function(){
    nav.classList.contains('is-open') ? closeNav() : openNav();
  });
  navClose.addEventListener('click', closeNav);
  navOverlay.addEventListener('click', closeNav);
  nav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeNav); });

  /* ---------- Busca ---------- */
  var searchToggle = document.getElementById('searchToggle');
  var searchForm = document.getElementById('searchForm');
  var searchInput = document.getElementById('searchInput');

  searchToggle.addEventListener('click', function(){
    var isHidden = searchForm.hasAttribute('hidden');
    if(isHidden){
      searchForm.removeAttribute('hidden');
      searchToggle.setAttribute('aria-expanded','true');
      searchInput.focus();
    } else {
      searchForm.setAttribute('hidden','');
      searchToggle.setAttribute('aria-expanded','false');
    }
  });

  /* ---------- Conta ---------- */
  var accountToggle = document.getElementById('accountToggle');
  var accountMenu = document.getElementById('accountMenu');

  accountToggle.addEventListener('click', function(){
    var isHidden = accountMenu.hasAttribute('hidden');
    if(isHidden){
      accountMenu.removeAttribute('hidden');
      accountToggle.setAttribute('aria-expanded','true');
    } else {
      accountMenu.setAttribute('hidden','');
      accountToggle.setAttribute('aria-expanded','false');
    }
  });

  document.addEventListener('click', function(e){
    if(!accountToggle.contains(e.target) && !accountMenu.contains(e.target)){
      accountMenu.setAttribute('hidden','');
      accountToggle.setAttribute('aria-expanded','false');
    }
    if(!searchToggle.contains(e.target) && !searchForm.contains(e.target)){
      searchForm.setAttribute('hidden','');
      searchToggle.setAttribute('aria-expanded','false');
    }
  });

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      if(nav.classList.contains('is-open')) closeNav();
      accountMenu.setAttribute('hidden','');
      accountToggle.setAttribute('aria-expanded','false');
      searchForm.setAttribute('hidden','');
      searchToggle.setAttribute('aria-expanded','false');
      closeCart();
    }
  });

  /* ---------- Carrossel + busca filtrando produtos ---------- */
  var carouselItems = Array.prototype.slice.call(document.querySelectorAll('.carousel-item'));
  var searchStatus = document.getElementById('searchStatus');
  var track = document.getElementById('carouselTrack');
  var prevBtn = document.getElementById('carPrev');
  var nextBtn = document.getElementById('carNext');
  var dotsWrap = document.getElementById('carouselDots');

  searchForm.addEventListener('submit', function(e){
    e.preventDefault();
    var query = searchInput.value.trim().toLowerCase();
    if(!query){
      carouselItems.forEach(function(li){ li.style.display=''; });
      searchStatus.textContent = '';
      return;
    }
    var matches = 0;
    carouselItems.forEach(function(li){
      var name = (li.dataset.name || '').toLowerCase();
      var show = name.indexOf(query) !== -1;
      li.style.display = show ? '' : 'none';
      if(show) matches++;
    });
    searchStatus.textContent = matches
      ? matches + ' produto(s) encontrado(s) para "' + searchInput.value + '".'
      : 'Nenhum produto encontrado para "' + searchInput.value + '".';
    document.getElementById('carrossel').scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  });

  var dots = carouselItems.map(function(item, i){
    var dot = document.createElement('button');
    dot.setAttribute('aria-label', 'Ir para produto ' + (i + 1));
    dot.addEventListener('click', function(){
      item.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', inline: 'start', block: 'nearest' });
    });
    dotsWrap.appendChild(dot);
    return dot;
  });

  function scrollByOne(dir){
    var itemWidth = carouselItems[0].getBoundingClientRect().width + 19;
    track.scrollBy({ left: dir * itemWidth, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }
  prevBtn.addEventListener('click', function(){ scrollByOne(-1); });
  nextBtn.addEventListener('click', function(){ scrollByOne(1); });

  function updateActiveDot(){
    var trackRect = track.getBoundingClientRect();
    var closestIndex = 0, closestDist = Infinity;
    carouselItems.forEach(function(item, i){
      var r = item.getBoundingClientRect();
      var dist = Math.abs(r.left - trackRect.left);
      if(dist < closestDist){ closestDist = dist; closestIndex = i; }
    });
    dots.forEach(function(d, i){
      if(i === closestIndex) d.setAttribute('aria-current','true');
      else d.removeAttribute('aria-current');
    });
  }
  var scrollTimer;
  track.addEventListener('scroll', function(){
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(updateActiveDot, 80);
  });
  updateActiveDot();

  /* ---------- Carrinho ---------- */
  var cart = {};
  var cartCountEl = document.getElementById('cartCount');
  var cartToggle = document.getElementById('cartToggle');
  var cartDrawer = document.getElementById('cartDrawer');
  var cartClose = document.getElementById('cartClose');
  var cartList = document.getElementById('cartList');
  var drawerOverlay = document.getElementById('drawerOverlay');

  function openCart(){
    cartDrawer.hidden = false;
    requestAnimationFrame(function(){ cartDrawer.classList.add('is-open'); });
    drawerOverlay.hidden = false;
    cartToggle.setAttribute('aria-expanded','true');
    body.classList.add('no-scroll');
  }
  function closeCart(){
    cartDrawer.classList.remove('is-open');
    drawerOverlay.hidden = true;
    cartToggle.setAttribute('aria-expanded','false');
    body.classList.remove('no-scroll');
    setTimeout(function(){ cartDrawer.hidden = true; }, 250);
  }
  cartToggle.addEventListener('click', function(){
    cartDrawer.classList.contains('is-open') ? closeCart() : openCart();
  });
  cartClose.addEventListener('click', closeCart);
  drawerOverlay.addEventListener('click', closeCart);

  function renderCart(){
    var names = Object.keys(cart);
    var total = names.reduce(function(sum, n){ return sum + cart[n]; }, 0);
    cartCountEl.textContent = total;
    cartToggle.setAttribute('aria-label', 'Carrinho de compras, ' + total + ' itens');
    cartList.innerHTML = '';
    if(!names.length){
      cartList.innerHTML = '<li class="cart-empty">Seu carrinho está vazio.</li>';
      return;
    }
    names.forEach(function(name){
      var li = document.createElement('li');
      li.className = 'cart-line';
      li.innerHTML = '<div><p class="cart-line-name">' + name + '</p><p class="cart-line-qty">Qtd: ' + cart[name] + '</p></div>';
      var removeBtn = document.createElement('button');
      removeBtn.setAttribute('aria-label', 'Remover ' + name);
      removeBtn.innerHTML = '<svg class="icon icon-sm"><use href="#icon-trash"></use></svg>';
      removeBtn.addEventListener('click', function(){ delete cart[name]; renderCart(); });
      li.appendChild(removeBtn);
      cartList.appendChild(li);
    });
  }

  document.querySelectorAll('.add-cart-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var name = btn.dataset.product;
      cart[name] = (cart[name] || 0) + 1;
      renderCart();
      btn.classList.add('is-added');
      setTimeout(function(){ btn.classList.remove('is-added'); }, 900);
    });
  });
  renderCart();

  /* ---------- Newsletter ---------- */
  var newsletterForm = document.getElementById('newsletterForm');
  var newsletterEmail = document.getElementById('newsletterEmail');
  var newsletterFeedback = document.getElementById('newsletterFeedback');

  newsletterForm.addEventListener('submit', function(e){
    e.preventDefault();
    var value = newsletterEmail.value.trim();
    var isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if(!isValid){
      newsletterFeedback.textContent = 'Digite um e-mail válido.';
      newsletterFeedback.className = 'newsletter-feedback is-error';
      newsletterEmail.focus();
      return;
    }
    newsletterFeedback.textContent = 'Cadastro recebido! Confira seu e-mail em breve.';
    newsletterFeedback.className = 'newsletter-feedback is-success';
    newsletterForm.reset();
  });
})();
