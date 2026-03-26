/* ── Roof Framing Calculator ── */

function calcCommon() {
  const run = +$('cr-run').value, pitch = +$('cr-pitch').value;
  if (!run || !pitch || run <= 0 || pitch <= 0) return alert('Enter Run and Pitch.');
  const rise = run * pitch / 12;
  const len  = Math.sqrt(run ** 2 + rise ** 2);
  const slope = Math.atan(pitch / 12);
  $('cr-rise').textContent  = ft(rise);
  $('cr-len').textContent   = ft(len);
  $('cr-ang').textContent   = dg(slope);
  $('cr-plumb').textContent = dg(slope);
  $('cr-seat').textContent  = (90 - slope * 180 / Math.PI).toFixed(2) + '°';
  $('cr-unit').textContent  = (len / run).toFixed(4) + ' ft';
  show('cr-res');
}

function calcEqualHip() {
  const run = +$('ep-run').value, pitch = +$('ep-pitch').value;
  if (!run || !pitch || run <= 0 || pitch <= 0) return alert('Enter Run and Pitch.');
  const rise    = run * pitch / 12;
  const planLen = run * Math.SQRT2;
  const actLen  = Math.sqrt(planLen ** 2 + rise ** 2);
  const slope   = Math.atan(rise / planLen);
  const backing = Math.atan(Math.sin(Math.PI / 4) * (pitch / 12));
  $('ep-rise').textContent  = ft(rise);
  $('ep-plan').textContent  = ft(planLen);
  $('ep-len').textContent   = ft(actLen);
  $('ep-slope').textContent = dg(slope);
  $('ep-plumb').textContent = dg(slope);
  $('ep-cheek').textContent = '35.26° (constant for equal pitch)';
  $('ep-back').textContent  = dg(backing);
  $('ep-unit').textContent  = (actLen / run).toFixed(4) + ' ft / ft run';
  show('ep-res');
}

function calcUneq() {
  const runA = +$('up-runA').value, pA = +$('up-pA').value;
  const runB = +$('up-runB').value, pB = +$('up-pB').value;
  if ([runA, pA, runB, pB].some(v => !v || v <= 0)) return alert('Enter all four values.');

  const tA = runA / pB;
  const tB = runB / pA;
  const t  = Math.min(tA, tB);

  const xEnd    = t * pA;
  const yEnd    = t * pB;
  const planLen = t * Math.sqrt(pA ** 2 + pB ** 2);
  const rise    = t * pA * pB / 12;
  const actLen  = Math.sqrt(planLen ** 2 + rise ** 2);
  const slope   = Math.atan2(rise, planLen);

  const angA = Math.atan2(pB, pA);
  const angB = Math.atan2(pA, pB);

  const backA = Math.atan(Math.sin(angA) * Math.tan(Math.atan(pA / 12)));
  const backB = Math.atan(Math.sin(angB) * Math.tan(Math.atan(pB / 12)));

  const ridA = runA * pA / 12;
  const ridB = runB * pB / 12;
  const diff = Math.abs(ridA - ridB);
  const who  = ridA > ridB ? ' (A higher)' : ridB > ridA ? ' (B higher)' : ' (equal)';
  const EPS  = 0.001;
  const term = Math.abs(tA - tB) < EPS ? 'Both ridges (equal height)' : tB < tA ? 'Ridge B' : 'Ridge A';

  const comA = Math.sqrt(runA ** 2 + (runA * pA / 12) ** 2);
  const comB = Math.sqrt(runB ** 2 + (runB * pB / 12) ** 2);

  $('up-angA').textContent  = dg(angA);
  $('up-angB').textContent  = dg(angB);
  $('up-plan').textContent  = ft(planLen);
  $('up-xEnd').textContent  = ft(xEnd);
  $('up-yEnd').textContent  = ft(yEnd);
  $('up-term').textContent  = term;
  $('up-rise').textContent  = ft(rise);
  $('up-len').textContent   = ft(actLen);
  $('up-slope').textContent = dg(slope);
  $('up-plumb').textContent = dg(slope);
  $('up-backA').textContent = dg(backA);
  $('up-backB').textContent = dg(backB);
  $('up-ridA').textContent  = ft(ridA);
  $('up-ridB').textContent  = ft(ridB);
  $('up-diff').textContent  = ft(diff) + who;
  $('up-comA').textContent  = ft(comA);
  $('up-comB').textContent  = ft(comB);
  show('up-res');
}
