// login.js – handles the login form

document.addEventListener('DOMContentLoaded', () => {

  // If already logged in, skip login page
  if (isLoggedIn()) {
    window.location.href = 'operations.html';
    return;
  }

  // ── Handle OAuth token redirect from backend ──────────────
  // Spring Security redirects back to this page with ?token=... after Google login
  const urlParams = new URLSearchParams(window.location.search);
  const oauthToken = urlParams.get('token') || urlParams.get('jwt');
  const oauthName  = urlParams.get('name')  || urlParams.get('email') || 'Google User';

  if (oauthToken) {
    saveToken(oauthToken, oauthName);
    // Clean the URL then redirect
    window.history.replaceState({}, document.title, window.location.pathname);
    window.location.href = 'operations.html';
    return;
  }

  // ── Google OAuth button ───────────────────────────────────
  // Must hit auth-service DIRECTLY — the gateway does not proxy
  // Spring Security's /oauth2/authorization/* endpoints.
  document.getElementById('googleLoginBtn')?.addEventListener('click', () => {
    window.location.href = `${AUTH_SERVICE_BASE}/oauth2/authorization/google`;
  });

  // ── Username / Password form ──────────────────────────────
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const btn = document.getElementById('loginBtn');

    if (!username || !password) {
      showAlert('loginAlert', 'Please fill in all fields.');
      return;
    }

    setLoading(btn, true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const token = data.token || data.jwt || data.accessToken || data.access_token;

        if (!token) {
          showAlert('loginAlert', 'Login succeeded but no token received.');
          setLoading(btn, false);
          return;
        }

        saveToken(token, username);
        showAlert('loginAlert', 'Login successful! Redirecting...', 'success');

        setTimeout(() => { window.location.href = 'operations.html'; }, 800);
      } else {
        const msg = data.message || data.error || 'Invalid username or password.';
        showAlert('loginAlert', msg);
        setLoading(btn, false);
      }
    } catch (err) {
      showAlert('loginAlert', 'Cannot reach server. Make sure the backend is running on port 8090.');
      setLoading(btn, false);
    }
  });

});
