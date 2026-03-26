/* ── Stair Layout Calculator (with Landing Support) ── */

function stairToggleLandings() {
  const n = parseInt($('st-landings').value) || 0;
  const landingFields = document.getElementById('st-landing-fields');
  if (landingFields) {
    landingFields.style.display = n > 0 ? 'block' : 'none';
  }
}

function calcStair() {
  const totalRise   = +$('st-rise').value;        // inches
  const targetRiser = +$('st-riser').value;        // inches
  const treadDepth  = +$('st-tread').value;        // inches
  const nosing      = +$('st-nosing').value || 0;  // inches
  const headroom    = +$('st-headroom').value;     // inches
  const numLandings = parseInt($('st-landings').value) || 0;
  const landingDepth = +$('st-landingdepth').value || 36; // inches

  if (!totalRise || totalRise <= 0) return alert('Enter Total Rise.');
  if (!targetRiser || targetRiser <= 0) return alert('Enter Target Riser Height.');
  if (!treadDepth || treadDepth <= 0) return alert('Enter Tread Depth.');

  // Calculate number of risers
  const numRisers = Math.round(totalRise / targetRiser);
  if (numRisers <= 0) return alert('Invalid riser count.');
  const actualRiser = totalRise / numRisers;
  const numTreads = numRisers - 1;

  // Number of flights
  const numFlights = numLandings + 1;

  // Total run includes landing depths
  const stairRun = numTreads * treadDepth;
  const landingRun = numLandings * landingDepth;
  const totalRun = stairRun + landingRun;

  // Per-flight calculations
  const risersPerFlight = Math.floor(numRisers / numFlights);
  const extraRisers = numRisers % numFlights;
  const flights = [];

  for (let i = 0; i < numFlights; i++) {
    const flightRisers = risersPerFlight + (i < extraRisers ? 1 : 0);
    const flightTreads = flightRisers - (i < numFlights - 1 ? 0 : 1);
    // Last flight has one fewer tread (top riser lands on floor)
    const actualTreads = i === numFlights - 1 ? flightRisers - 1 : flightRisers;
    const flightRise = flightRisers * actualRiser;
    const flightRun = actualTreads * treadDepth;
    const flightStringerLen = Math.sqrt(flightRun ** 2 + flightRise ** 2);
    const flightAngle = Math.atan2(flightRise, flightRun);

    flights.push({
      risers: flightRisers,
      treads: actualTreads,
      rise: flightRise,
      run: flightRun,
      stringerLen: flightStringerLen,
      angle: flightAngle
    });
  }

  // Overall stringer (without landings — just stair portion)
  const stringerLen = Math.sqrt(stairRun ** 2 + totalRise ** 2);
  const stringerAngle = Math.atan2(totalRise, stairRun);

  // Code compliance (IRC R311.7)
  const riserOK = actualRiser >= 4.0 && actualRiser <= 7.75;
  const treadOK = treadDepth >= 10.0;
  const riseRunSum = actualRiser + treadDepth;
  const sumOK = riseRunSum >= 17 && riseRunSum <= 18;

  let headroomNote = '—';
  if (headroom > 0) {
    const minRequired = 80;
    headroomNote = headroom.toFixed(1) + '" ';
    headroomNote += headroom >= minRequired ? '(OK — meets 80" min)' : '(BELOW 80" minimum)';
  }

  // Convert to feet
  const totalRiseFt = totalRise / 12;
  const totalRunFt = totalRun / 12;
  const stringerLenFt = stringerLen / 12;

  // Display results
  $('st-numrisers').textContent  = numRisers;
  $('st-numtreads').textContent  = numTreads;
  $('st-actriser').textContent   = actualRiser.toFixed(3) + '"';
  $('st-actriser').className     = 'rv' + (riserOK ? ' ok' : ' warn');
  $('st-totalrun').textContent   = totalRun.toFixed(2) + '" (' + ft(totalRunFt) + ')';
  $('st-strlen').textContent     = stringerLen.toFixed(2) + '" (' + ft(stringerLenFt) + ')';
  $('st-strang').textContent     = dg(stringerAngle);
  $('st-riserchk').textContent   = actualRiser.toFixed(3) + '"';
  $('st-riserchk').className     = 'rv' + (riserOK ? ' ok' : ' warn');
  $('st-treadchk').textContent   = treadDepth.toFixed(1) + '"';
  $('st-treadchk').className     = 'rv' + (treadOK ? ' ok' : ' warn');
  $('st-riserun').textContent    = riseRunSum.toFixed(2) + '"';
  $('st-riserun').className      = 'rv' + (sumOK ? ' ok' : (riseRunSum > 18 ? ' warn' : ''));
  $('st-headclr').textContent    = headroomNote;

  // Feet-inches display
  $('st-riseftin').textContent = decToFtIn(totalRiseFt);
  $('st-runftin').textContent  = decToFtIn(totalRunFt);
  $('st-strftin').textContent  = decToFtIn(stringerLenFt);

  // Landing info
  const landingSection = document.getElementById('st-landing-res');
  if (numLandings > 0 && landingSection) {
    let html = '<div class="rtitle">Flight Breakdown (' + numFlights + ' flights, ' + numLandings + ' landing' + (numLandings > 1 ? 's' : '') + ')</div>';
    flights.forEach((f, i) => {
      html += '<div class="rrow"><span class="rl">Flight ' + (i + 1) + '</span>' +
        '<span class="rv">' + f.risers + 'R / ' + f.treads + 'T — ' +
        f.stringerLen.toFixed(1) + '" stringer</span></div>';
    });
    html += '<div class="rrow"><span class="rl">Landing depth × ' + numLandings + '</span>' +
      '<span class="rv">' + landingDepth.toFixed(0) + '" each (' + ft(landingRun / 12) + ' total)</span></div>';
    html += '<div class="rrow"><span class="rl">Total horizontal span</span>' +
      '<span class="rv hi">' + ft(totalRunFt) + '</span></div>';
    landingSection.innerHTML = html;
    landingSection.style.display = 'block';
  } else if (landingSection) {
    landingSection.style.display = 'none';
  }

  show('st-res');
}
