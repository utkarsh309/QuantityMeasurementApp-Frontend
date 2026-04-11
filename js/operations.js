// operations.js – all quantity operation logic
// API Base is defined in auth.js (shared)

// ─── UNITS & ENDPOINTS ────────────────────────────────────────
const UNITS = {
  LENGTH: {
    units: ['INCHES', 'FEET', 'YARDS', 'CENTIMETERS'],
    display: { INCHES: 'Inches (in)', FEET: 'Feet (ft)', YARDS: 'Yards (yd)', CENTIMETERS: 'Centimeters (cm)' }
  },
  TEMPERATURE: {
    units: ['CELSIUS', 'FAHRENHEIT'],
    display: { CELSIUS: 'Celsius (°C)', FAHRENHEIT: 'Fahrenheit (°F)' }
  },
  VOLUME: {
    units: ['LITER', 'MILLILITER', 'GALLON'],
    display: { LITER: 'Liter (L)', MILLILITER: 'Milliliter (mL)', GALLON: 'Gallon (gal)' }
  },
  WEIGHT: {
    units: ['KILOGRAM', 'GRAM', 'POUND'],
    display: { KILOGRAM: 'Kilograms (kg)', GRAM: 'Grams (g)', POUND: 'Pounds (lb)' }
  }
};

// Microservices API Gateway endpoints
const ENDPOINTS = {
  CONVERT:  '/api/v1/quantities/convert',
  COMPARE:  '/api/v1/quantities/compare',
  ADD:      '/api/v1/quantities/add',
  SUBTRACT: '/api/v1/quantities/subtract',
  DIVIDE:   '/api/v1/quantities/divide'
};

// ─── STATE ────────────────────────────────────────────────────
let currentType = 'LENGTH';
let currentOp   = 'CONVERT';
let opHistory   = [];

// ─── ALERT (page-level) ───────────────────────────────────────
function showDashAlert(msg, type = 'error') {
  showAlert('dashAlert', msg, type);
}

// ─── POPULATE UNIT SELECTS ────────────────────────────────────
function populateSelects(ids, type) {
  const cfg = UNITS[type];
  ids.forEach((id, idx) => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '';
    cfg.units.forEach(u => sel.add(new Option(cfg.display[u], u)));
    if (idx > 0 && cfg.units.length > 1) sel.selectedIndex = 1;
  });
}

function refreshAllSelects(type) {
  populateSelects(['cv-fromUnit', 'cv-toUnit'], type);
  populateSelects(['cmp-unit1',  'cmp-unit2'],  type);
  populateSelects(['add-unit1',  'add-unit2'],  type);
  populateSelects(['sub-unit1',  'sub-unit2'],  type);
  populateSelects(['div-unit1',  'div-unit2'],  type);
}

// ─── SELECT TYPE / OPERATION ──────────────────────────────────
function selectType(type) {
  if (!UNITS[type]) return;
  currentType = type;
  document.querySelectorAll('.type-card')
    .forEach(c => c.classList.toggle('active', c.dataset.type === type));
  refreshAllSelects(type);
  clearAllResults();
  document.getElementById('dashAlert').classList.remove('show');
}

function selectOp(op) {
  currentOp = op;
  document.querySelectorAll('.op-tab')
    .forEach(t => t.classList.toggle('active', t.dataset.op === op));
  document.querySelectorAll('.op-panel')
    .forEach(p => p.classList.toggle('active', p.id === `panel-${op}`));
  document.getElementById('dashAlert').classList.remove('show');
}

function clearAllResults() {
  ['CONVERT', 'ADD', 'SUBTRACT', 'DIVIDE'].forEach(op => {
    document.getElementById(`res-${op}`)?.classList.remove('show');
  });
  const cmp = document.getElementById('res-COMPARE');
  if (cmp) cmp.className = 'compare-badge';
  const cvTo = document.getElementById('cv-toVal');
  if (cvTo) cvTo.value = '';
}

// ─── CORE API CALL ────────────────────────────────────────────
// Attaches JWT Bearer token if available
async function callAPI(opKey, body) {
  const token = getToken();

  // Build headers - add Authorization ONLY if token exists
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = `${API_BASE}${ENDPOINTS[opKey]}`;

  try {
    const res = await fetch(url, {
      method:  'POST',
      headers: headers,
      body:    JSON.stringify(body)
    });

    // 401 = session expired / invalid token
    if (res.status === 401 || res.status === 403) {
      clearToken();
      showDashAlert('Session expired. Please login again.');
      setTimeout(() => { window.location.href = 'login.html'; }, 1400);
      return null;
    }

    const rawText = await res.text();
    let data;
    try { data = JSON.parse(rawText); }
    catch { data = { result: rawText, error: !res.ok }; }

    if (!res.ok) {
      const msg = data?.message || data?.errorMessage || `Server error ${res.status}`;
      showDashAlert(msg);
      return null;
    }

    // Check backend error flag in QuantityMeasurementDTO
    if (data.error === true) {
      showDashAlert(data.errorMessage || 'Operation failed on server.');
      return null;
    }

    return data;
  } catch (err) {
    showDashAlert('Cannot reach server. Make sure the backend is running on port 8090.');
    return null;
  }
}

