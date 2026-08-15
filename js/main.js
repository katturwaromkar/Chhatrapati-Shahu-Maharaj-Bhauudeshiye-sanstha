/* ==========================================================================
   Chhatrapati Shahu Maharaj Bahuuddeshiya Sanstha
   Main JavaScript Module
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initDropdownMenus();
  initActiveNavLink();
  initScrollReveal();
  initStatCounters();
  initNoticeSearch();
  initContactForm();
  initBackToTop();
  initImageLightbox();
  initPWA();
});

/* --- PWA Service Worker Registration --- */
function initPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(err => {
        console.warn('PWA ServiceWorker registration failed: ', err);
      });
    });
  }
}

/* --- Dropdown Menus Auto-Close & Click Toggle --- */
function initDropdownMenus() {
  const dropdowns = document.querySelectorAll('.nav-dropdown');

  const closeAllDropdowns = () => {
    dropdowns.forEach(dp => dp.classList.remove('active'));
    document.body.classList.add('scrolling-hide-dropdown');
    setTimeout(() => {
      document.body.classList.remove('scrolling-hide-dropdown');
    }, 300);
  };

  dropdowns.forEach(dp => {
    const link = dp.querySelector('.nav-link');
    if (link) {
      link.addEventListener('click', (e) => {
        // ALWAYS prevent direct page redirection when clicking the main menu with a dropdown
        e.preventDefault();
        e.stopPropagation();
        const isActive = dp.classList.contains('active');
        dropdowns.forEach(d => { if (d !== dp) d.classList.remove('active'); });
        dp.classList.toggle('active', !isActive);
      });
    }

    // Allow dropdown item links to navigate cleanly and close dropdowns
    dp.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        dropdowns.forEach(d => d.classList.remove('active'));
      });
    });
  });

  // Automatically close open dropdown menus when user scrolls the website (desktop)
  window.addEventListener('scroll', () => {
    if (window.innerWidth > 992) {
      closeAllDropdowns();
    }
  }, { passive: true });

  // Automatically close open dropdown menus when user clicks anywhere outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) {
      dropdowns.forEach(dp => dp.classList.remove('active'));
    }
  });
}

/* --- Sticky Navbar --- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/* --- Mobile Menu Drawer Toggle --- */
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  if (!hamburger || !navMenu) return;

  let currentScrollY = 0;

  function openMenu() {
    currentScrollY = window.scrollY || window.pageYOffset;
    navMenu.classList.add('active');
    hamburger.classList.add('active-toggle');
    document.body.classList.add('menu-open');
    document.body.style.top = `-${currentScrollY}px`;
    const icon = hamburger.querySelector('i');
    if (icon) icon.className = 'fas fa-times';
  }

  function closeMenu() {
    navMenu.classList.remove('active');
    hamburger.classList.remove('active-toggle');
    document.body.classList.remove('menu-open');
    document.body.style.top = '';
    window.scrollTo(0, currentScrollY);
    const icon = hamburger.querySelector('i');
    if (icon) icon.className = 'fas fa-bars';
  }

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (navMenu.classList.contains('active')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close mobile drawer menu ONLY when clicking standalone navigation links or sub-menu items (NOT main menu dropdown headers)
  document.querySelectorAll('.nav-menu > li:not(.nav-dropdown) > .nav-link, .dropdown-item').forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Block touch scrolling on body background when mobile menu is active
  document.addEventListener('touchmove', (e) => {
    if (document.body.classList.contains('menu-open')) {
      if (!navMenu.contains(e.target)) {
        e.preventDefault();
      }
    }
  }, { passive: false });
}

/* --- Active Nav Link Highlighting --- */
function initActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* --- Scroll Reveal Animations --- */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    revealElements.forEach(el => {
      const elementTop = el.getBoundingClientRect().top;
      const elementVisible = 100;
      if (elementTop < windowHeight - elementVisible) {
        el.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll(); // Trigger initial check
}

/* --- Animated Stat Counters --- */
function initStatCounters() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (statNumbers.length === 0) return;

  let started = false;

  const startCounters = () => {
    const statsBanner = document.querySelector('.stats-banner');
    if (!statsBanner) return;

    const bannerTop = statsBanner.getBoundingClientRect().top;
    if (bannerTop < window.innerHeight && !started) {
      started = true;
      statNumbers.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 2000; // 2 seconds
        const stepTime = 30;
        const steps = duration / stepTime;
        const increment = target / steps;

        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            counter.innerText = target.toLocaleString() + '+';
            clearInterval(timer);
          } else {
            counter.innerText = Math.ceil(current).toLocaleString() + '+';
          }
        }, stepTime);
      });
    }
  };

  window.addEventListener('scroll', startCounters);
  startCounters();
}

/* --- Notice Search & Filter --- */
function initNoticeSearch() {
  const searchInput = document.getElementById('noticeSearchInput');
  const noticeCards = document.querySelectorAll('.notice-card');

  if (!searchInput || noticeCards.length === 0) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();

    noticeCards.forEach(card => {
      const text = card.innerText.toLowerCase();
      if (text.includes(query)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  });
}

/* --- Contact Form Validation & Toast --- */
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('formName')?.value;
    const phone = document.getElementById('formPhone')?.value;
    const message = document.getElementById('formMessage')?.value;

    if (!name || !phone || !message) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    // Success simulation
    showToast('Thank you! Your message has been sent successfully.', 'success');
    contactForm.reset();
  });
}

