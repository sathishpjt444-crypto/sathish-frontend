/* ========================================
   LOGIN PAGE JAVASCRIPT
   ======================================== */

const API_BASE_URL = 'https://ai-doc-backend-31kk.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validation
    if (!username || !password) {
      showError('usernameError', 'Both fields are required');
      return;
    }

    try {
      // Attempt login via API
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save user info to session/local storage
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('username', data.username);
        localStorage.setItem('token', data.token);

        // Redirect to welcome screen
        window.location.href = '/welcome.html';
      } else {
        showError('usernameError', data.detail || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('usernameError', 'Connection error. Please try again.');
    }
  });

  function showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    errorEl.textContent = message;
    errorEl.classList.add('show');

    setTimeout(() => {
      errorEl.classList.remove('show');
    }, 5000);
  }
});
