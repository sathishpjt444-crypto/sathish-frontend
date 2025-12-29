/* ========================================
   WELCOME SCREEN JAVASCRIPT
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');

  startBtn.addEventListener('click', () => {
    // Transition to home screen
    const container = document.getElementById('welcomeContainer');
    container.style.opacity = '0';
    container.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
      window.location.href = "home.html";
    }, 500);
  });

  // Check if user is logged in
  const username = localStorage.getItem('username');
  if (!username) {
    // Redirect to login if not authenticated
    window.location.href = '/';
  }
});
