//  DTO 
//
//  REQUEST  → QuantityInputDTO
//    { operand1: { value, unit, type },
//      operand2: { value, unit, type },   ← only for arithmetic/compare
//      targetUnit: "FEET",                ← only for CONVERT
//      operationType: "CONVERT" }         ← OperationType enum
//
//  RESPONSE → QuantityMeasurementDTO
//    { operation, operand1, operand2,
//      result: "30.48 FEET",              ← STRING e.g. "12.0 INCHES"
//      error: false,
//      errorMessage: null }
//
//  ENDPOINTS (QuantityMeasurementController):
//    POST /api/v1/quantities/convert
//    POST /api/v1/quantities/compare
//    POST /api/v1/quantities/add
//    POST /api/v1/quantities/subtract
//    POST /api/v1/quantities/divide
//
//  ENUMS matched exactly:
//    LengthUnit:      FEET, INCHES, YARDS, CENTIMETERS
//    TemperatureUnit: CELSIUS, FAHRENHEIT
//    VolumeUnit:      LITER, MILLILITER, GALLON
//    WeightUnit:      KILOGRAM, GRAM, POUND


const API_BASE = 'http://localhost:8081';

// Units
const UNITS = {
  LENGTH: {
    units: ['INCHES', 'FEET', 'YARDS', 'CENTIMETERS'],
    display: { INCHES:'Inches (in)', FEET:'Feet (ft)', YARDS:'Yards (yd)', CENTIMETERS:'Centimeters (cm)' }
  },
  TEMPERATURE: {
    units: ['CELSIUS', 'FAHRENHEIT'],
    display: { CELSIUS:'Celsius (°C)', FAHRENHEIT:'Fahrenheit (°F)' }
  },
  VOLUME: {
    units: ['LITER', 'MILLILITER', 'GALLON'],
    display: { LITER:'Liter (L)', MILLILITER:'Milliliter (mL)', GALLON:'Gallon (gal)' }
  },
  // NEW: Added Weight object 
  WEIGHT: {
    units: ['KILOGRAM', 'GRAM', 'POUND'],
    display: { KILOGRAM:'Kilograms (kg)', GRAM:'Grams (g)', POUND:'Pounds (lb)' }
  }
};

//  Endpoint map 
const ENDPOINTS = {
  CONVERT:  '/api/v1/quantities/convert',
  COMPARE:  '/api/v1/quantities/compare',
  ADD:      '/api/v1/quantities/add',
  SUBTRACT: '/api/v1/quantities/subtract',
  DIVIDE:   '/api/v1/quantities/divide'
};

//  State 
let currentType = 'LENGTH';
let currentOp   = 'CONVERT';
let opHistory   = [];

// Auth
function getToken() {
  const t = localStorage.getItem('jwt_token');
  if (!t) { window.location.href = 'index.html'; return null; }
  return t;
}
function logout() {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('username');
  window.location.href = 'index.html';
}

// Alert
function showAlert(msg, type = 'error') {
  const el = document.getElementById('dashAlert');
  if (!el) return;
  el.className = `alert alert-${type} show`;
  el.querySelector('.alert-msg').textContent = msg;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 5000);
}

// Populate unit selects for a given panel/type 
// ids: array of select element IDs to populate
function populateSelects(ids, type) {
  const cfg = UNITS[type];
  ids.forEach((id, idx) => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '';
    cfg.units.forEach(u => sel.add(new Option(cfg.display[u], u)));
    // Default: second select picks index 1 so from != to
    if (idx > 0 && cfg.units.length > 1) sel.selectedIndex = 1;
  });
}

// Repopulate ALL selects for current type 
function refreshAllSelects(type) {
  populateSelects(['cv-fromUnit','cv-toUnit'],    type);
  populateSelects(['cmp-unit1','cmp-unit2'],      type);
  populateSelects(['add-unit1','add-unit2'],      type);
  populateSelects(['sub-unit1','sub-unit2'],      type);
  populateSelects(['div-unit1','div-unit2'],      type);
}

//Select measurement type 
function selectType(type) {
  if (!UNITS[type]) return;
  currentType = type;
  document.querySelectorAll('.type-card')
    .forEach(c => c.classList.toggle('active', c.dataset.type === type));
  refreshAllSelects(type);
  clearAllResults();
  document.getElementById('dashAlert').classList.remove('show');
}

//  Select operation tab 
function selectOp(op) {
  currentOp = op;
  document.querySelectorAll('.op-tab')
    .forEach(t => t.classList.toggle('active', t.dataset.op === op));
  document.querySelectorAll('.op-panel')
    .forEach(p => p.classList.toggle('active', p.id === `panel-${op}`));
  document.getElementById('dashAlert').classList.remove('show');
}

