/* ==========================================================================
   Chhatrapati Shahu Maharaj Bahuuddeshiya Sanstha
   Web Security & Anti-Content Theft Module
   ========================================================================== */

(function () {
  'use strict';

  // 1. Disable Right-Click Context Menu
  document.addEventListener('contextmenu', function (e) {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      return false;
    }
  });

  // 2. Disable Keyboard Shortcuts for Copying, DevTools, Inspect, and Saving
  document.addEventListener('keydown', function (e) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlCmd = isMac ? e.metaKey : e.ctrlKey;

    // F12 key (DevTools)
    if (e.keyCode === 123) {
      e.preventDefault();
      return false;
    }

    if (ctrlCmd) {
      const key = e.key ? e.key.toLowerCase() : '';
      
      // Ctrl+C (Copy), Ctrl+U (View Source), Ctrl+S (Save), Ctrl+P (Print)
      if (['c', 'u', 's', 'p'].includes(key)) {
        if (key === 'c' && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
          return true;
        }
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I / J / C (Inspect / DevTools / Console)
      if (e.shiftKey && ['i', 'j', 'c'].includes(key)) {
        e.preventDefault();
        return false;
      }
    }
  });

  // 3. Prevent Image Drag & Drop Theft
  document.addEventListener('dragstart', function (e) {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
      return false;
    }
  });

  // 4. Global Input Sanitizer Against Cross-Site Scripting (XSS)
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

  // 5. Sanitize all form inputs dynamically on submit
  document.addEventListener('submit', function (e) {
    const forms = e.target;
    if (forms && forms.querySelectorAll) {
      const inputs = forms.querySelectorAll('input[type="text"], textarea');
      inputs.forEach(input => {
        input.value = window.sanitizeInput(input.value);
      });
    }
  }, true);
})();
