/* ── User Guide ── */

(function () {
  const sectionMap = {
    calculator: 'guide-calc',
    roof:       'guide-roof',
    roofarea:   'guide-roofarea',
    stair:      'guide-stair',
    concrete:   'guide-concrete',
    converter:  'guide-converter'
  };

  window.openGuide = function () {
    const backdrop = document.getElementById('guide-backdrop');
    const panel = document.getElementById('guide-panel');
    backdrop.classList.add('open');
    panel.classList.add('open');

    // Show section for current calculator
    const section = sectionMap[currentRoute] || 'guide-calc';
    showGuideSection(section);
  };

  window.closeGuide = function () {
    const backdrop = document.getElementById('guide-backdrop');
    const panel = document.getElementById('guide-panel');
    backdrop.classList.remove('open');
    panel.classList.remove('open');
  };

  window.showGuideSection = function (id) {
    document.querySelectorAll('.guide-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.guide-nav-btn').forEach(b => b.classList.remove('active'));
    const section = document.getElementById(id);
    if (section) section.classList.add('active');
    const btn = document.querySelector('[data-guide="' + id + '"]');
    if (btn) btn.classList.add('active');
  };

  window.tryExample = function (route, fills, autoCalc) {
    closeGuide();
    location.hash = '#' + route;

    setTimeout(function () {
      // Fill values
      Object.keys(fills).forEach(function (id) {
        var el = document.getElementById(id);
        if (el) {
          el.value = fills[id];
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });

      // Auto-calculate if specified
      if (autoCalc) {
        var btn = document.querySelector('#view-' + route + ' .btn');
        if (btn) btn.click();
      }
    }, 200);
  };

  window.tryKeypadExample = function () {
    closeGuide();
    location.hash = '#calculator';

    setTimeout(function () {
      kpPress('C');
      kpPress('1'); kpPress('2'); kpPress('Feet');
      kpPress('6'); kpPress('Inch');
      kpPress('+');
      kpPress('3'); kpPress('Feet');
      kpPress('2'); kpPress('Inch');
      kpPress('=');
    }, 200);
  };

  window.tryRoofAreaExample = function () {
    closeGuide();
    location.hash = '#roofarea';

    setTimeout(function () {
      // Clear existing rows
      document.getElementById('ra-rows').innerHTML = '';
      // Add two areas
      raAddRow();
      raAddRow();
      var rows = document.querySelectorAll('#ra-rows .dyn-row');
      if (rows[0]) {
        rows[0].querySelector('.ra-len').value = '40';
        rows[0].querySelector('.ra-wid').value = '25';
        rows[0].querySelector('.ra-pitch').value = '8';
      }
      if (rows[1]) {
        rows[1].querySelector('.ra-len').value = '30';
        rows[1].querySelector('.ra-wid').value = '20';
        rows[1].querySelector('.ra-pitch').value = '6';
      }
      calcRoofArea();
    }, 200);
  };

  window.tryFootingExample = function () {
    closeGuide();
    location.hash = '#concrete';

    setTimeout(function () {
      // Switch to footing tab
      var tab = document.querySelector('[data-tab="footing"]');
      if (tab) tab.click();

      setTimeout(function () {
        document.getElementById('ft-rows').innerHTML = '';
        ftAddRow(2); // 16"x8"
        ftAddRow(4); // 20"x10"
        var rows = document.querySelectorAll('#ft-rows .dyn-row');
        if (rows[0]) rows[0].querySelector('.ft-len').value = '80';
        if (rows[1]) rows[1].querySelector('.ft-len').value = '50';
        calcFootings();
      }, 100);
    }, 200);
  };

  // Swipe-to-close on guide panel
  var guideStartX = 0;
  document.addEventListener('DOMContentLoaded', function () {
    var panel = document.getElementById('guide-panel');
    if (!panel) return;

    panel.addEventListener('touchstart', function (e) {
      guideStartX = e.touches[0].clientX;
    }, { passive: true });

    panel.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - guideStartX;
      if (dx > 80) closeGuide(); // swipe right to close
    }, { passive: true });
  });
})();