/* --- Toast Notification Trigger --- */
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="${type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'}" style="color: ${type === 'success' ? '#27AE60' : '#F2994A'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

/* --- Back To Top Button --- */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* --- Enhanced Interactive Image Lightbox Modal with Full Album Navigation --- */
function initImageLightbox() {
  let modal = document.getElementById('imageLightboxModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'imageLightboxModal';
    modal.className = 'lightbox-modal';
    modal.innerHTML = `
      <div class="lightbox-close" title="Close (Esc)">&times;</div>
      <button class="lightbox-nav-btn prev" aria-label="Previous Photo" title="मागील फोटो"><i class="fas fa-chevron-left"></i></button>
      <button class="lightbox-nav-btn next" aria-label="Next Photo" title="पुढील फोटो"><i class="fas fa-chevron-right"></i></button>
      <div class="lightbox-content">
        <img src="" alt="Large Image View" id="lightboxMainImg">
        <div class="lightbox-caption">
          <h3 id="lightboxMainCaption"></h3>
          <span class="lightbox-counter" id="lightboxCounter"></span>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const modalImg = document.getElementById('lightboxMainImg') || modal.querySelector('.lightbox-content img');
  const modalCaption = document.getElementById('lightboxMainCaption') || modal.querySelector('.lightbox-caption h3');
  const modalCounter = document.getElementById('lightboxCounter') || modal.querySelector('.lightbox-counter');
  const closeBtn = modal.querySelector('.lightbox-close');
  const prevBtn = modal.querySelector('.lightbox-nav-btn.prev');
  const nextBtn = modal.querySelector('.lightbox-nav-btn.next');

  let currentGallery = [];
  let currentIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;

  function updateLightboxPhoto() {
    if (!currentGallery.length || currentIndex < 0 || currentIndex >= currentGallery.length) return;
    const item = currentGallery[currentIndex];
    modalImg.src = item.src;
    modalCaption.textContent = item.caption || 'छायाचित्र दर्शन';
    if (modalCounter) {
      modalCounter.textContent = `फोटो ${currentIndex + 1} पैकी ${currentGallery.length}`;
    }
  }

  const openLightboxIndex = (index, items) => {
    currentGallery = items;
    currentIndex = index;
    updateLightboxPhoto();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  const prevPhoto = () => {
    if (!currentGallery.length) return;
    currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    updateLightboxPhoto();
  };

  const nextPhoto = () => {
    if (!currentGallery.length) return;
    currentIndex = (currentIndex + 1) % currentGallery.length;
    updateLightboxPhoto();
  };

  if (closeBtn) closeBtn.onclick = closeLightbox;
  if (prevBtn) prevBtn.onclick = (e) => { e.stopPropagation(); prevPhoto(); };
  if (nextBtn) nextBtn.onclick = (e) => { e.stopPropagation(); nextPhoto(); };

  modal.onclick = (e) => {
    if (e.target === modal || e.target === closeBtn) closeLightbox();
  };

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevPhoto();
    if (e.key === 'ArrowRight') nextPhoto();
  });

  // Touch Swipe for Mobile Devices
  modal.ontouchstart = (e) => {
    touchStartX = e.changedTouches[0].screenX;
  };
  modal.ontouchend = (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 40) nextPhoto();
    if (touchEndX - touchStartX > 40) prevPhoto();
  };

  // Scan document for photo cards
  const cards = document.querySelectorAll(
    '.doctor-album-card, .news-album-card, .misc-album-card, .gallery-item, .doc-card, ' +
    '.camps-gallery-grid > div, .zoomable-card'
  );

  let activePhotoList = [];
  cards.forEach((card, idx) => {
    const img = card.querySelector('img');
    if (!img || !img.src) return;

    const caption = card.querySelector('h4, h3, .gallery-title, .doc-title')?.innerText || img.alt || `फोटो #${idx + 1}`;
    activePhotoList.push({ src: img.src, caption: caption, element: card });

    card.style.cursor = 'pointer';
    card.onclick = (e) => {
      e.preventDefault();
      const clickIdx = activePhotoList.findIndex(item => item.element === card || item.src === img.src);
      openLightboxIndex(clickIdx >= 0 ? clickIdx : 0, activePhotoList);
    };
  });

  // Attach standalone triggers (standalone zoom-trigger or img outside cards)
  document.querySelectorAll('.zoom-trigger, img.zoomable-text').forEach(el => {
    if (el.closest('.logo-brand, .nav-brand-mobile, .header-brand-centered')) return;
    el.style.cursor = 'pointer';
    el.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const parentCard = el.closest('.doctor-album-card, .news-album-card, .misc-album-card, .gallery-item, .doc-card');
      if (parentCard) {
        parentCard.click();
      } else {
        const img = el.tagName === 'IMG' ? el : el.parentNode.querySelector('img');
        if (img && img.src) {
          openLightboxIndex(0, [{ src: img.src, caption: img.alt || 'छायाचित्र दर्शन' }]);
        }
      }
    };
  });

  window.initImageLightbox = initImageLightbox;
}
