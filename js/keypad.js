/* ── Construction Master Keypad Calculator ── */

(function () {
  // State
  let display = '0';
  let entry = 0;         // current entry in decimal feet
  let accumulator = 0;   // running total in decimal feet
  let pendingOp = null;  // pending operation (+, -, ×, ÷)
  let mode = 'std';      // 'std' | 'feet' | 'inch' | 'frac'
  let feetPart = 0;
  let inchPart = 0;
  let fracNum = 0;
  let fracDen = 0;
  let memory = 0;
  let justCalculated = false;
  let newEntry = false; // true after operator, before first digit of next operand

  // Pitch/Rise/Run state
  let pitchVal = null;
  let riseVal = null;
  let runVal = null;

  const dispMain = () => document.getElementById('kp-main');
  const dispSub = () => document.getElementById('kp-sub');
  const dispMode = () => document.getElementById('kp-mode');
  const memInd = () => document.getElementById('kp-mem');

  // Are we building a feet-inches value?
  function isFtInMode() {
    return feetPart > 0 || inchPart > 0 || fracNum > 0;
  }

  function updateDisplay() {
    const el = dispMain();
    const sub = dispSub();
    const modeEl = dispMode();
    if (!el) return;

    if (isFtInMode() || mode === 'inch' || mode === 'frac') {
      // Show feet-inches entry with any pending standard digits
      let s = '';
      if (feetPart > 0) s += feetPart + "'";
      if (inchPart > 0 || mode === 'inch' || mode === 'frac') {
        s += ' ' + inchPart;
        if (fracNum > 0 && fracDen > 0) s += ' ' + fracNum + '/' + fracDen;
        s += '"';
      }
      // Show pending digits being typed (will become inches)
      if (mode === 'std' && display !== '0') {
        s += ' ' + display + '_';
      }
      el.textContent = s || '0';
      const dec = getCurrentValue();
      sub.textContent = dec.toFixed(4) + ' ft';
      modeEl.textContent = 'FEET-INCH';
    } else {
      el.textContent = display;
      sub.textContent = display !== '0' ? decToFtIn(parseFloat(display) || 0) : '';
      modeEl.textContent = '';
    }

    const mi = memInd();
    if (mi) mi.className = 'mem-indicator' + (memory !== 0 ? ' active' : '');
  }

  function updateFtInDisplay() {
    // Force feet-inches display after unit key press
    updateDisplay();
  }

  function getCurrentValue() {
    if (mode === 'std') {
      return parseFloat(display) || 0;
    }
    return feetPart + (inchPart + (fracDen ? fracNum / fracDen : 0)) / 12;
  }

  function setDisplayValue(val) {
    mode = 'std';
    display = formatNum(val);
    entry = val;
    feetPart = 0;
    inchPart = 0;
    fracNum = 0;
    fracDen = 0;
    updateDisplay();
  }

  function formatNum(n) {
    if (Math.abs(n) >= 1e10) return n.toExponential(4);
    const s = parseFloat(n.toFixed(8)).toString();
    return s;
  }

  function resetEntry() {
    display = '0';
    mode = 'std';
    feetPart = 0;
    inchPart = 0;
    fracNum = 0;
    fracDen = 0;
  }

  // Key handler
  window.kpPress = function (key) {
    // Number keys
    if (/^[0-9]$/.test(key) || key === '00' || key === '.') {
      if (justCalculated && !pendingOp) {
        accumulator = 0;
        resetEntry();
        justCalculated = false;
        newEntry = false;
      }
      if (justCalculated && pendingOp) {
        resetEntry();
        justCalculated = false;
        newEntry = false;
      }
      if (newEntry) {
        resetEntry();
        newEntry = false;
      }

      if (mode === 'frac') {
        handleFracDigit(key);
      } else if (mode === 'inch') {
        if (key === '.') return;
        inchPart = inchPart * 10 + parseInt(key);
        if (inchPart > 99) inchPart = parseInt(key);
      } else if (mode === 'feet') {
        if (key === '.') return;
        feetPart = feetPart * 10 + parseInt(key);
      } else {
        // Standard mode
        if (display === '0' && key !== '.' && key !== '00') {
          display = key;
        } else if (key === '.' && display.includes('.')) {
          return;
        } else {
          display += key;
        }
      }
      updateDisplay();
      return;
    }

    // Unit keys
    if (key === 'Feet') {
      if (newEntry) { resetEntry(); newEntry = false; }
      if (mode === 'std' && display !== '0') {
        feetPart = parseInt(display) || 0;
      }
      display = '0';
      mode = 'std'; // back to std so next digits go into display for inches
      justCalculated = false;
      updateFtInDisplay();
      return;
    }
    if (key === 'Inch') {
      if (newEntry) { resetEntry(); newEntry = false; }
      if (mode === 'std' && display !== '0') {
        inchPart = parseInt(display) || 0;
      }
      display = '0';
      mode = 'inch'; // lock into inch mode for display
      justCalculated = false;
      updateFtInDisplay();
      return;
    }
    if (key === 'Frac') {
      mode = 'frac';
      fracNum = 0;
      fracDen = 0;
      justCalculated = false;
      updateDisplay();
      return;
    }

    // Operations
    if (['+', '-', '×', '÷'].includes(key)) {
      const val = getCurrentValue();
      if (pendingOp && !justCalculated) {
        accumulator = doOp(accumulator, val, pendingOp);
      } else {
        accumulator = val;
      }
      pendingOp = key;
      resetEntry();
      justCalculated = false;
      newEntry = true;
      setDisplayValue(accumulator);
      return;
    }

    if (key === '=') {
      const val = getCurrentValue();
      if (pendingOp) {
        const result = doOp(accumulator, val, pendingOp);
        setDisplayValue(result);
        accumulator = result;
        pendingOp = null;
      }
      justCalculated = true;
      return;
    }

    if (key === 'C') {
      resetEntry();
      accumulator = 0;
      pendingOp = null;
      justCalculated = false;
      pitchVal = null;
      riseVal = null;
      runVal = null;
      updateDisplay();
      return;
    }

    if (key === 'CE') {
      resetEntry();
      justCalculated = false;
      updateDisplay();
      return;
    }

    if (key === '⌫') {
      if (mode === 'std' && display.length > 1) {
        display = display.slice(0, -1);
      } else if (mode === 'std') {
        display = '0';
      }
      updateDisplay();
      return;
    }

    if (key === '%') {
      const val = getCurrentValue();
      setDisplayValue(val / 100);
      return;
    }

    // Memory
    if (key === 'M+') {
      memory += getCurrentValue();
      updateDisplay();
      return;
    }
    if (key === 'Rcl') {
      setDisplayValue(memory);
      return;
    }
    if (key === 'Stor') {
      memory = getCurrentValue();
      updateDisplay();
      return;
    }

    // Construction functions
    if (key === 'Pitch') {
      pitchVal = getCurrentValue();
      dispMode().textContent = 'PITCH = ' + pitchVal;
      solvePRR();
      return;
    }
    if (key === 'Rise') {
      riseVal = getCurrentValue();
      dispMode().textContent = 'RISE = ' + formatNum(riseVal);
      solvePRR();
      return;
    }
    if (key === 'Run') {
      runVal = getCurrentValue();
      dispMode().textContent = 'RUN = ' + formatNum(runVal);
      solvePRR();
      return;
    }
    if (key === 'Diag') {
      // Diagonal: if rise and run are set, compute diagonal
      if (riseVal !== null && runVal !== null) {
        const diag = Math.sqrt(riseVal ** 2 + runVal ** 2);
        setDisplayValue(diag);
        dispMode().textContent = 'DIAG';
      }
      return;
    }
    if (key === 'Hip/V') {
      // Hip/Valley: if run and pitch set, compute hip length
      if (runVal !== null && pitchVal !== null) {
        const rise = runVal * pitchVal / 12;
        const planLen = runVal * Math.SQRT2;
        const hipLen = Math.sqrt(planLen ** 2 + rise ** 2);
        setDisplayValue(hipLen);
        dispMode().textContent = 'HIP/VAL';
      }
      return;
    }

    // Trig and conversion
    if (key === 'Sine') { setDisplayValue(Math.sin(getCurrentValue() * Math.PI / 180)); dispMode().textContent = 'SIN'; return; }
    if (key === 'Cos') { setDisplayValue(Math.cos(getCurrentValue() * Math.PI / 180)); dispMode().textContent = 'COS'; return; }
    if (key === 'Tan') { setDisplayValue(Math.tan(getCurrentValue() * Math.PI / 180)); dispMode().textContent = 'TAN'; return; }
    if (key === 'm') { setDisplayValue(getCurrentValue() * 0.3048); dispMode().textContent = 'METERS'; return; }
    if (key === 'Yds') { setDisplayValue(getCurrentValue() / 3); dispMode().textContent = 'YARDS'; return; }
    if (key === 'Circ') {
      const r = getCurrentValue();
      setDisplayValue(2 * Math.PI * r);
      dispMode().textContent = 'CIRCUMF';
      return;
    }
    if (key === 'Arc') {
      setDisplayValue(getCurrentValue() * Math.PI / 180);
      dispMode().textContent = 'RADIANS';
      return;
    }

    // Stair key — navigate to stair calculator
    if (key === 'Stair') {
      location.hash = '#stair';
      return;
    }
  };

  function handleFracDigit(key) {
    if (key === '.' || key === '00') return;
    const d = parseInt(key);
    if (fracDen === 0) {
      // Building numerator
      if (fracNum === 0) {
        fracNum = d;
      } else {
        // Two digit numerator, treat as num/den
        fracDen = d;
      }
    } else if (fracDen < 100) {
      fracDen = fracDen * 10 + d;
    }
  }

  function doOp(a, b, op) {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      default: return b;
    }
  }

  function solvePRR() {
    // If two of three (pitch, rise, run) are known, solve for the third
    const known = (pitchVal !== null ? 1 : 0) + (riseVal !== null ? 1 : 0) + (runVal !== null ? 1 : 0);
    if (known < 2) return;

    if (pitchVal !== null && runVal !== null && riseVal === null) {
      riseVal = runVal * pitchVal / 12;
      setDisplayValue(riseVal);
      dispMode().textContent = 'RISE (solved)';
    } else if (pitchVal !== null && riseVal !== null && runVal === null) {
      runVal = riseVal / (pitchVal / 12);
      setDisplayValue(runVal);
      dispMode().textContent = 'RUN (solved)';
    } else if (riseVal !== null && runVal !== null && pitchVal === null) {
      pitchVal = (riseVal / runVal) * 12;
      setDisplayValue(pitchVal);
      dispMode().textContent = 'PITCH (solved)';
    }
  }

  // Init display on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateDisplay);
  } else {
    updateDisplay();
  }
})();
