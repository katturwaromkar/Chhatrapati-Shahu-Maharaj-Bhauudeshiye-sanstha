/* ==========================================================================
   Chhatrapati Shahu Maharaj Bahuuddeshiya Sanstha
   Web Security, Anti-Spam & Input Sanitization Guard Module
   ========================================================================== */

(function () {
  'use strict';

  // Global Input Sanitizer Against Cross-Site Scripting (XSS)
  window.sanitizeInput = function (input) {
    if (typeof input !== 'string') return '';
    return input.replace(/[&<>"']/g, function (match) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return map[match];
    });
  };

  // Form Anti-Spam Rate Limiting & Input Sanitization
  function initFormProtection() {
    let lastSubmitTime = 0;
    const MIN_SUBMIT_INTERVAL = 2000; // 2 seconds between submits

    document.addEventListener('submit', function (e) {
      const now = Date.now();
      if (now - lastSubmitTime < MIN_SUBMIT_INTERVAL) {
        e.preventDefault();
        if (window.showToast) {
          window.showToast('कृपया पुन्हा प्रयत्न करण्यापूर्वी काही सेकंद थांबा.', 'warning');
        }
        return false;
      }
      lastSubmitTime = now;

      const form = e.target;
      if (form && form.querySelectorAll) {
        const inputs = form.querySelectorAll('input[type="text"], input[type="tel"], textarea');
        inputs.forEach(input => {
          input.value = window.sanitizeInput(input.value);
        });
      }
    }, true);
  }

  // Initialize security guards when DOM is ready
  document.addEventListener('DOMContentLoaded', function () {
    initFormProtection();
  });
})();

