// =========================================================
// START BUILDING -> SELETOR DE TRADES
// =========================================================

const startBtn     = document.getElementById('startBuildingBtn');
const tradePicker  = document.getElementById('tradePicker');
const tradeClose   = tradePicker?.querySelector('.trade-picker-close');
const tradeOptions = tradePicker?.querySelectorAll('.trade-option') || [];
const shopSection  = document.getElementById('shop');

function toggleTradePicker(forceOpen) {
  if (!tradePicker) return;
  const shouldOpen =
    typeof forceOpen === 'boolean'
      ? forceOpen
      : !tradePicker.classList.contains('open');

  if (shouldOpen) {
    tradePicker.classList.add('open');
  } else {
    tradePicker.classList.remove('open');
  }
}

// abre/fecha ao clicar no Start Building
if (startBtn) {
  startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleTradePicker();
  });
}

// fecha no X
if (tradeClose) {
  tradeClose.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleTradePicker(false);
  });
}

// clicar em uma trade: fecha e rola até o shop
tradeOptions.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();

    const tradeKey  = btn.dataset.trade || 'default';
    const tradeName = btn.textContent?.trim() || 'Your trade';

    console.log('Selected trade:', tradeKey, tradeName);
    // aqui no futuro você pode filtrar produtos por tradeKey

    toggleTradePicker(false);

    if (shopSection) {
      shopSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// clicar fora da janelinha (em qualquer lugar do documento) fecha
document.addEventListener('click', (e) => {
  if (!tradePicker) return;
  if (!tradePicker.classList.contains('open')) return;

  // se o clique NÃO foi dentro da janelinha nem no botão Start Building, fecha
  if (!tradePicker.contains(e.target) && e.target !== startBtn) {
    toggleTradePicker(false);
  }
});


// =========================================================
// MODAL DE PRODUTO
// =========================================================

(function () {
  const productModal      = document.getElementById('productModal');
  const productModalImg   = document.getElementById('productModalImage');
  const productModalTitle = document.getElementById('productModalTitle');
  const productModalDesc  = document.getElementById('productModalDesc');
  const closeProductModal = document.getElementById('closeProductModal');

  if (!productModal || !productModalImg || !productModalTitle || !productModalDesc || !closeProductModal) {
    // ainda não temos o HTML do modal – não faz nada
    return;
  }

  document.querySelectorAll('.product-card').forEach(card => {
    const btn = card.querySelector('.product-cta');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const img  = card.querySelector('.product-image');
      const name = card.querySelector('.product-name')?.textContent || '';
      const desc = card.querySelector('.product-meta')?.textContent || '';

      if (img) {
        productModalImg.src = img.src;
        productModalImg.alt = img.alt || name;
      } else {
        productModalImg.src = '';
        productModalImg.alt = '';
      }

      productModalTitle.textContent = name;
      productModalDesc.textContent  = desc;

      productModal.classList.add('open');
    });
  });

  function closeProdModal() {
    productModal.classList.remove('open');
  }

  closeProductModal.addEventListener('click', closeProdModal);

  productModal.addEventListener('click', (e) => {
    if (e.target === productModal || e.target.classList.contains('product-modal-backdrop')) {
      closeProdModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && productModal.classList.contains('open')) {
      closeProdModal();
    }
  });
})();


// =========================================================
// SHOP TRADE DROPDOWN (título clicável)
// =========================================================

