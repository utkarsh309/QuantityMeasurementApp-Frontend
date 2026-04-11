// history.js – fetches and displays operation history from the API Gateway

document.addEventListener('DOMContentLoaded', () => {
  const token = getToken();

  // If not logged in, show the "Sign in to view history" card
  if (!token) {
    document.getElementById('historyLoginPrompt').style.display = 'flex';
    document.getElementById('historyContent').style.display = 'none';
    return;
  }

  // Logged in: show the history UI
  document.getElementById('historyLoginPrompt').style.display = 'none';
  document.getElementById('historyContent').style.display = 'block';

  // Default: load all operations
  loadHistory('all');

  // Tab filter buttons
  document.querySelectorAll('.hist-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.hist-filter-btn')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadHistory(btn.dataset.op);
    });
  });
});

// ─── FETCH HISTORY FROM API ───────────────────────────────────
async function loadHistory(operation) {
  const token = getToken();
  if (!token) return;

  const listEl    = document.getElementById('serverHistoryList');
  const loadingEl = document.getElementById('historyLoading');

  // Show loading
  listEl.style.display    = 'none';
  loadingEl.style.display = 'flex';

  try {
    // The endpoint requires: GET /api/v1/quantities/history/{operation}
    const url = `${API_BASE}/api/v1/quantities/history/${operation}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // 401 = token expired
    if (res.status === 401 || res.status === 403) {
      clearToken();
      window.location.href = 'login.html';
      return;
    }

    const data = await res.json().catch(() => []);
    loadingEl.style.display = 'none';
    listEl.style.display    = 'block';
    renderServerHistory(Array.isArray(data) ? data : []);

  } catch (err) {
    loadingEl.style.display = 'none';
    listEl.style.display    = 'block';
    listEl.innerHTML = `
      <div class="history-empty">
        <div class="empty-icon">⚠️</div>
        <div>Could not reach server. Make sure the backend is running.</div>
      </div>`;
  }
}

// ─── RENDER HISTORY ITEMS ─────────────────────────────────────
function renderServerHistory(items) {
  const listEl = document.getElementById('serverHistoryList');

  if (!items || items.length === 0) {
    listEl.innerHTML = `
      <div class="history-empty">
        <div class="empty-icon">📋</div>
        <div>No history found for this operation.</div>
      </div>`;
    return;
  }

  listEl.innerHTML = items.map(h => {
    // Flexible field mapping — adapt to whatever the backend returns
    const op      = h.operation  || h.operationType || h.op   || 'OP';
    const type    = h.type       || (h.operand1?.type)         || '—';
    const result  = h.result     || h.resultValue              || '—';
    const op1     = h.operand1   ? `${h.operand1.value} ${h.operand1.unit}` : '—';
    const op2     = h.operand2   ? `${h.operand2.value} ${h.operand2.unit}` : null;
    const fromStr = op2 ? `${op1} &amp; ${op2}` : op1;

    return `
      <div class="history-item">
        <span class="h-op-badge op-${op}">${op}</span>
        <span class="h-type-badge t-${type}">${type}</span>
        <span class="h-detail">
          <span class="h-from">${fromStr}</span>
          <span class="h-sep">→</span>
          <span class="h-to">${result}</span>
        </span>
      </div>`;
  }).join('');
}
