/* ── Roof Area on Slope Calculator ── */

let raRowId = 0;

function raAddRow() {
  raRowId++;
  const container = document.getElementById('ra-rows');
  const row = document.createElement('div');
  row.className = 'dyn-row';
  row.id = 'ra-row-' + raRowId;
  row.innerHTML =
    '<div class="dyn-row-fields">' +
      '<div class="field"><label>Length (ft)</label>' +
        '<input type="number" class="ra-len" step="0.01" min="0" inputmode="decimal" placeholder="40"></div>' +
      '<div class="field"><label>Width (ft)</label>' +
        '<input type="number" class="ra-wid" step="0.01" min="0" inputmode="decimal" placeholder="25"></div>' +
      '<div class="field"><label>Pitch (/12)</label>' +
        '<input type="number" class="ra-pitch" step="0.5" min="0" inputmode="decimal" placeholder="8"></div>' +
    '</div>' +
    '<button class="dyn-row-del" onclick="raDelRow(\'' + row.id + '\')" title="Remove">&times;</button>';
  container.appendChild(row);
}

function raDelRow(id) {
  const row = document.getElementById(id);
  if (row) row.remove();
}

function calcRoofArea() {
  const rows = document.querySelectorAll('#ra-rows .dyn-row');
  if (rows.length === 0) return alert('Add at least one area.');

  let totalFlat = 0, totalSloped = 0;
  const results = [];

  rows.forEach(row => {
    const len = parseFloat(row.querySelector('.ra-len').value) || 0;
    const wid = parseFloat(row.querySelector('.ra-wid').value) || 0;
    const pitch = parseFloat(row.querySelector('.ra-pitch').value) || 0;

    if (len <= 0 || wid <= 0) return;

    const flatArea = len * wid;
    const slopeFactor = Math.sqrt(1 + (pitch / 12) ** 2);
    const slopedArea = flatArea * slopeFactor;

    totalFlat += flatArea;
    totalSloped += slopedArea;

    results.push({ len, wid, pitch, flatArea, slopeFactor, slopedArea });
  });

  if (results.length === 0) return alert('Enter valid dimensions.');

  // Build results HTML
  let html = '<div class="rsect"><div class="rtitle">Area Breakdown</div>';
  results.forEach((r, i) => {
    html += '<div class="rrow"><span class="rl">' + r.len + '\' × ' + r.wid + '\' @ ' + r.pitch + '/12</span>' +
      '<span class="rv">' + r.slopedArea.toFixed(1) + ' sq ft</span></div>';
  });
  html += '</div>';

  html += '<div class="rsect"><div class="rtitle">Totals</div>';
  html += '<div class="rrow"><span class="rl">Total Flat Area</span><span class="rv">' + totalFlat.toFixed(1) + ' sq ft</span></div>';
  html += '<div class="rrow"><span class="rl">Total Sloped Area</span><span class="rv hi">' + totalSloped.toFixed(1) + ' sq ft</span></div>';
  html += '<div class="rrow"><span class="rl">Roofing Squares (100 sq ft)</span><span class="rv hi">' + (totalSloped / 100).toFixed(2) + ' squares</span></div>';

  // Slope factors used
  const uniqueFactors = [...new Set(results.map(r => r.pitch))];
  uniqueFactors.forEach(p => {
    const sf = Math.sqrt(1 + (p / 12) ** 2);
    html += '<div class="rrow"><span class="rl">Slope factor @ ' + p + '/12</span><span class="rv">' + sf.toFixed(4) + '</span></div>';
  });
  html += '</div>';

  // Waste estimate
  html += '<div class="rsect"><div class="rtitle">Material Estimate (with 10% waste)</div>';
  const withWaste = totalSloped * 1.10;
  html += '<div class="rrow"><span class="rl">Sloped Area + 10%</span><span class="rv">' + withWaste.toFixed(1) + ' sq ft</span></div>';
  html += '<div class="rrow"><span class="rl">Squares to Order</span><span class="rv hi">' + Math.ceil(withWaste / 100) + ' squares</span></div>';
  html += '</div>';

  document.getElementById('ra-results').innerHTML = html;
  show('ra-results');
}
