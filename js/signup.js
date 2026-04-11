// signup.js – handles the signup / register form

document.addEventListener('DOMContentLoaded', () => {

  // If already logged in, skip signup page
  if (isLoggedIn()) {
    window.location.href = 'operations.html';
    return;
  }

  const form = document.getElementById('signupForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username  = document.getElementById('username').value.trim();
    const password  = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;
    const btn = document.getElementById('signupBtn');

    if (!username || !password || !password2) {
      showAlert('signupAlert', 'Please fill in all fields.');
      return;
    }

    if (username.length < 3) {
      showAlert('signupAlert', 'Username must be at least 3 characters.');
      return;
    }

    if (password.length < 6) {
      showAlert('signupAlert', 'Password must be at least 6 characters.');
      return;
    }

    if (password !== password2) {
      showAlert('signupAlert', 'Passwords do not match.');
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
        showAlert('signupAlert', 'Account created! Redirecting to login...', 'success');
        setTimeout(() => { window.location.href = 'login.html'; }, 1200);
      } else {
        const msg = data.message || data.error || 'Registration failed. Try a different username.';
        showAlert('signupAlert', msg);
        setLoading(btn, false);
      }
    } catch (err) {
      showAlert('signupAlert', 'Cannot reach server. Make sure the backend is running on port 8090.');
      setLoading(btn, false);
    }
  });

});
