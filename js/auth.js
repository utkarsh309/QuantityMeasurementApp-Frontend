//CONFIG
const API_BASE = 'http://localhost:8081';

// UTILITIES 
function showAlert(el, message, type = 'error') {
  el.className = `alert alert-${type} show`;
  el.querySelector('.alert-msg').textContent = message;
  setTimeout(() => el.classList.remove('show'), 5000);
}

function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.classList.toggle('loading', loading);
}

// LOGIN 
async function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const alertEl  = document.getElementById('alert');
  const btn      = document.getElementById('loginBtn');

  if (!username || !password) {
    showAlert(alertEl, 'Please fill in all fields.', 'error');
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
        showAlert(alertEl, 'Login succeeded but no token received. Check backend.', 'error');
        setLoading(btn, false);
        return;
      }

      localStorage.setItem('jwt_token', token);
      localStorage.setItem('username', username);
      showAlert(alertEl, 'Login successful! Redirecting...', 'success');

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 800);
    } else {
      const msg = data.message || data.error || 'Invalid username or password.';
      showAlert(alertEl, msg, 'error');
      setLoading(btn, false);
    }
  } catch (err) {
    console.error(err);
    showAlert(alertEl, 'Cannot reach server. Make sure the backend is running on port 8081.', 'error');
    setLoading(btn, false);
  }
}

//  REGISTER 
async function handleRegister(e) {
  e.preventDefault();

  const username  = document.getElementById('username').value.trim();
  const password  = document.getElementById('password').value;
  const password2 = document.getElementById('password2')?.value;
  const alertEl   = document.getElementById('alert');
  const btn       = document.getElementById('registerBtn');

  if (!username || !password) {
    showAlert(alertEl, 'Please fill in all fields.', 'error');
    return;
  }

  if (username.length < 3) {
    showAlert(alertEl, 'Username must be at least 3 characters.', 'error');
    return;
  }

  if (password.length < 6) {
    showAlert(alertEl, 'Password must be at least 6 characters.', 'error');
    return;
  }

  if (password2 !== undefined && password !== password2) {
    showAlert(alertEl, 'Passwords do not match.', 'error');
    return;
  }

  setLoading(btn, true);

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok || res.status === 201) {
      showAlert(alertEl, 'Account created! Redirecting to login...', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1200);
    } else {
      const msg = data.message || data.error || 'Registration failed. Try a different username.';
      showAlert(alertEl, msg, 'error');
      setLoading(btn, false);
    }
  } catch (err) {
    console.error(err);
    showAlert(alertEl, 'Cannot reach server. Make sure the backend is running on port 8081.', 'error');
    setLoading(btn, false);
  }
}

// INIT 
document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Handle OAuth Token from URL (If Backend redirects back here)
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token') || urlParams.get('jwt');
  const email = urlParams.get('email') || urlParams.get('name');

  if (token) {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('username', email || 'Google User');
    
    // Clean URL and redirect
    window.history.replaceState({}, document.title, window.location.pathname);
    window.location.href = 'dashboard.html';
    return;
  }

  // 2. Redirect if already logged in via LocalStorage
  if (localStorage.getItem('jwt_token') && window.location.pathname.includes('index')) {
    window.location.href = 'dashboard.html';
    return;
  }

  // 3. Attach Listeners
  const loginForm    = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const googleBtns   = document.querySelectorAll('.btn-google'); // Handle all Google buttons

  if (loginForm)    loginForm.addEventListener('submit', handleLogin);
  if (registerForm) registerForm.addEventListener('submit', handleRegister);
  
  // Trigger OAuth2 Flow
  googleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Standard Spring Security OAuth2 Endpoint
      window.location.href = `${API_BASE}/oauth2/authorization/google`;
    });
  });
});