// ─── BUILD REQUEST BODIES ─────────────────────────────────────
function bodyConvert(value, unit, targetUnit) {
  return {
    operand1:      { value, unit, type: currentType },
    targetUnit,
    operationType: 'CONVERT'
  };
}

function bodyTwoOp(val1, unit1, val2, unit2, opType) {
  return {
    operand1:      { value: val1, unit: unit1, type: currentType },
    operand2:      { value: val2, unit: unit2, type: currentType },
    operationType: opType
  };
}

// ─── SHOW RESULTS ─────────────────────────────────────────────
function showResult(op, text) {
  const panel = document.getElementById(`res-${op}`);
  const valEl = document.getElementById(`resVal-${op}`);
  if (!panel || !valEl) return;
  valEl.textContent = text;
  panel.classList.add('show');
}

function showCompare(resultStr) {
  const badge  = document.getElementById('res-COMPARE');
  const iconEl = document.getElementById('cmp-icon');
  const textEl = document.getElementById('cmp-text');
  const upper  = (resultStr || '').toUpperCase();

  let cls = 'equal', icon = '🟰';
  if (upper.includes('GREATER') || upper.includes('LARGER') || upper.includes('MORE')) {
    cls = 'greater'; icon = '⬆️';
  } else if (upper.includes('LESS') || upper.includes('SMALLER') || upper.includes('LOWER')) {
    cls = 'less'; icon = '⬇️';
  }

  badge.className = `compare-badge ${cls} show`;
  iconEl.textContent = icon;
  textEl.textContent = resultStr;
}

