/* ── DSLD Construction Calculator — App Shell ── */

const $ = id => document.getElementById(id);
const ft = (n, d = 2) => n.toFixed(d) + ' ft';
const dg = r => (r * 180 / Math.PI).toFixed(2) + '°';
const show = id => { $(id).style.display = 'block'; };

/* ── Routes (swipe order) ── */
const routeOrder = ['calculator', 'roof', 'roofarea', 'stair', 'concrete', 'converter'];
const routes = {
  calculator: { view: 'view-calculator', title: 'Calculator',          badge: '' },
  roof:       { view: 'view-roof',       title: 'Roof Framing',        badge: 'Decimal Feet' },
  roofarea:   { view: 'view-roofarea',   title: 'Roof Area',           badge: 'Slope' },
  stair:      { view: 'view-stair',      title: 'Stair Layout',        badge: 'IRC R311.7' },
  concrete:   { view: 'view-concrete',   title: 'Concrete & Material', badge: 'CU YD / Bags' },
  converter:  { view: 'view-converter',  title: 'Ft-In Converter',     badge: 'Live' },
};

let currentRoute = 'calculator';

function navigate(hash, direction) {
  const key = (hash || '').replace('#', '') || 'calculator';
  const route = routes[key] || routes.calculator;

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  $(route.view).classList.add('active');

  // Update DSLD header
  const pageLabel = $('dsld-page-label');
  if (pageLabel) {
    pageLabel.textContent = key === 'calculator' ? '' : route.title;
  }

  // Update dots
  updateDots(key);
  currentRoute = key;
  window.scrollTo(0, 0);
}

function updateDots(key) {
  const dots = document.querySelectorAll('.swipe-dot');
  const idx = routeOrder.indexOf(key);
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === idx);
  });
}

/* ── Tab switching ── */
function initTabs(container) {
  const tabs = container.querySelectorAll('.calc-tab');
  const panels = container.querySelectorAll('.tab-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      container.querySelector('[data-panel="' + target + '"]').classList.add('active');
    });
  });
}

/* ── Swipe Navigation ── */
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

function initSwipe() {
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    const elapsed = Date.now() - touchStartTime;

    // Must be primarily horizontal, fast enough, and far enough
    if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && Math.abs(deltaX) > 50 && elapsed < 500) {
      const idx = routeOrder.indexOf(currentRoute);
      if (deltaX < 0 && idx < routeOrder.length - 1) {
        // Swipe left → next
        location.hash = '#' + routeOrder[idx + 1];
      } else if (deltaX > 0 && idx > 0) {
        // Swipe right → previous
        location.hash = '#' + routeOrder[idx - 1];
      }
    }
  }, { passive: true });
}

/* ── Conversion utilities ── */
function decToFtIn(decFt, denom = 16) {
  if (isNaN(decFt) || decFt < 0) return '—';
  const totalInches = decFt * 12;
  const feet = Math.floor(totalInches / 12);
  const remInches = totalInches - feet * 12;
  const wholeInches = Math.floor(remInches);
  const fracInches = remInches - wholeInches;
  const numerator = Math.round(fracInches * denom);
  if (numerator === 0) {
    return feet + "' " + wholeInches + '"';
  }
  if (numerator === denom) {
    return feet + "' " + (wholeInches + 1) + '"';
  }
  let num = numerator, den = denom;
  while (num % 2 === 0 && den % 2 === 0) { num /= 2; den /= 2; }
  return feet + "' " + wholeInches + ' ' + num + '/' + den + '"';
}

function ftToM(f) { return f * 0.3048; }
function mToFt(m) { return m / 0.3048; }

/* ── PWA Install Prompt ── */
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const banner = $('install-banner');
  if (banner) banner.classList.remove('hidden');
});

function installApp() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(() => {
    const banner = $('install-banner');
    if (banner) banner.classList.add('hidden');
    deferredPrompt = null;
  });
}

function dismissInstall() {
  const banner = $('install-banner');
  if (banner) banner.classList.add('hidden');
}

/* ── Init ── */
window.addEventListener('DOMContentLoaded', () => {
  navigate(location.hash);
  initSwipe();

  // Init tabs
  document.querySelectorAll('[data-tabs]').forEach(initTabs);

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});

window.addEventListener('hashchange', () => navigate(location.hash));
