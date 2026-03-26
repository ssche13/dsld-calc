/* ── Concrete & Material Calculator ── */

/* Slab and Column use the original single-entry pattern */
function calcConcrete(mode) {
  let cubicFt = 0;

  if (mode === 'slab') {
    const len   = +$('sl-len').value;
    const wid   = +$('sl-wid').value;
    const thick = +$('sl-thick').value;
    if (!len || !wid || !thick || len <= 0 || wid <= 0 || thick <= 0)
      return alert('Enter Length, Width, and Thickness.');
    cubicFt = len * wid * (thick / 12);

  } else if (mode === 'column') {
    const dia    = +$('co-dia').value;
    const height = +$('co-height').value;
    if (!dia || !height || dia <= 0 || height <= 0)
      return alert('Enter Diameter and Height.');
    const radiusFt = (dia / 2) / 12;
    cubicFt = Math.PI * radiusFt ** 2 * (height / 12);
  }

  const waste = document.querySelector('#' + mode + '-waste')?.checked ? 1.10 : 1.0;
  const adjCuFt = cubicFt * waste;
  const cubicYd = adjCuFt / 27;
  const bags80  = Math.ceil(cubicYd * 45);
  const bags60  = Math.ceil(cubicYd * 60);

  $(mode + '-cuft').textContent  = adjCuFt.toFixed(2) + ' cu ft';
  $(mode + '-cuyd').textContent  = cubicYd.toFixed(2) + ' cu yd';
  $(mode + '-b80').textContent   = bags80 + ' bags';
  $(mode + '-b60').textContent   = bags60 + ' bags';
  $(mode + '-wastelbl').textContent = waste > 1 ? '(includes 10% waste)' : '';
  show(mode + '-res');
}

/* ── Multi-Footing System ── */

const FOOTING_PRESETS = [
  { label: 'Custom', w: 0, d: 0 },
  { label: '12" × 12"', w: 12, d: 12 },
  { label: '16" × 8"',  w: 16, d: 8 },
  { label: '18" × 12"', w: 18, d: 12 },
  { label: '20" × 10"', w: 20, d: 10 },
  { label: '24" × 12"', w: 24, d: 12 },
];

let ftRowId = 0;

function ftAddRow(presetIdx) {
  ftRowId++;
  const container = document.getElementById('ft-rows');
  const row = document.createElement('div');
  row.className = 'dyn-row';
  row.id = 'ft-row-' + ftRowId;

  let presetOptions = FOOTING_PRESETS.map((p, i) =>
    '<option value="' + i + '"' + (i === (presetIdx || 0) ? ' selected' : '') + '>' + p.label + '</option>'
  ).join('');

  const preset = presetIdx ? FOOTING_PRESETS[presetIdx] : FOOTING_PRESETS[0];
  const wVal = preset.w || '';
  const dVal = preset.d || '';
  const customHidden = preset.w > 0 ? ' hidden' : '';

  row.innerHTML =
    '<div class="dyn-row-fields">' +
      '<div class="field"><label>Size Preset</label>' +
        '<select class="ft-preset" onchange="ftPresetChange(this)">' + presetOptions + '</select></div>' +
      '<div class="field"><label>Length (ft)</label>' +
        '<input type="number" class="ft-len" step="0.01" min="0" inputmode="decimal" placeholder="40"></div>' +
      '<div class="field ft-custom' + customHidden + '"><label>Width (in)</label>' +
        '<input type="number" class="ft-wid" step="0.5" min="0" inputmode="decimal" value="' + wVal + '" placeholder="16"></div>' +
      '<div class="field ft-custom' + customHidden + '"><label>Depth (in)</label>' +
        '<input type="number" class="ft-dep" step="0.5" min="0" inputmode="decimal" value="' + dVal + '" placeholder="8"></div>' +
    '</div>' +
    '<button class="dyn-row-del" onclick="ftDelRow(\'' + row.id + '\')" title="Remove">&times;</button>';
  container.appendChild(row);
}

function ftPresetChange(sel) {
  const row = sel.closest('.dyn-row');
  const idx = parseInt(sel.value);
  const preset = FOOTING_PRESETS[idx];
  const customs = row.querySelectorAll('.ft-custom');

  if (preset.w > 0) {
    row.querySelector('.ft-wid').value = preset.w;
    row.querySelector('.ft-dep').value = preset.d;
    customs.forEach(el => el.classList.add('hidden'));
  } else {
    row.querySelector('.ft-wid').value = '';
    row.querySelector('.ft-dep').value = '';
    customs.forEach(el => el.classList.remove('hidden'));
  }
}

function ftDelRow(id) {
  const row = document.getElementById(id);
  if (row) row.remove();
}

function ftClearAll() {
  document.getElementById('ft-rows').innerHTML = '';
  document.getElementById('footing-res').style.display = 'none';
}

function calcFootings() {
  const rows = document.querySelectorAll('#ft-rows .dyn-row');
  if (rows.length === 0) return alert('Add at least one footing.');

  const waste = document.getElementById('footing-waste')?.checked ? 1.10 : 1.0;
  let totalCuFt = 0;
  const details = [];

  rows.forEach(row => {
    const presetIdx = parseInt(row.querySelector('.ft-preset').value);
    const preset = FOOTING_PRESETS[presetIdx];
    const len = parseFloat(row.querySelector('.ft-len').value) || 0;
    let wid, dep;

    if (preset.w > 0) {
      wid = preset.w;
      dep = preset.d;
    } else {
      wid = parseFloat(row.querySelector('.ft-wid').value) || 0;
      dep = parseFloat(row.querySelector('.ft-dep').value) || 0;
    }

    if (len <= 0 || wid <= 0 || dep <= 0) return;

    const cuFt = len * (wid / 12) * (dep / 12);
    totalCuFt += cuFt;
    details.push({ len, wid, dep, cuFt, label: preset.w > 0 ? preset.label : wid + '"×' + dep + '"' });
  });

  if (details.length === 0) return alert('Enter valid dimensions for at least one footing.');

  const adjCuFt = totalCuFt * waste;
  const cubicYd = adjCuFt / 27;
  const bags80  = Math.ceil(cubicYd * 45);
  const bags60  = Math.ceil(cubicYd * 60);

  // Build results
  let html = '<div class="rsect"><div class="rtitle">Footing Breakdown</div>';
  details.forEach((d, i) => {
    html += '<div class="rrow"><span class="rl">' + d.label + ' × ' + d.len + ' ft</span>' +
      '<span class="rv">' + d.cuFt.toFixed(2) + ' cu ft</span></div>';
  });
  html += '</div>';

  html += '<div class="rsect"><div class="rtitle">Totals</div>';
  html += '<div class="rrow"><span class="rl">Total Volume</span><span class="rv">' + adjCuFt.toFixed(2) + ' cu ft</span></div>';
  html += '<div class="rrow"><span class="rl">Cubic Yards</span><span class="rv hi">' + cubicYd.toFixed(2) + ' cu yd</span></div>';
  html += '<div class="rrow"><span class="rl">80 lb Bags</span><span class="rv">' + bags80 + ' bags</span></div>';
  html += '<div class="rrow"><span class="rl">60 lb Bags</span><span class="rv">' + bags60 + ' bags</span></div>';
  if (waste > 1) html += '<p class="fnote">(includes 10% waste)</p>';
  html += '</div>';

  document.getElementById('footing-res').innerHTML = html;
  show('footing-res');
}