(function () {
  const tradeMenu   = document.getElementById('shopTradeMenu');
  const tradeToggle = document.getElementById('shopTradeToggle');
  const tradeLabel  = document.getElementById('shopTradeLabel');
  const grids       = document.querySelectorAll('.products-grid');

  if (!tradeMenu || !tradeToggle || grids.length === 0) return;

  function setTrade(key, labelText) {
    let found = false;

    grids.forEach(grid => {
      const gridKey = grid.dataset.trade || 'default';
      const isMatch = gridKey === key;
      grid.classList.toggle('is-active', isMatch);
      if (isMatch) found = true;
    });

    // se ainda não existe grid pra essa trade, volta pro primeiro
    if (!found && grids[0]) {
      grids.forEach(grid => grid.classList.remove('is-active'));
      grids[0].classList.add('is-active');
    }

    if (labelText) {
      tradeLabel.textContent = labelText;
    }
  }

  // abre/fecha o menu ao clicar no título
  tradeToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    tradeMenu.classList.toggle('open');
    const isOpen = tradeMenu.classList.contains('open');
    tradeMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  });

  // fecha ao clicar fora
  document.addEventListener('click', (e) => {
    if (!tradeMenu.contains(e.target) && e.target !== tradeToggle) {
      tradeMenu.classList.remove('open');
      tradeMenu.setAttribute('aria-hidden', 'true');
    }
  });

  // clique em uma trade do menu
  tradeMenu.querySelectorAll('button[data-trade]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key   = btn.dataset.trade;
      const label = btn.textContent.trim();
      setTrade(key, label);
      tradeMenu.classList.remove('open');
      tradeMenu.setAttribute('aria-hidden', 'true');

      // rola suave até o topo do shop
      const shopSection = document.getElementById('shop');
      if (shopSection) {
        shopSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // define um padrão (primeira opção do menu)
  const firstBtn = tradeMenu.querySelector('button[data-trade]');
  if (firstBtn) {
    setTrade(firstBtn.dataset.trade, firstBtn.textContent.trim());
  }
})();


// =========================================================
// LANDING DO SHOP -> ABRIR E-COMMERCE
// =========================================================

(function () {
  const landing  = document.getElementById('shopLanding');
  const shopMain = document.getElementById('shopMain');

  if (!landing || !shopMain) return;

  // estado inicial
  shopMain.classList.remove('is-visible');
  landing.classList.remove('is-hidden');

  // qualquer card clicado abre o e-commerce
  landing.querySelectorAll('.shop-landing-card').forEach(card => {
    card.addEventListener('click', () => {
      const fit = card.dataset.fit || null;

      landing.classList.add('is-hidden');
      shopMain.classList.add('is-visible');

      // no futuro: aqui você pode filtrar por "fit" (men/women/members)
      // e/ou marcar o botão certo na mini-nav.
      console.log('Landing clicked:', fit);
    });
  });
})();


// =========================================================
// ONSITE TOOLS – BOTÕES DAS FERRAMENTAS
// =========================================================

document.addEventListener('DOMContentLoaded', function () {
  const calculatorBtn =
    document.querySelector('[data-tool="calculator"]');
  const timerBtn =
    document.querySelector('[data-tool="timer"]');

  // se ainda não existe o modal da calculadora de inches,
  // mantém só o alerta placeholder; senão deixa o outro script cuidar.
  const inchModal = document.getElementById('inchCalcModal');

  if (calculatorBtn && !inchModal) {
    calculatorBtn.addEventListener('click', function () {
      // Quando você tiver a página da calculadora:
      // window.location.href = 'tools/calculator.html';
      alert('Aqui vai abrir a calculadora de inches (em breve).');
    });
  }

  if (timerBtn) {
    timerBtn.addEventListener('click', function () {
      // Quando você tiver a página do timer:
      // window.location.href = 'tools/timer.html';
      alert('Aqui vai abrir o cronômetro / hour tracker (em breve).');
    });
  }
});

// =======================================================
//             THE CLUB – BE ONSITE MAP
//  ======================================================= 

// --- Hover vídeo nos cards do Club ---
document.querySelectorAll('.club-card').forEach(card => {
  const video = card.querySelector('.club-image-video');
  if (!video) return;

  card.addEventListener('mouseenter', () => {
    video.currentTime = 0;
    video.play().catch(() => {});
  });

  card.addEventListener('mouseleave', () => {
    video.pause();
  });
});

// -----------------------------------------
// CLUB CTAS – SCROLL SUAVE PARA AS SEÇÕES
// -----------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.club-cta[data-target]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      if (!targetId) return;

      const section = document.getElementById(targetId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
