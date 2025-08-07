// utils.js

/**
 * Show alert message on screen.
 * @param {string} type - 'success' | 'error' | 'info'
 * @param {string} message - Text to display
 */
export function showAlert(type, message) {
  // Remove existing alert if any
  const existingAlert = document.querySelector('.custom-alert');
  if (existingAlert) existingAlert.remove();

  const alertDiv = document.createElement('div');
  alertDiv.className = `custom-alert alert-${type}`;
  alertDiv.textContent = message;

  // Style alert (can be customized or moved to CSS)
  alertDiv.style.position = 'fixed';
  alertDiv.style.top = '20px';
  alertDiv.style.left = '50%';
  alertDiv.style.transform = 'translateX(-50%)';
  alertDiv.style.padding = '15px 25px';
  alertDiv.style.borderRadius = '8px';
  alertDiv.style.color = '#fff';
  alertDiv.style.fontSize = '1.1rem';
  alertDiv.style.zIndex = '9999';
  alertDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  alertDiv.style.opacity = '0.95';

  switch (type) {
    case 'success':
      alertDiv.style.backgroundColor = '#28a745';
      break;
    case 'error':
      alertDiv.style.backgroundColor = '#dc3545';
      break;
    case 'info':
      alertDiv.style.backgroundColor = '#0dcaf0';
      break;
    default:
      alertDiv.style.backgroundColor = '#333';
  }

  document.body.appendChild(alertDiv);

  // Auto remove after 4 seconds
  setTimeout(() => {
    alertDiv.remove();
  }, 4000);
}

/**
 * Simple debounce helper to prevent rapid repeated calls.
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
export function debounce(func, wait = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
