/* ── Feet-Inches Converter — Live Bidirectional ── */

(function () {
  let updating = false;

  function init() {
    // Decimal feet input
    const decInput = $('cv-decimal');
    // Feet-inches inputs
    const feetInput = $('cv-feet');
    const inchInput = $('cv-inches');
    const fracSelect = $('cv-frac');
    // Metric inputs
    const mInput  = $('cv-meters');
    const cmInput = $('cv-cm');
    const mmInput = $('cv-mm');

    if (!decInput) return; // not on this page yet

    // From decimal feet
    decInput.addEventListener('input', () => {
      if (updating) return;
      updating = true;
      const dec = parseFloat(decInput.value);
      if (!isNaN(dec) && dec >= 0) {
        updateFromDecimal(dec);
      }
      updating = false;
    });

    // From feet-inches
    [feetInput, inchInput, fracSelect].forEach(el => {
      el.addEventListener('input', () => {
        if (updating) return;
        updating = true;
        const feet = parseInt(feetInput.value) || 0;
        const inches = parseInt(inchInput.value) || 0;
        const frac = parseFloat(fracSelect.value) || 0;
        const dec = feet + (inches + frac) / 12;
        decInput.value = dec.toFixed(4);
        updateMetric(dec);
        updating = false;
      });
      el.addEventListener('change', () => el.dispatchEvent(new Event('input')));
    });

    // From meters
    mInput.addEventListener('input', () => {
      if (updating) return;
      updating = true;
      const m = parseFloat(mInput.value);
      if (!isNaN(m) && m >= 0) {
        const dec = mToFt(m);
        decInput.value = dec.toFixed(4);
        cmInput.value = (m * 100).toFixed(2);
        mmInput.value = (m * 1000).toFixed(1);
        updateFtIn(dec);
      }
      updating = false;
    });

    // From cm
    cmInput.addEventListener('input', () => {
      if (updating) return;
      updating = true;
      const cm = parseFloat(cmInput.value);
      if (!isNaN(cm) && cm >= 0) {
        const m = cm / 100;
        const dec = mToFt(m);
        decInput.value = dec.toFixed(4);
        mInput.value = m.toFixed(4);
        mmInput.value = (m * 1000).toFixed(1);
        updateFtIn(dec);
      }
      updating = false;
    });

    // From mm
    mmInput.addEventListener('input', () => {
      if (updating) return;
      updating = true;
      const mm = parseFloat(mmInput.value);
      if (!isNaN(mm) && mm >= 0) {
        const m = mm / 1000;
        const dec = mToFt(m);
        decInput.value = dec.toFixed(4);
        mInput.value = m.toFixed(4);
        cmInput.value = (m * 100).toFixed(2);
        updateFtIn(dec);
      }
      updating = false;
    });
  }

  function updateFromDecimal(dec) {
    updateFtIn(dec);
    updateMetric(dec);
  }

  function updateFtIn(dec) {
    const totalInches = dec * 12;
    const feet = Math.floor(totalInches / 12);
    const remInches = totalInches - feet * 12;
    const wholeInches = Math.floor(remInches);
    const fracInches = remInches - wholeInches;

    $('cv-feet').value = feet;
    $('cv-inches').value = wholeInches;

    // Find nearest 1/16
    const nearest16 = Math.round(fracInches * 16);
    const fracVal = nearest16 / 16;
    // Find matching option
    const sel = $('cv-frac');
    let bestMatch = 0;
    for (let i = 0; i < sel.options.length; i++) {
      if (Math.abs(parseFloat(sel.options[i].value) - fracVal) < 0.001) {
        bestMatch = i;
        break;
      }
    }
    sel.selectedIndex = bestMatch;

    // Update display string
    $('cv-display').textContent = decToFtIn(dec);
  }

  function updateMetric(dec) {
    const m = ftToM(dec);
    $('cv-meters').value = m.toFixed(4);
    $('cv-cm').value = (m * 100).toFixed(2);
    $('cv-mm').value = (m * 1000).toFixed(1);
  }

  // Init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