// ─── LOCAL HISTORY ────────────────────────────────────────────
function addHistory(op, type, fromStr, resultStr) {
  opHistory.unshift({
    op, type, fromStr, resultStr,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
  if (opHistory.length > 30) opHistory.pop();
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById('historyList');
  if (!list) return;
  if (opHistory.length === 0) {
    list.innerHTML = `<div class="history-empty"><div class="empty-icon">📋</div><div>No operations yet. Start calculating!</div></div>`;
    return;
  }
  list.innerHTML = opHistory.map(h => `
    <div class="history-item">
      <span class="h-op-badge op-${h.op}">${h.op}</span>
      <span class="h-type-badge t-${h.type}">${h.type}</span>
      <span class="h-detail">
        <span class="h-from">${h.fromStr}</span>
        <span class="h-sep">→</span>
        <span class="h-to">${h.resultStr}</span>
      </span>
      <span class="h-time">${h.time}</span>
    </div>`).join('');
}

// ─── OPERATION HANDLERS ───────────────────────────────────────

async function handleConvert() {
  const rawVal   = document.getElementById('cv-fromVal').value.trim();
  const fromUnit = document.getElementById('cv-fromUnit').value;
  const toUnit   = document.getElementById('cv-toUnit').value;
  const val      = parseFloat(rawVal);

  if (rawVal === '' || isNaN(val)) { showDashAlert('Enter a valid number.'); return; }

  if (fromUnit === toUnit) {
    document.getElementById('cv-toVal').value = val;
    showResult('CONVERT', `${val} ${toUnit}`);
    addHistory('CONVERT', currentType, `${val} ${fromUnit}`, `${val} ${toUnit}`);
    return;
  }

  const btn = document.getElementById('btn-CONVERT');
  setLoading(btn, true);
  document.getElementById('res-CONVERT').classList.remove('show');

  const data = await callAPI('CONVERT', bodyConvert(val, fromUnit, toUnit));
  setLoading(btn, false);
  if (!data) return;

  const resultStr = data.result || '';
  document.getElementById('cv-toVal').value = resultStr;
  showResult('CONVERT', resultStr);
  addHistory('CONVERT', currentType, `${val} ${fromUnit}`, resultStr);
}

async function handleCompare() {
  const val1  = parseFloat(document.getElementById('cmp-val1').value);
  const unit1 = document.getElementById('cmp-unit1').value;
  const val2  = parseFloat(document.getElementById('cmp-val2').value);
  const unit2 = document.getElementById('cmp-unit2').value;

  if (isNaN(val1) || isNaN(val2)) { showDashAlert('Enter valid numbers for both quantities.'); return; }

  const btn = document.getElementById('btn-COMPARE');
  setLoading(btn, true);
  document.getElementById('res-COMPARE').className = 'compare-badge';

  const data = await callAPI('COMPARE', bodyTwoOp(val1, unit1, val2, unit2, 'COMPARE'));
  setLoading(btn, false);
  if (!data) return;

  const resultStr = data.result || 'Result unavailable';
  showCompare(resultStr);
  addHistory('COMPARE', currentType, `${val1} ${unit1} vs ${val2} ${unit2}`, resultStr);
}

async function handleAdd() {
  const val1  = parseFloat(document.getElementById('add-val1').value);
  const unit1 = document.getElementById('add-unit1').value;
  const val2  = parseFloat(document.getElementById('add-val2').value);
  const unit2 = document.getElementById('add-unit2').value;

  if (isNaN(val1) || isNaN(val2)) { showDashAlert('Enter valid numbers for both quantities.'); return; }

  const btn = document.getElementById('btn-ADD');
  setLoading(btn, true);
  document.getElementById('res-ADD').classList.remove('show');

  const data = await callAPI('ADD', bodyTwoOp(val1, unit1, val2, unit2, 'ADD'));
  setLoading(btn, false);
  if (!data) return;

  const resultStr = data.result || '';
  showResult('ADD', resultStr);
  addHistory('ADD', currentType, `${val1} ${unit1} + ${val2} ${unit2}`, resultStr);
}

async function handleSubtract() {
  const val1  = parseFloat(document.getElementById('sub-val1').value);
  const unit1 = document.getElementById('sub-unit1').value;
  const val2  = parseFloat(document.getElementById('sub-val2').value);
  const unit2 = document.getElementById('sub-unit2').value;

  if (isNaN(val1) || isNaN(val2)) { showDashAlert('Enter valid numbers for both quantities.'); return; }

  const btn = document.getElementById('btn-SUBTRACT');
  setLoading(btn, true);
  document.getElementById('res-SUBTRACT').classList.remove('show');

  const data = await callAPI('SUBTRACT', bodyTwoOp(val1, unit1, val2, unit2, 'SUBTRACT'));
  setLoading(btn, false);
  if (!data) return;

  const resultStr = data.result || '';
  showResult('SUBTRACT', resultStr);
  addHistory('SUBTRACT', currentType, `${val1} ${unit1} − ${val2} ${unit2}`, resultStr);
}

async function handleDivide() {
  const val1  = parseFloat(document.getElementById('div-val1').value);
  const unit1 = document.getElementById('div-unit1').value;
  const val2  = parseFloat(document.getElementById('div-val2').value);
  const unit2 = document.getElementById('div-unit2').value;

  if (isNaN(val1) || isNaN(val2)) { showDashAlert('Enter valid numbers for both quantities.'); return; }
  if (val2 === 0) { showDashAlert('Cannot divide by zero.'); return; }

  const btn = document.getElementById('btn-DIVIDE');
  setLoading(btn, true);
  document.getElementById('res-DIVIDE').classList.remove('show');

  const data = await callAPI('DIVIDE', bodyTwoOp(val1, unit1, val2, unit2, 'DIVIDE'));
  setLoading(btn, false);
  if (!data) return;

  const resultStr = data.result || '';
  showResult('DIVIDE', resultStr);
  addHistory('DIVIDE', currentType, `${val1} ${unit1} ÷ ${val2} ${unit2}`, resultStr);
}

// ─── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Type cards
  document.querySelectorAll('.type-card')
    .forEach(c => c.addEventListener('click', () => selectType(c.dataset.type)));

  // Operation tabs
  document.querySelectorAll('.op-tab')
    .forEach(t => t.addEventListener('click', () => selectOp(t.dataset.op)));

  // Action buttons
  document.getElementById('btn-CONVERT') ?.addEventListener('click', handleConvert);
  document.getElementById('btn-COMPARE') ?.addEventListener('click', handleCompare);
  document.getElementById('btn-ADD')     ?.addEventListener('click', handleAdd);
  document.getElementById('btn-SUBTRACT')?.addEventListener('click', handleSubtract);
  document.getElementById('btn-DIVIDE')  ?.addEventListener('click', handleDivide);

  // Enter key in any input field
  document.querySelectorAll('.val-input:not([readonly])').forEach(inp => {
    inp.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const handlers = {
        CONVERT: handleConvert, COMPARE: handleCompare,
        ADD: handleAdd, SUBTRACT: handleSubtract, DIVIDE: handleDivide
      };
      handlers[currentOp]?.();
    });
  });

  // Clear history button
  document.getElementById('btnClearHist')?.addEventListener('click', () => {
    opHistory = [];
    renderHistory();
  });

  // Bootstrap
  selectType('LENGTH');
  selectOp('CONVERT');
  renderHistory();
});