//  Hide all result panels 
function clearAllResults() {
  ['CONVERT','ADD','SUBTRACT','DIVIDE'].forEach(op => {
    document.getElementById(`res-${op}`)?.classList.remove('show');
  });
  const cmp = document.getElementById('res-COMPARE');
  if (cmp) { cmp.className = 'compare-badge'; }

  // Clear read-only fields
  const cvTo = document.getElementById('cv-toVal');
  if (cvTo) cvTo.value = '';
}

//  History 
function addHistory(op, type, fromStr, toStr, resultStr) {
  opHistory.unshift({
    op, type, fromStr, toStr, resultStr,
    time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
  });
  if (opHistory.length > 30) opHistory.pop();
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById('historyList');
  if (opHistory.length === 0) {
    list.innerHTML = `<div class="history-empty"><div class="empty-icon">📋</div><div>No operations yet.</div></div>`;
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

//  Core API call 
async function callAPI(opKey, body) {
  const token = getToken();
  if (!token) return null;

  const url = `${API_BASE}${ENDPOINTS[opKey]}`;

  console.group(`📤 ${opKey}`);
  console.log('URL  :', url);
  console.log('Body :', JSON.stringify(body, null, 2));
  console.groupEnd();

  const res = await fetch(url, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  console.log('📥 Status:', res.status);

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('jwt_token');
    showAlert('Session expired. Redirecting to login...', 'error');
    setTimeout(() => window.location.href = 'index.html', 1400);
    return null;
  }

  const rawText = await res.text();
  console.log('📥 Raw response:', rawText);

  let data;
  try { data = JSON.parse(rawText); }
  catch { data = { result: rawText, error: !res.ok }; }

  if (!res.ok) {
    const msg = data?.message || data?.error || data?.errorMessage || `Server error ${res.status}`;
    showAlert(msg, 'error');
    return null;
  }

  // QuantityMeasurementDTO: check error flag first
  if (data.error === true) {
    showAlert(data.errorMessage || 'Operation failed on server.', 'error');
    return null;
  }

  return data;   // { operation, operand1, operand2, result: "30.48 FEET", error, errorMessage }
}

// ── Build single-operand body (CONVERT) ───────────────────────────
function bodyConvert(value, unit, targetUnit) {
  return {
    operand1:      { value, unit, type: currentType },
    targetUnit,
    operationType: 'CONVERT'
  };
}

// ── Build two-operand body (arithmetic / compare) ─────────────────
function bodyTwoOp(val1, unit1, val2, unit2, opType) {
  return {
    operand1:      { value: val1, unit: unit1, type: currentType },
    operand2:      { value: val2, unit: unit2, type: currentType },
    operationType: opType
  };
}

// ── Show result panel ─────────────────────────────────────────────
function showResult(op, text) {
  const panel = document.getElementById(`res-${op}`);
  const valEl = document.getElementById(`resVal-${op}`);
  if (!panel || !valEl) return;
  valEl.textContent = text;
  panel.classList.add('show');
}

// ── Show compare badge ─────────────────────────────────────────────
// QuantityMeasurementDTO.result for compare will be something like
// "EQUAL", "GREATER", "LESS", or a descriptive string from your service.
function showCompare(resultStr) {
  const badge  = document.getElementById('res-COMPARE');
  const iconEl = document.getElementById('cmp-icon');
  const textEl = document.getElementById('cmp-text');

  const upper = (resultStr || '').toUpperCase();
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

// ─────────────────────────────────────────────────────────────────
//  HANDLERS

//  CONVERT 
async function handleConvert() {
  const rawVal   = document.getElementById('cv-fromVal').value.trim();
  const fromUnit = document.getElementById('cv-fromUnit').value;
  const toUnit   = document.getElementById('cv-toUnit').value;
  const val      = parseFloat(rawVal);

  if (rawVal === '' || isNaN(val)) { showAlert('Enter a valid number.'); return; }

  // Same-unit shortcut
  if (fromUnit === toUnit) {
    document.getElementById('cv-toVal').value = val;
    showResult('CONVERT', `${val} ${toUnit}`);
    addHistory('CONVERT', currentType, `${val} ${fromUnit}`, '', `${val} ${toUnit}`);
    return;
  }

  const btn = document.getElementById('btn-CONVERT');
  setLoading(btn, true);
  document.getElementById('res-CONVERT').classList.remove('show');

  const data = await callAPI('CONVERT', bodyConvert(val, fromUnit, toUnit));
  setLoading(btn, false);
  if (!data) return;

  // result is a String like "30.48 FEET"
  const resultStr = data.result || '';
  document.getElementById('cv-toVal').value = resultStr;
  showResult('CONVERT', resultStr);
  addHistory('CONVERT', currentType, `${val} ${fromUnit}`, toUnit, resultStr);
}

//  COMPARE 
async function handleCompare() {
  const val1   = parseFloat(document.getElementById('cmp-val1').value);
  const unit1  = document.getElementById('cmp-unit1').value;
  const val2   = parseFloat(document.getElementById('cmp-val2').value);
  const unit2  = document.getElementById('cmp-unit2').value;

  if (isNaN(val1) || isNaN(val2)) { showAlert('Enter valid numbers for both quantities.'); return; }

  const btn = document.getElementById('btn-COMPARE');
  setLoading(btn, true);
  document.getElementById('res-COMPARE').className = 'compare-badge';

  const data = await callAPI('COMPARE', bodyTwoOp(val1, unit1, val2, unit2, 'COMPARE'));
  setLoading(btn, false);
  if (!data) return;

  const resultStr = data.result || 'Result unavailable';
  showCompare(resultStr);
  addHistory('COMPARE', currentType, `${val1} ${unit1}`, `${val2} ${unit2}`, resultStr);
}

// ADD 
async function handleAdd() {
  const val1  = parseFloat(document.getElementById('add-val1').value);
  const unit1 = document.getElementById('add-unit1').value;
  const val2  = parseFloat(document.getElementById('add-val2').value);
  const unit2 = document.getElementById('add-unit2').value;

  if (isNaN(val1) || isNaN(val2)) { showAlert('Enter valid numbers for both quantities.'); return; }

  const btn = document.getElementById('btn-ADD');
  setLoading(btn, true);
  document.getElementById('res-ADD').classList.remove('show');

  const data = await callAPI('ADD', bodyTwoOp(val1, unit1, val2, unit2, 'ADD'));
  setLoading(btn, false);
  if (!data) return;

  const resultStr = data.result || '';
  showResult('ADD', resultStr);
  addHistory('ADD', currentType, `${val1} ${unit1} + ${val2} ${unit2}`, '', resultStr);
}

// SUBTRACT
async function handleSubtract() {
  const val1  = parseFloat(document.getElementById('sub-val1').value);
  const unit1 = document.getElementById('sub-unit1').value;
  const val2  = parseFloat(document.getElementById('sub-val2').value);
  const unit2 = document.getElementById('sub-unit2').value;

  if (isNaN(val1) || isNaN(val2)) { showAlert('Enter valid numbers for both quantities.'); return; }

  const btn = document.getElementById('btn-SUBTRACT');
  setLoading(btn, true);
  document.getElementById('res-SUBTRACT').classList.remove('show');

  const data = await callAPI('SUBTRACT', bodyTwoOp(val1, unit1, val2, unit2, 'SUBTRACT'));
  setLoading(btn, false);
  if (!data) return;

  const resultStr = data.result || '';
  showResult('SUBTRACT', resultStr);
  addHistory('SUBTRACT', currentType, `${val1} ${unit1} − ${val2} ${unit2}`, '', resultStr);
}

// DIVIDE 
async function handleDivide() {
  const val1  = parseFloat(document.getElementById('div-val1').value);
  const unit1 = document.getElementById('div-unit1').value;
  const val2  = parseFloat(document.getElementById('div-val2').value);
  const unit2 = document.getElementById('div-unit2').value;

  if (isNaN(val1) || isNaN(val2)) { showAlert('Enter valid numbers for both quantities.'); return; }
  if (val2 === 0) { showAlert('Cannot divide by zero.'); return; }

  const btn = document.getElementById('btn-DIVIDE');
  setLoading(btn, true);
  document.getElementById('res-DIVIDE').classList.remove('show');

  const data = await callAPI('DIVIDE', bodyTwoOp(val1, unit1, val2, unit2, 'DIVIDE'));
  setLoading(btn, false);
  if (!data) return;

  const resultStr = data.result || '';
  showResult('DIVIDE', resultStr);
  addHistory('DIVIDE', currentType, `${val1} ${unit1} ÷ ${val2} ${unit2}`, '', resultStr);
}

// Utility: toggle button loading state 
function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.classList.toggle('loading', loading);
}

//  INIT
document.addEventListener('DOMContentLoaded', () => {

  const token = getToken();
  if (!token) return;

  // Header
  const username = localStorage.getItem('username') || 'User';
  const nameEl   = document.getElementById('headerUsername');
  const avatarEl = document.getElementById('userAvatar');
  if (nameEl)   nameEl.textContent   = username;
  if (avatarEl) avatarEl.textContent = username.charAt(0).toUpperCase();

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', logout);

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

  // Enter key on any value input
  document.querySelectorAll('.val-input:not([readonly])').forEach(inp => {
    inp.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const handlers = { CONVERT: handleConvert, COMPARE: handleCompare, ADD: handleAdd, SUBTRACT: handleSubtract, DIVIDE: handleDivide };
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

  console.log('✅ Dashboard ready — user:', username);
  console.log('ℹ️  API base:', API_BASE);
});