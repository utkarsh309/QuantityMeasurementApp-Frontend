// ─── CONFIG ────────────────────────────────────────────────────
// API Gateway — used for all /auth/** and /api/** calls
const API_BASE = 'http://localhost:8090';

// Auth Service DIRECT URL — used ONLY for Google OAuth redirect.
// The /oauth2/authorization/google endpoint is handled by Spring Security
// inside the auth-service itself and is NOT routed through the API Gateway.
// ⚠️ Change this port to match your auth-service port (check your auth-service's server.port).
const AUTH_SERVICE_BASE = 'http://localhost:8081';

// ─── TOKEN HELPERS ─────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('jwt_token');
}

function getUsername() {
  return localStorage.getItem('username') || 'User';
}

function saveToken(token, username) {
  localStorage.setItem('jwt_token', token);
  localStorage.setItem('username', username);
}

function clearToken() {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('username');
}

function isLoggedIn() {
  return !!getToken();
}

function logout() {
  clearToken();
  window.location.href = 'index.html';
}

// ─── NAVBAR: update right side based on login state ────────────
function updateNavbar() {
  const navRight = document.getElementById('navRight');
  if (!navRight) return;

  if (isLoggedIn()) {
    const username = getUsername();
    navRight.innerHTML = `
      <div class="nav-avatar">${username.charAt(0).toUpperCase()}</div>
      <span class="nav-username">${username}</span>
      <button class="btn-nav btn-nav-ghost" id="logoutBtn">Logout</button>
    `;
    document.getElementById('logoutBtn').addEventListener('click', logout);
  } else {
    navRight.innerHTML = `
      <a href="login.html" class="btn-nav btn-nav-outline">Login</a>
      <a href="signup.html" class="btn-nav btn-nav-solid">Sign Up</a>
    `;
  }
}

// ─── MARK ACTIVE NAV LINK ──────────────────────────────────────
function markActiveNavLink() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === page) link.classList.add('active');
  });
}

// ─── ALERT HELPER ─────────────────────────────────────────────
function showAlert(elId, message, type = 'error') {
  const el = document.getElementById(elId);
  if (!el) return;
  el.className = `alert alert-${type} show`;
  el.querySelector('.alert-msg').textContent = message;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 5000);
}

// ─── BUTTON LOADING STATE ─────────────────────────────────────
function setLoading(btn, loading) {
  if (!btn) return;
  btn.disabled = loading;
  btn.classList.toggle('loading', loading);
}

// ─── RUN ON EVERY PAGE ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
  markActiveNavLink();
});
