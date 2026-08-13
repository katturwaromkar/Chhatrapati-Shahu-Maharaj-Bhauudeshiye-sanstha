/* ==========================================================================
   Chhatrapati Shahu Maharaj Bahuuddeshiya Sanstha
   Web Security, Anti-Content Theft & Anti-Zoom Guard Module
   ========================================================================== */

(function () {
  'use strict';

  // 1. Strict Anti-Zoom & Touch Lockout Guards (No Zoom In / Out)
  function initAntiZoomGuards() {
    // Block iOS Safari pinch-to-zoom gestures
    document.addEventListener('gesturestart', function (e) {
      e.preventDefault();
    }, { passive: false });

    document.addEventListener('gesturechange', function (e) {
      e.preventDefault();
    }, { passive: false });

    document.addEventListener('gestureend', function (e) {
      e.preventDefault();
    }, { passive: false });

    // Block double-tap to zoom on touch devices
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (e) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      }
      lastTouchEnd = now;
    }, { passive: false });

    // Block Ctrl + Scroll Wheel Zoom on Desktop
    document.addEventListener('wheel', function (e) {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    }, { passive: false });

    // Block Ctrl + (+ / - / 0) key zoom shortcuts
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
        e.preventDefault();
      }
    });
  }

  // 2. Disable Right-Click Context Menu (Excluding Form Input Fields)
  document.addEventListener('contextmenu', function (e) {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      return false;
    }
  });

  // 3. Prevent Keyboard Shortcuts for Inspect, Source, Copy & Print
  document.addEventListener('keydown', function (e) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlCmd = isMac ? e.metaKey : e.ctrlKey;

    // F12 key (DevTools)
    if (e.keyCode === 123 || e.key === 'F12') {
      e.preventDefault();
      return false;
    }

    // PrintScreen key guard
    if (e.key === 'PrintScreen') {
      e.preventDefault();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('');
      }
      return false;
    }

    if (ctrlCmd) {
      const key = e.key ? e.key.toLowerCase() : '';
      
      // Ctrl+C (Copy), Ctrl+U (View Source), Ctrl+S (Save), Ctrl+P (Print), Ctrl+A (Select All outside inputs)
      if (['c', 'u', 's', 'p', 'a'].includes(key)) {
        if ((key === 'c' || key === 'a') && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
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

  // 4. Prevent Image Drag & Drop Content Theft
  document.addEventListener('dragstart', function (e) {
    if (e.target.tagName === 'IMG' || e.target.tagName === 'A') {
      e.preventDefault();
      return false;
    }
  });

  // 5. Anti-Debugging Protection
  function initAntiDebugging() {
    let devtoolsOpen = false;
    const threshold = 160;

    const checkDevTools = function () {
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      
      if ((widthDiff || heightDiff) && !devtoolsOpen) {
        devtoolsOpen = true;
        console.warn('Developer tools detected.');
      } else if (!widthDiff && !heightDiff) {
        devtoolsOpen = false;
      }
    };

    window.addEventListener('resize', checkDevTools);
    setInterval(checkDevTools, 2000);
  }

  // 6. Screenshot & Window Blur Safeguard
  function initScreenshotDeterrence() {
    window.addEventListener('blur', function () {
      document.body.classList.add('window-blur-protected');
    });

    window.addEventListener('focus', function () {
      document.body.classList.remove('window-blur-protected');
    });
  }

  // 7. Global Input Sanitizer Against Cross-Site Scripting (XSS)
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

  // 8. Form Anti-Spam Rate Limiting & Input Sanitization
  function initFormProtection() {
    let lastSubmitTime = 0;
    const MIN_SUBMIT_INTERVAL = 3000; // 3 seconds between submits

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

  // Initialize all security guards when DOM is ready
  document.addEventListener('DOMContentLoaded', function () {
    initAntiZoomGuards();
    initAntiDebugging();
    initScreenshotDeterrence();
    initFormProtection();
  });
})();
