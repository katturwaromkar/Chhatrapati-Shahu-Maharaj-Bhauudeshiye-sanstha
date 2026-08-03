/* ==========================================================================
   Chhatrapati Shahu Maharaj Bahuuddeshiya Sanstha
   Main JavaScript Module
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initActiveNavLink();
  initScrollReveal();
  initStatCounters();
  initNoticeSearch();
  initContactForm();
  initBackToTop();
  initImageLightbox();
});

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

  // Close menu when clicking links
  document.querySelectorAll('.nav-link').forEach(link => {
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

/* --- Image Lightbox Modal (Large Form View) --- */
function initImageLightbox() {
  let modal = document.getElementById('imageLightboxModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'imageLightboxModal';
    modal.className = 'lightbox-modal';
    modal.innerHTML = `
      <div class="lightbox-close">&times;</div>
      <div class="lightbox-content">
        <img src="" alt="Large Image View">
        <div class="lightbox-caption">
          <h3></h3>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const modalImg = modal.querySelector('.lightbox-content img');
  const modalCaption = modal.querySelector('.lightbox-caption h3');
  const closeBtn = modal.querySelector('.lightbox-close');

  const openLightbox = (src, caption) => {
    modalImg.src = src;
    modalCaption.textContent = caption || '';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  closeBtn.addEventListener('click', closeLightbox);
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target === closeBtn) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeLightbox();
  });

  // Attach click listener to hospital flyers, gallery items, and any images
  document.querySelectorAll('img').forEach(img => {
    if (img.classList.contains('site-logo-img') || img.classList.contains('brand-logo-large')) return;

    img.style.cursor = 'zoom-in';
    img.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(img.src, img.alt || img.title || 'रुग्णालय सवलत माहिती पत्रक');
    });
  });
}
