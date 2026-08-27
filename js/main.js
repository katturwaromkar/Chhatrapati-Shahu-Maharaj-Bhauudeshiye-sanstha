/* ==========================================================================
   Chhatrapati Shahu Maharaj Bahuuddeshiya Sanstha
   Main JavaScript Module
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initDropdownMenus();
  initActiveNavLink();
  initMobileStickyDock();
  initHospitalsPage();
  initScrollReveal();
  initStatCounters();
  initNoticeSearch();
  initContactForm();
  initBackToTop();
  initImageLightbox();
  initGlobalSearch();
  initQuickHospitalSearch();
  initFaqAccordion();
  initVisitorCounter();
  initFontResizer();
  initSavingsCalculator();
  initLiveCardPreview();
  initDonationModal();
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
    const icon = hamburger.querySelector('i');
    if (icon) icon.className = 'fas fa-times';
  }

  function closeMenu() {
    navMenu.classList.remove('active');
    hamburger.classList.remove('active-toggle');
    document.body.classList.remove('menu-open');
    const icon = hamburger.querySelector('i');
    if (icon) icon.className = 'fas fa-bars';
    window.scrollTo(0, currentScrollY);
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

  // Automatically close mobile navigation drawer when tapping anywhere outside (screens <= 992px)
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 992 && navMenu.classList.contains('active')) {
      if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
        closeMenu();
      }
    }
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
  
  // Clear all previous active states
  document.querySelectorAll('.nav-menu .active').forEach(el => el.classList.remove('active'));

  const navLinks = document.querySelectorAll('.nav-menu a[href]');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');

      const parentDropdown = link.closest('.nav-dropdown');
      if (parentDropdown) {
        parentDropdown.classList.add('active');
        const mainDropdownLink = parentDropdown.querySelector('.nav-link');
        if (mainDropdownLink) mainDropdownLink.classList.add('active');
      }
    }
  });
}

/* --- Automatic Mobile Sticky Bottom Dock --- */
function initMobileStickyDock() {
  if (document.querySelector('.mobile-sticky-dock')) return;

  const dock = document.createElement('div');
  dock.className = 'mobile-sticky-dock';
  dock.innerHTML = `
    <a href="tel:+919021757353" class="dock-item">
      <i class="fas fa-phone-alt"></i>
      <span>फोन करा</span>
    </a>
    <a href="family-health-card.html" class="dock-item primary-dock">
      <i class="fas fa-id-card"></i>
      <span>हेल्थ कार्ड</span>
    </a>
    <a href="hospitals.html" class="dock-item">
      <i class="fas fa-hospital"></i>
      <span>रुग्णालये</span>
    </a>
    <a href="https://wa.me/918007474503?text=%E0%A4%A8%E0%A4%AE%E0%A4%B8%E0%A5%8D%E0%A4%95%E0%A4%BE%E0%A4%B0!%20%E0%A4%AE%E0%A4%B2%E0%A4%BE%E0%A4%AE%E0%A4%BE%E0%A4%B9%E0%A4%BF%E0%A4%A4%E0%A4%AF%E0%A5%8D%E0%A4%AF%E0%A4%BE%20%E0%A4%B9%E0%A4%B5%E0%A5%80%E0%A4%AF%E0%A4%BE%E0%A4%A6%E0%A5%80%E0%A4%A4." target="_blank" class="dock-item whatsapp-dock">
      <i class="fab fa-whatsapp"></i>
      <span>व्हॉट्सॲप</span>
    </a>
  `;
  document.body.appendChild(dock);
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

/* --- Global Search Modal System (Ctrl + K) --- */
function initGlobalSearch() {
  let searchModal = document.getElementById('globalSearchModal');
  if (!searchModal) {
    searchModal = document.createElement('div');
    searchModal.id = 'globalSearchModal';
    searchModal.className = 'lightbox-modal';
    searchModal.innerHTML = `
      <div class="lightbox-close" title="Close (Esc)">&times;</div>
      <div style="background: #ffffff; width: 92%; max-width: 650px; border-radius: var(--radius-md); padding: 24px; box-shadow: var(--shadow-lg); text-align: left; position: relative;">
        <div style="display: flex; align-items: center; gap: 10px; border-bottom: 2px solid var(--primary); padding-bottom: 10px; margin-bottom: 16px;">
          <i class="fas fa-search" style="font-size: 1.2rem; color: var(--primary);"></i>
          <input type="text" id="globalSearchQuery" placeholder="शोध करा (उदा. डॉक्टर, कार्ड, रुग्णालय, शिबीर, संपर्क)..." style="width: 100%; border: none; outline: none; font-size: 1.05rem; font-weight: 600;">
        </div>
        <div id="globalSearchResults" style="max-height: 350px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;">
          <div style="font-size: 0.88rem; color: var(--text-muted); text-align: center; padding: 15px;">शोधण्यासाठी वरील बॉक्समध्ये टाईप करा (किंवा Ctrl + K दाबा)...</div>
        </div>
      </div>
    `;
    document.body.appendChild(searchModal);
  }

  const queryInput = document.getElementById('globalSearchQuery');
  const resultsContainer = document.getElementById('globalSearchResults');
  const closeBtn = searchModal.querySelector('.lightbox-close');

  const siteLinks = [
    { title: 'फॅमिली हेल्थ कार्ड अर्ज व माहिती', url: 'family-health-card.html', desc: 'वैद्यकीय सवलतीसाठी अधिकृत फॅमिली हेल्थ कार्ड ऑनलाईन अर्ज करा.' },
    { title: 'संलग्न रुग्णालये व सवलत यादी', url: 'hospitals.html', desc: 'संस्थेशी जोडलेली हॉस्पिटल्स, पॅथॉलॉजी लॅब्स व सवलत तक्ता.' },
    { title: 'तज्ज्ञ डॉक्टर्स यादी व फोटो', url: 'doctors.html', desc: 'वैद्यकीय सल्लागार व तज्ज्ञ डॉक्टर फोटो अल्बम.' },
    { title: 'मोफत आरोग्य व रक्तदान शिबीर फोटो', url: 'camps-photos.html', desc: 'गावोगावी आयोजित आरोग्य तपासणी व शिबीरांची क्षणचित्रे.' },
    { title: 'वृत्तपत्र बातम्या व प्रसिद्धी', url: 'news.html', desc: 'संस्थेच्या सामाजिक उपक्रमांचे वृत्तपत्रातील प्रसिद्ध बातमी कात्रणे.' },
    { title: 'संस्थेविषयी व नियम', url: 'about.html', desc: 'संस्थेची उद्दिष्टे, नोंदणी क्रमांक व संस्थापक मनोगत.' },
    { title: 'अधिकारी व कार्यकारिणी समिती', url: 'our-officers.html', desc: 'संस्थेचे अधिकृत पदाधिकारी व कार्यकारिणी सदस्यांची यादी.' },
    { title: 'मुख्य कार्यालय व संपर्क', url: 'contact.html', desc: 'छत्रपती संभाजीनगर व जळगाव कार्यालय पत्ता, फोन व फॉर्म.' }
  ];

  function openSearch() {
    searchModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => { queryInput?.focus(); }, 100);
  }

  function closeSearch() {
    searchModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.onclick = closeSearch;
  searchModal.onclick = (e) => {
    if (e.target === searchModal) closeSearch();
  };

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape' && searchModal.classList.contains('active')) {
      closeSearch();
    }
  });

  queryInput?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
      resultsContainer.innerHTML = '<div style="font-size: 0.88rem; color: var(--text-muted); text-align: center; padding: 15px;">शोधण्यासाठी वरील बॉक्समध्ये टाईप करा...</div>';
      return;
    }

    const filtered = siteLinks.filter(item => item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q));
    if (!filtered.length) {
      resultsContainer.innerHTML = '<div style="font-size: 0.88rem; color: var(--text-muted); text-align: center; padding: 15px;">कोणतेही निकाल आढळले नाहीत.</div>';
      return;
    }

    resultsContainer.innerHTML = filtered.map(item => `
      <a href="${item.url}" style="padding: 12px; border-radius: var(--radius-sm); background: #F8FAFC; text-decoration: none; border-left: 3px solid var(--primary); display: block; transition: all 0.2s ease;">
        <h4 style="font-size: 0.98rem; color: var(--text-dark); margin-bottom: 2px;">${item.title}</h4>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0;">${item.desc}</p>
      </a>
    `).join('');
  });

  window.openGlobalSearch = openSearch;
}

/* --- Quick Hospital & Discount Search Widget Logic --- */
function initQuickHospitalSearch() {
  const trigger = document.getElementById('quick-search-trigger');
  const citySelect = document.getElementById('quick-city-select');
  const typeSelect = document.getElementById('quick-type-select');
  const resultsContainer = document.getElementById('quick-search-results');

  if (!trigger || !resultsContainer) return;

  const hospitalData = [
    { name: 'धूत हॉस्पिटल & रिसर्च सेंटर', city: 'sambhajinagar', type: 'multispeciality', discount: '२०% ते ५०% सवलत', address: 'जळगाव रोड, छत्रपती संभाजीनगर' },
    { name: 'कासलीवाल आय इन्स्टिट्यूट', city: 'sambhajinagar', type: 'eye', discount: '१५% ते ३०% सवलत', address: 'सिडको एन-१, छत्रपती संभाजीनगर' },
    { name: 'मेट्रोपॉलिस पॅथॉलॉजी लॅब', city: 'sambhajinagar', type: 'pathology', discount: '२५% सवलत लॅब टेस्टवर', address: 'जळगाव व छत्रपती संभाजीनगर' },
    { name: 'ओराकल डेंटल क्लिनिक', city: 'jalgaon', type: 'dental', discount: '२०% दातांच्या उपचारावर सवलत', address: 'जीएस ग्राउंडजवळ, जळगाव' },
    { name: 'कमलनयन बजाज हॉस्पिटल', city: 'sambhajinagar', type: 'multispeciality', discount: '१५% ते ४०% सवलत', address: 'बेगमपुरा, छत्रपती संभाजीनगर' },
    { name: 'संजीवनी सुपर स्पेशालिटी हॉस्पिटल', city: 'pune', type: 'multispeciality', discount: '२०% कार्डधारकांना सवलत', address: 'शिवाजीनगर, पुणे' },
    { name: 'गुप्ता आय कॉर्निया सेंटर', city: 'jalgaon', type: 'eye', discount: '२०% डोळ्यांच्या तपासणीवर', address: 'नेहरू चौक, जळगाव' },
    { name: 'एस. आर. लॅब व डायग्नोस्टिक्स', city: 'jalgaon', type: 'pathology', discount: '३०% सर्व रक्त तपासणीवर', address: 'स्टेशन रोड, जळगाव' }
  ];

  function performSearch() {
    const selectedCity = citySelect ? citySelect.value : 'all';
    const selectedType = typeSelect ? typeSelect.value : 'all';

    const filtered = hospitalData.filter(item => {
      const matchCity = (selectedCity === 'all' || item.city === selectedCity);
      const matchType = (selectedType === 'all' || item.type === selectedType);
      return matchCity && matchType;
    });

    if (!filtered.length) {
      resultsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; background: #FFF5F5; color: #C53030; padding: 18px; border-radius: var(--radius-sm); text-align: center; font-size: 0.92rem; font-weight: 600; border: 1px solid #FEB2B2;">
          <i class="fas fa-info-circle"></i> या निकषांसाठी हॉस्पिटल्स उपलब्ध नाहीत. कृपया इतर शहरे किंवा सर्व सेवा निवडा.
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = filtered.map(item => `
      <div class="quick-hospital-card" style="background: #F8F7FC; border-radius: var(--radius-sm); padding: 16px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 8px; transition: transform 0.2s ease, box-shadow 0.2s ease;">
        <span style="font-size: 0.75rem; font-weight: 700; background: rgba(39, 174, 96, 0.15); color: #27AE60; padding: 2px 10px; border-radius: 999px; width: fit-content;"><i class="fas fa-check-circle"></i> ${item.discount}</span>
        <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--text-dark); margin: 0;">${item.name}</h4>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;"><i class="fas fa-map-marker-alt" style="color: var(--primary);"></i> ${item.address}</p>
      </div>
    `).join('');
  }

  trigger.addEventListener('click', performSearch);
  citySelect?.addEventListener('change', performSearch);
  typeSelect?.addEventListener('change', performSearch);
}

/* --- FAQ Accordion Expand/Collapse Logic --- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (question && answer) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close other FAQ items for clean single accordion toggle
        faqItems.forEach(otherItem => {
          otherItem.classList.remove('active');
          const otherAnswer = otherItem.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.style.display = 'none';
        });

        if (!isActive) {
          item.classList.add('active');
          answer.style.display = 'block';
        }
      });
    }
  });
}

/* --- Real-Time Multi-Device Footer Visitor Counter Logic --- */
const RESTFUL_COUNTER_URL = 'https://api.restful-api.dev/objects/ff8081819ff5b11001a0286ddd1174b2';

function initVisitorCounter() {
  const counterElements = document.querySelectorAll('#visitorCountNum');
  if (!counterElements.length) return;

  const isNewSession = !sessionStorage.getItem('csms_session_counted');

  async function fetchRealtimeVisitorCount() {
    // Try local Hostinger API endpoint first
    try {
      const endpoint = isNewSession ? 'api/counter?action=hit' : 'api/counter';
      const response = await fetch(endpoint, { cache: 'no-store' });
      if (response.ok) {
        const json = await response.json();
        if (json.count) {
          if (isNewSession) sessionStorage.setItem('csms_session_counted', 'true');
          counterElements.forEach(el => { el.textContent = json.formatted || json.count.toLocaleString('en-IN'); });
          localStorage.setItem('csms_global_visitor_count', json.count);
          return;
        }
      }
    } catch (err) {
      console.warn('Local counter fetch failed, trying cloud fallback:', err);
    }

    try {
      const response = await fetch(RESTFUL_COUNTER_URL, { cache: 'no-store' });
      if (response.ok) {
        const json = await response.json();
        let currentCount = parseInt(json.data?.count || '5432', 10);
        if (isNewSession) {
          sessionStorage.setItem('csms_session_counted', 'true');
          currentCount += 1;
          // PUT incremented count back to cloud DB
          fetch(RESTFUL_COUNTER_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: "CSM_SANSTHA_COUNTER_DB_2026",
              data: { count: currentCount }
            })
          }).catch(e => {});
        }
        const formatted = currentCount.toLocaleString('en-IN');
        counterElements.forEach(el => { el.textContent = formatted; });
        localStorage.setItem('csms_global_visitor_count', currentCount);
        return;
      }
    } catch (err) {
      console.warn('Counter fetch failed:', err);
    }

    // Fallback baseline if offline
    let fallbackCount = parseInt(localStorage.getItem('csms_global_visitor_count') || '5432', 10);
    if (isNewSession) {
      fallbackCount += 1;
      localStorage.setItem('csms_global_visitor_count', fallbackCount);
      sessionStorage.setItem('csms_session_counted', 'true');
    }
    counterElements.forEach(el => { el.textContent = fallbackCount.toLocaleString('en-IN'); });
  }

  // Initial fetch
  fetchRealtimeVisitorCount();

  // Real-time polling every 6 seconds so visitor count stays 100% synchronized across all active devices
  setInterval(fetchRealtimeVisitorCount, 6000);
}


/* --- Font Size Accessibility Resizer Logic --- */
function initFontResizer() {
  const buttons = document.querySelectorAll('.font-size-btn');
  if (!buttons.length) return;

  const savedSize = localStorage.getItem('csms_font_size') || '16';
  document.documentElement.style.fontSize = savedSize + 'px';

  buttons.forEach(btn => {
    if (btn.getAttribute('data-size') === savedSize) {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSize = btn.getAttribute('data-size') || '16';
      document.documentElement.style.fontSize = targetSize + 'px';
      localStorage.setItem('csms_font_size', targetSize);

      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

/* --- Hospital Bill Savings Calculator Logic --- */
function initSavingsCalculator() {
  const amountInput = document.getElementById('calcBillAmount');
  const typeSelect = document.getElementById('calcServiceType');
  const billDisplay = document.getElementById('calcBillDisplay');
  const savingsDisplay = document.getElementById('calcSavingsDisplay');
  const discountTag = document.getElementById('calcDiscountTag');
  const calcBtn = document.getElementById('calculateSavingsBtn');
  const resultBox = document.getElementById('calcResultContainer');

  const updateCalculations = () => {
    if (!amountInput) return;
    const amount = parseFloat(amountInput.value) || 10000;
    
    let discountPercent = 20;
    if (typeSelect) {
      const selectedOpt = typeSelect.options[typeSelect.selectedIndex];
      if (selectedOpt && selectedOpt.dataset.rate) {
        discountPercent = parseInt(selectedOpt.dataset.rate, 10);
      } else {
        const serviceType = typeSelect.value;
        if (serviceType === 'lab') discountPercent = 25;
        else if (serviceType === 'eye') discountPercent = 30;
        else discountPercent = 20;
      }
    }

    const savedAmount = Math.round((amount * discountPercent) / 100);

    if (billDisplay) {
      billDisplay.textContent = `₹${amount.toLocaleString('en-IN')}`;
    }
    if (savingsDisplay) {
      savingsDisplay.textContent = `₹${savedAmount.toLocaleString('en-IN')}`;
    }
    if (discountTag) {
      discountTag.innerHTML = `<i class="fas fa-percent"></i> ${discountPercent}% सवलत लागू`;
    }

    if (resultBox && calcBtn) {
      const finalAmount = amount - savedAmount;
      resultBox.innerHTML = `
        <div style="background: linear-gradient(135deg, #F0EBFF 0%, #E2D9FF 100%); border: 2px solid var(--primary); padding: 20px; border-radius: var(--radius-md); text-align: center;">
          <span style="font-size: 0.8rem; font-weight: 800; background: var(--primary); color: #fff; padding: 3px 12px; border-radius: 999px;"><i class="fas fa-calculator"></i> अंदाजित बचत गणित</span>
          <div style="font-size: 1.8rem; font-weight: 800; color: #27AE60; margin: 12px 0 4px 0;">
            <i class="fas fa-piggy-bank"></i> ₹${savedAmount.toLocaleString('en-IN')} ची थेट बचत!
          </div>
          <p style="font-size: 0.92rem; color: var(--text-dark); margin: 0;">
            मूलभूत बिल: <s>₹${amount.toLocaleString('en-IN')}</s> | <strong>कार्डधारकांना भरावयाची रक्कम: ₹${finalAmount.toLocaleString('en-IN')}</strong> (${discountPercent}% सवलतीसह)
          </p>
        </div>
      `;
    }
  };

  if (amountInput) {
    amountInput.addEventListener('input', updateCalculations);
  }
  if (typeSelect) {
    typeSelect.addEventListener('change', updateCalculations);
  }
  if (calcBtn) {
    calcBtn.addEventListener('click', (e) => {
      e.preventDefault();
      updateCalculations();
    });
  }

  updateCalculations();
}


/* --- Live Digital Health Card Real-Time Preview Generator --- */
function initLiveCardPreview() {
  const nameInput = document.getElementById('cardHolderName');
  const phoneInput = document.getElementById('cardHolderPhone');
  const membersSelect = document.getElementById('cardFamilyMembersCount');
  const addressInput = document.getElementById('cardHolderAddress');
  const resultWrapper = document.getElementById('digitalCardResultWrapper');
  const applyForm = document.getElementById('healthCardApplyForm');

  if (!resultWrapper) return;

  function updateLiveCard() {
    const name = nameInput?.value.trim() || 'श्री. / श्रीमती. (तुमचे नाव)';
    const phone = phoneInput?.value.trim() || '98XXXXXXXX';
    const members = membersSelect?.value || '4';
    const address = addressInput?.value.trim() || 'जिल्हा संभाजीनगर / जळगाव';
    const regNo = 'CSM-2026-' + (phone.length >= 4 ? phone.slice(-4) : '7890');

    resultWrapper.innerHTML = `
      <div class="live-digital-card" style="width: 100%; max-width: 360px; background: linear-gradient(135deg, #1E2432 0%, #4A2BC4 100%); color: #ffffff; border-radius: 16px; padding: 20px; box-shadow: var(--shadow-lg); position: relative; overflow: hidden; border: 2px solid #8E6CFF;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="assets/images/logo.png" alt="Logo" style="height: 32px; width: 32px; object-fit: contain;">
            <div>
              <h5 style="font-size: 0.78rem; margin: 0; color: #EDE7FF; font-weight: 800;">छत्रपती शाहू महाराज</h5>
              <span style="font-size: 0.65rem; color: rgba(255,255,255,0.75);">बहुउद्देशीय संस्था (Reg. 699)</span>
            </div>
          </div>
          <span style="background: #27AE60; color: #fff; font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: 999px;">अधिकृत हेल्थ कार्ड</span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <div>
            <span style="font-size: 0.68rem; color: rgba(255,255,255,0.7);">कार्डधारक नाव:</span>
            <h4 style="font-size: 0.98rem; font-weight: 800; color: #ffffff; margin: 0;">${name}</h4>
            <span style="font-size: 0.72rem; color: #8E6CFF; font-weight: 700;">Reg ID: ${regNo}</span>
          </div>
          <div style="width: 44px; height: 44px; background: #ffffff; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #1E2432; font-size: 1.4rem;">
            <i class="fas fa-qrcode"></i>
          </div>
        </div>

        <div style="font-size: 0.75rem; color: rgba(255,255,255,0.85); display: flex; flex-direction: column; gap: 4px; border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 8px;">
          <div><i class="fas fa-phone-alt" style="color:#8E6CFF;"></i> संपर्क: <strong>${phone}</strong> | सदस्य: <strong>${members} जण</strong></div>
          <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><i class="fas fa-map-marker-alt" style="color:#8E6CFF;"></i> ${address}</div>
          <div style="font-size: 0.68rem; color: #27AE60; font-weight: 700; margin-top: 4px;"><i class="fas fa-calendar-check"></i> वैधता: ३१ मार्च २०२७ पर्यंत (१ वर्ष वैध)</div>
        </div>
      </div>

      <div style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap; width: 100%; justify-content: center;">
        <a href="https://wa.me/918007474503?text=नमस्कार!%20मी%20फॅमिली%20हेल्थ%20कार्डसाठी%20अर्ज%20केला%20आहे.%20नाव:%20${encodeURIComponent(name)}%20मोबाईल:%20${encodeURIComponent(phone)}" target="_blank" class="btn btn-sm" style="background: #25D366; color: #ffffff; font-weight: 700; border: none;">
          <i class="fab fa-whatsapp"></i> व्हॉट्सॲपवर पाठवा
        </a>
      </div>
    `;
  }

  nameInput?.addEventListener('input', updateLiveCard);
  phoneInput?.addEventListener('input', updateLiveCard);
  membersSelect?.addEventListener('change', updateLiveCard);
  addressInput?.addEventListener('input', updateLiveCard);

  applyForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    updateLiveCard();
    alert('आपले फॅमिली हेल्थ कार्ड प्रिव्ह्यू यशस्वीरीत्या तयार झाले आहे! संस्था प्रतिनिधी लवकरच संपर्क करतील.');
  });
}

/* --- Hospitals Page Interactive Renderer & Filter --- */
const fullHospitalList = [
  // जिल्हा - जळगाव
  { name: 'सार्थक सर्जिकल क्लिनिक लॅपरो एण्डोस्कोपी सेंटर', doctor: 'डॉ. सुशिलकुमार शरद राणे (M.S.)', spec: 'जनरल सर्जन', city: 'jalgaon', discount: 'OPD: २०% | IPD: २०% | HDU: २०% | Operation: २०%', address: 'पंचमुखी हनुमान मंदिरा जवळ, सिंधी कॉलनी रोड, जळगाव', phone: '02572239238' },
  { name: 'शिवनेरी ऑर्थोपेडिक मल्टीस्पेशालिटी हॉस्पिटल', doctor: 'डॉ. शंतनु भारद्वाज / डॉ. अमृता सोनवणे', spec: 'अस्थिरोग तज्ञ (Ortho)', city: 'jalgaon', discount: 'OPD: २०% | IPD: २०% | Operation: २०% | X-ray/ECG: २०%', address: 'विवेकानंद नगर, पंचमुखी हनुमान मंदिरा जवळ, जळगाव', phone: '' },
  { name: 'जागृती डोळ्याचे हॉस्पिटल लेसर व फेको सेंटर', doctor: 'डॉ. जगदिश दे. पाटील / डॉ. आरती ज. पाटील', spec: 'नेत्ररोग तज्ञ', city: 'jalgaon', discount: 'OPD: २०% | IPD: २०% | Operation: २०%', address: 'पंचमुखी हनुमान मंदिरा पुढे, सिंधी कॉलनी रोड, जळगाव', phone: '8080949922' },
  { name: 'पार्श्व नेत्रालय', doctor: 'डॉ. स्वप्नील कोठारी (M.B.D.N.B.)', spec: 'नेत्र रोग तज्ञ', city: 'jalgaon', discount: 'OPD: २०% | IPD: २०% | Operation: २०%', address: 'आंबेडकर मार्केट जवळ, साईबाबा मंदिर रोड, जळगाव', phone: '9561088332' },
  { name: 'सर्जिकल मॅटर्निटी हॉस्पिटल', doctor: 'डॉ. तुषार पी. चव्हाण (M.B.B.S., M.S.)', spec: 'जनरल सर्जन', city: 'jalgaon', discount: 'OPD: ५०% | IPD: ३०% | ICU: ३०% | लॅब/ECG: ३०%', address: 'शिव कॉलनी स्टॉप, मुंबई हायवे, जळगाव', phone: '9421629494' },
  { name: 'रुबिकलेव्ह हॉस्पिटल', doctor: 'डॉ. अलविण राणे (M.S.)', spec: 'नेत्ररोग तज्ञ', city: 'jalgaon', discount: 'OPD: ५०% | Operation: ३०%', address: 'पंचमुख हनुमान मंदिराजवळ, सिंधी कॉलनी रोड, जळगाव', phone: '9503811084' },
  { name: 'कोच्चर हॉस्पिटल', doctor: 'डॉ. पंकज कोच्चर (M.Ch.Ortho, D.Ortho)', spec: 'अस्थिरोग तज्ञ', city: 'jalgaon', discount: 'OPD: २०% | IPD: २०% | ICU: २०% | Operation: २०%', address: 'आकाशवाणी चौक, जळगाव', phone: '9422771072' },

  // भडगाव तालुका
  { name: 'अंजली आय.सी.यु. ॲण्ड मल्टीस्पेशालिटी हॉस्पिटल', doctor: 'डॉ. पल्लवी सुर्यवंशी (M.B.B.S., M.D.)', spec: 'सर्व तज्ञ (ICU)', city: 'bhadgaon', discount: 'OPD: ५०% | IPD: ३०% | Operation: ३०% | X-ray/ECG: ३०%', address: 'चाळीसगाव रोड, भडगाव', phone: '9764468777' },
  { name: 'समर्थ मल्टीस्पेशालिटी हॉस्पिटल', doctor: 'डॉ. राहुल प्रकाश पाटील / डॉ. शितल आर. पाटील', spec: 'जनरल फिजिशियन व त्वचा रोग तज्ञ', city: 'bhadgaon', discount: 'OPD: ५०% | IPD: ३०% | ECG: २०%', address: 'ओंकार विहार कॉलनी, बाळध रोड, भडगाव', phone: '8007220097' },
  { name: 'सिद्धिविनायक हॉस्पिटल (भडगाव)', doctor: 'डॉ. साहेबराव राजेंद्र आहेर (M.B.B.S., D.C.H.)', spec: 'बालरोग तज्ञ', city: 'bhadgaon', discount: 'OPD: ३०% | IPD: ३०% | Operation: २०%', address: 'भडगाव', phone: '8422915175' },
  { name: 'सुगोविंद हॉस्पिटल', doctor: 'डॉ. स्वप्नील जी. बैरागी (Physiotherapy)', spec: 'फिजियो-थेरपी तज्ञ', city: 'bhadgaon', discount: 'OPD: ५०% सवलत', address: 'भडगाव', phone: '8956381064' },

  // तालुका - चाळीसगाव
  { name: 'संजीवनी हॉस्पिटल (चाळीसगाव)', doctor: 'डॉ. शैलेंद्र व्ही. सुर्यवंशी (M.B.B.S., D.C.H.)', spec: 'बालरोग तज्ञ', city: 'chalisgaon', discount: 'OPD: २५% | IPD: २५% | NICU: २५%', address: 'भडगाव रोड, चाळीसगाव', phone: '' },
  { name: 'शिंदे हॉस्पिटल', doctor: 'डॉ. जितेंद्र शिंदे (M.S. Ortho)', spec: 'अस्थिरोग तज्ञ', city: 'chalisgaon', discount: 'Operation: २०% | ECG: २०% | X-ray: २०%', address: 'भडगाव रोड, चाळीसगाव', phone: '' },
  { name: 'जाम धर्मार्थ दातांचा दवाखाना', doctor: 'डॉ. सौ. सुधा ललित जाम', spec: 'दंतरोग तज्ञ', city: 'chalisgaon', discount: 'दंतउत्पादन: ५०% | RCT: ५०% | OPD: ₹१०', address: 'पोलिस स्टेशन जवळ, चाळीसगाव', phone: '' },
  { name: 'शिबाय पॅथॉलॉजी लॅबोरेटरी', doctor: 'नितीन सुभाष देवरे (M.B.B.S., M.D. Path)', spec: 'पॅथॉलॉजी लॅब', city: 'chalisgaon', discount: 'सर्व चाचण्यांवर ३०% सवलत', address: 'भडगाव रोड, चाळीसगाव', phone: '' },
  { name: 'वेदांत बाळ रुग्णालय', doctor: 'डॉ. प्रशांत अशोक शिनकर (M.B.B.S., D.C.H.)', spec: 'बालरोग तज्ञ', city: 'chalisgaon', discount: 'OPD: २०% | IPD: २०% | NICU: २०%', address: 'चाळीसगाव', phone: '' },
  { name: 'विघ्नहर्ता सोनोग्राफी सेंटर', doctor: 'डॉ. राजेश कुमार के. सोनार (M.B.B.S., D.M.R.E.)', spec: 'सोनोग्राफी तज्ञ', city: 'chalisgaon', discount: 'सोनोग्राफीवर १०% सवलत', address: 'लक्ष्मी नगर, चाळीसगाव', phone: '' },

  // एरंडोल तालुका
  { name: 'आई हॉस्पिटल व सोनोग्राफी सेंटर', doctor: 'डॉ. किरण आर. पाटील (M.B.B.S., D.G.O.)', spec: 'स्त्री रोग तज्ञ', city: 'erandol', discount: 'OPD: ३०% | IPD: २५% | Operation: २५% | Sono: २०%', address: '२५, पदमाई पार्क, पोस्ट ऑफीस शेजारी, एरंडोल', phone: '' },

  // तालुका - पाचोरा
  { name: 'वृंदावन हॉस्पिटल मल्टीस्पेशालिटी सेंटर', doctor: 'डॉ. विजय नरहर पाटील (M.B.B.S., D.G.O.)', spec: 'सर्व तज्ञ उपलब्ध', city: 'pachora', discount: 'OPD: ५०% | IPD: ३०% | ICU: ३०% | Operation: ३०%', address: 'चाळीसगाव-भडगाव हायवे, उड्डाणपुलाजवळ, पाचोरा', phone: '' },
  { name: 'लीलावती हॉस्पिटल', doctor: 'डॉ. वैभव सुर्यवंशी (B.A.M.S., D.G.O.)', spec: 'स्त्रीरोग तज्ञ', city: 'pachora', discount: 'OPD: ५०% | IPD: ३०% | ICU: ३०% | Operation: ३०%', address: 'महाराणा प्रताप चौक, एम.एम. कॉलेज जवळ, पाचोरा', phone: '' },
  { name: 'सिद्धिविनायक मल्टीस्पेशालिटी हॉस्पिटल', doctor: 'डॉ. स्वप्नील पाटील / डॉ. ग्रिष्मा पाटील', spec: 'मेडिसिन व बालरोग तज्ञ', city: 'pachora', discount: 'OPD: ५०% | IPD: ३०% | ICU: ३०% | X-ray: ३०%', address: 'पाचोरा', phone: '' },
  { name: 'विघ्नहर्ता मल्टीस्पेशालिटी हॉस्पिटल', doctor: 'डॉ. सागर एस. गरुड (M.B.B.S., D.A.)', spec: 'सर्व तज्ञ', city: 'pachora', discount: 'OPD: १०% | IPD: २०% | ICU: २०% | CT-Scan: १०%', address: 'पाचोरा', phone: '' },
  { name: 'ओम हॉस्पिटल ॲण्ड क्रिटीकल केअर', doctor: 'डॉ. अजयसिंग परदेशी (B.A.M.S., M.D.)', spec: 'हृदययोग, दमा, लकवा, थायरॉईड', city: 'pachora', discount: 'OPD: ५०% | IPD: ३०% | ICU: ३०% | ECG/Xray: ४०%', address: 'छत्रपती संभाजी महाराज चौक, रिंग रोड, पाचोरा', phone: '' },
  { name: 'डॉ. भंडारी दातांचा दवाखाना', doctor: 'डॉ. तुषार एस. भंडारी (B.D.S., MUHS)', spec: 'दंतरोग तज्ञ', city: 'pachora', discount: 'OPD: ५०% | X-ray: ५०% | रूटकॅनल/कवळी: २०%', address: 'तुळसी कॉम्पलेक्स, भडगाव रोड, पाचोरा', phone: '' },
  { name: 'निरामय हॉस्पिटल', doctor: 'डॉ. शुभम पी. पाटील (M.D. Medicen)', spec: 'हृदययोग, दमा, मधुमेह', city: 'pachora', discount: 'OPD: ३०% | IPD: ३०% | ICU: ३०% | ECG/Xray: २०%', address: 'शेंदूर्णी, पाचोरा', phone: '9284484260' },

  // तालुका - भुसावळ
  { name: 'जयवंत हॉस्पिटल', doctor: 'डॉ. मिलींद आर. पाटील (M.S.)', spec: 'जनरल सर्जन', city: 'bhusawal', discount: 'OPD: २५% | IPD: २५% | Operation: २५%', address: 'त्र्यंबक मार्केट रोड, पांडुरंग टॉकीज जवळ, भुसावळ', phone: '' },
  { name: 'श्री साई नेत्रालय', doctor: 'डॉ. शैलेंद्र बहाटे (M.S. Ayu.)', spec: 'नेत्ररोग तज्ञ', city: 'bhusawal', discount: 'OPD: २०% | Operation: २०%', address: 'एचडीएफसी बँक समोर, जामनेर रोड, भुसावळ', phone: '' },
  { name: 'सरोदे हॉस्पिटल व अतिदक्षता विभाग', doctor: 'डॉ. विनित सरोदे (M.B.B.S., M.D.)', spec: 'फिजिशियन व मधुमेह तज्ञ', city: 'bhusawal', discount: 'OPD: २०% | IPD: २०% | ICU: १५% | ECG/Xray: २०%', address: 'प्रोफेसर कॉलनी, बियाणी स्कूल मागे, भुसावळ', phone: '7767937460' },
  { name: 'स्पंदन हॉस्पिटल', doctor: 'डॉ. चेतन ढाके / डॉ. अवनी ढाके', spec: 'स्त्रीरोग व बालरोग तज्ञ', city: 'bhusawal', discount: 'OPD: २०% | IPD: २०%', address: 'प्रोफेसर कॉलनी, भुसावळ', phone: '8625085837' },
  { name: 'स्पंदन हॉस्पिटल डेंटल केअर', doctor: 'डॉ. रोहंत ढाके (B.D.S.)', spec: 'दंतरोग तज्ञ', city: 'bhusawal', discount: 'OPD: ५०% | दंत उपचार/रूटकॅनल: २०%', address: 'प्रोफेसर कॉलनी, भुसावळ', phone: '9270027448' },

  // जिल्हा - छत्रपती संभाजीनगर
  { name: 'वडगावकर नेत्र रुग्णालय', doctor: 'डॉ. स्वप्नील वडगावकर (M.B.B.S., D.O.M.S.)', spec: 'नेत्र विकार तज्ञ', city: 'sambhajinagar', discount: 'OPD: २०% | Operation: २०%', address: 'समर्थ नगर, छ. संभाजीनगर', phone: '' },
  { name: 'आनंदी मल्टीस्पेशालिटी हॉस्पिटल', doctor: 'डॉ. गिरीष सोळंके (M.B.B.S., M.S. OBGY)', spec: 'सर्व तज्ञ (स्त्रीरोग व मल्टीस्पेशालिटी)', city: 'sambhajinagar', discount: 'OPD: २५% | IPD: २०% | ICU: २०% | Operation: २०%', address: 'प्लॉट ४, सुतगिरणी चौक, गारखेडा, छ. संभाजीनगर', phone: '8261999769' }
];

function initHospitalsPage() {
  const container = document.getElementById('hospitalCardsContainer');
  const searchInput = document.getElementById('hospitalSearchInput');
  const filterBtns = document.querySelectorAll('.gallery-filter-btn[data-filter]');
  const mapElement = document.getElementById('hospitalMap');

  if (!container) return;

  let currentFilter = 'all';
  let currentSearch = '';
  let leafletMap = null;
  let markersGroup = null;

  const cityCoords = {
    sambhajinagar: [19.8762, 75.3433],
    jalgaon: [21.0077, 75.5626],
    bhadgaon: [20.6658, 75.2289],
    chalisgaon: [20.4633, 75.0135],
    erandol: [20.9167, 75.3333],
    pachora: [20.6500, 75.3500],
    bhusawal: [21.0455, 75.8011]
  };

  // Helper to generate specialty-colored map pin icons
  function createSpecialtyMarkerIcon(spec) {
    let color = '#4A2BC4';
    let iconClass = 'fa-hospital';

    const s = (spec || '').toLowerCase();
    if (s.includes('नेत्र') || s.includes('eye')) {
      color = '#2563EB';
      iconClass = 'fa-eye';
    } else if (s.includes('पॅथॉलॉजी') || s.includes('सोनोग्राफी') || s.includes('लॅब')) {
      color = '#16A34A';
      iconClass = 'fa-vial';
    } else if (s.includes('दंत') || s.includes('dental')) {
      color = '#D97706';
      iconClass = 'fa-tooth';
    }

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `<div style="background:${color}; color:#ffffff; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 14px rgba(0,0,0,0.35); border:2px solid #ffffff; font-size:0.92rem;"><i class="fas ${iconClass}"></i></div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -18]
    });
  }

  // Initialize Interactive Leaflet.js Hospital Map with Google Maps Integration
  if (mapElement && typeof L !== 'undefined') {
    try {
      leafletMap = L.map('hospitalMap').setView([20.65, 75.4], 9);

      // Google Maps Streets & Hybrid Tile Layers
      const googleStreets = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '© Google Maps'
      }).addTo(leafletMap);

      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap'
      });

      const baseMaps = {
        "🗺️ गूगल मॅप्स (Google Maps)": googleStreets,
        "🌍 ओपन स्ट्रीट मॅप (Standard OSM)": osmLayer
      };

      L.control.layers(baseMaps).addTo(leafletMap);

      markersGroup = L.layerGroup().addTo(leafletMap);

      const locateBtn = document.getElementById('locateUserBtn');
      if (locateBtn) {
        locateBtn.addEventListener('click', () => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
              const uLat = pos.coords.latitude;
              const uLng = pos.coords.longitude;
              leafletMap.flyTo([uLat, uLng], 12, { duration: 1.2 });
              L.circle([uLat, uLng], { radius: 4000, color: '#4285F4', fillColor: '#34A853', fillOpacity: 0.25 }).addTo(leafletMap)
                .bindPopup('<b>आपले वर्तमान स्थान (Your Location)</b>').openPopup();
              if (window.showToast) window.showToast('आपले स्थान नकाशामध्ये दर्शवले आहे.', 'success');
            }, () => {
              if (window.showToast) window.showToast('स्थान मिळवता आले नाही. कृपया जीपीएस परवानगी तपासा.', 'warning');
            });
          }
        });
      }

      // City Quick-Jump Navigation Handlers
      document.querySelectorAll('.map-city-jump-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const lat = parseFloat(btn.getAttribute('data-lat'));
          const lng = parseFloat(btn.getAttribute('data-lng'));
          const zoom = parseInt(btn.getAttribute('data-zoom') || '12', 10);
          if (leafletMap && lat && lng) {
            leafletMap.flyTo([lat, lng], zoom, { duration: 1.2 });
            document.querySelectorAll('.map-city-jump-btn').forEach(b => {
              b.style.background = '#F1F5F9';
              b.style.color = 'var(--text-dark)';
            });
            btn.style.background = 'var(--primary)';
            btn.style.color = '#ffffff';
          }
        });
      });
    } catch (e) {
      console.warn('Map initialization skipped:', e);
    }
  }

  function renderHospitals() {
    const query = currentSearch.trim().toLowerCase();

    const filtered = fullHospitalList.filter(item => {
      const matchCity = (currentFilter === 'all' || item.city === currentFilter);
      const matchQuery = !query || (
        item.name.toLowerCase().includes(query) ||
        item.doctor.toLowerCase().includes(query) ||
        item.spec.toLowerCase().includes(query) ||
        item.address.toLowerCase().includes(query) ||
        item.discount.toLowerCase().includes(query)
      );
      return matchCity && matchQuery;
    });

    // Update map markers with specialty pins and rich popups
    if (markersGroup) {
      markersGroup.clearLayers();
      filtered.forEach((h, i) => {
        const coords = cityCoords[h.city] || [20.65, 75.4];
        const lat = coords[0] + (Math.sin(i + 1) * 0.015);
        const lng = coords[1] + (Math.cos(i + 1) * 0.015);
        const customIcon = createSpecialtyMarkerIcon(h.spec);
        const marker = L.marker([lat, lng], { icon: customIcon });
        
        const popupContent = `
          <div style="font-family: 'Poppins', sans-serif; padding: 4px; max-width: 230px;">
            <span style="font-size: 0.72rem; font-weight: 800; background: var(--primary-light, #E2D9FF); color: var(--primary, #4A2BC4); padding: 2px 8px; border-radius: 999px; display: inline-block; margin-bottom: 6px;">
              ${h.spec}
            </span>
            <h4 style="font-size: 0.98rem; font-weight: 800; color: #1E2432; margin: 0 0 4px 0; line-height: 1.3;">${h.name}</h4>
            <p style="font-size: 0.82rem; font-weight: 600; color: #166534; margin: 0 0 6px 0;"><i class="fas fa-user-md"></i> ${h.doctor}</p>
            <p style="font-size: 0.78rem; color: #475569; margin: 0 0 8px 0; line-height: 1.4;"><i class="fas fa-map-marker-alt" style="color: #4A2BC4;"></i> ${h.address}</p>
            <div style="background: #F1F5F9; border-left: 3px solid #27AE60; padding: 4px 8px; border-radius: 4px; font-size: 0.78rem; font-weight: 700; color: #15803D; margin-bottom: 10px;">
              <i class="fas fa-tags"></i> ${h.discount}
            </div>
            <div style="display: flex; gap: 6px;">
              ${h.phone ? `<a href="tel:${h.phone}" class="btn btn-sm" style="background:#27AE60; color:#fff; font-size:0.75rem; padding:4px 8px; border-radius:4px; text-decoration:none; font-weight:700; flex:1; text-align:center;"><i class="fas fa-phone-alt"></i> कॉल करा</a>` : ''}
              <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name + ' ' + h.address)}" target="_blank" class="btn btn-sm" style="background:#4A2BC4; color:#fff; font-size:0.75rem; padding:4px 8px; border-radius:4px; text-decoration:none; font-weight:700; flex:1; text-align:center;"><i class="fas fa-directions"></i> दिशा (Route)</a>
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);
        markersGroup.addLayer(marker);
      });
    }

    if (!filtered.length) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; background: #FFF5F5; color: #C53030; padding: 25px; border-radius: var(--radius-md); text-align: center; font-weight: 600; border: 1px solid #FEB2B2;">
          <i class="fas fa-exclamation-circle" style="font-size: 1.4rem; margin-bottom: 8px; display: block;"></i>
          कोणतेही हॉस्पिटल सापडले नाही. कृपया शोध शब्द किंवा फिल्टर बदला.
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(h => `
      <div class="hospital-card-item" style="background: #ffffff; border-radius: var(--radius-md); border: 1px solid var(--border-color); padding: 18px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.2s ease, box-shadow 0.2s ease;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;">
            <span style="font-size: 0.78rem; font-weight: 700; background: var(--primary-light); color: var(--primary); padding: 3px 10px; border-radius: 999px; display: inline-flex; align-items: center; gap: 4px;">
              <i class="fas fa-stethoscope"></i> ${h.spec}
            </span>
            <span style="font-size: 0.75rem; font-weight: 700; background: #F1F5F9; color: var(--text-dark); padding: 3px 10px; border-radius: 999px; text-transform: uppercase;">
              <i class="fas fa-map-pin"></i> ${h.city.toUpperCase()}
            </span>
          </div>

          <h3 style="font-size: 1.12rem; font-weight: 700; color: var(--text-dark); margin: 0 0 6px 0; line-height: 1.35;">${h.name}</h3>
          
          <p style="font-size: 0.9rem; font-weight: 600; color: #166534; margin: 0 0 10px 0; display: flex; align-items: center; gap: 6px;">
            <i class="fas fa-user-md"></i> ${h.doctor}
          </p>

          <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0 0 14px 0; line-height: 1.4;">
            <i class="fas fa-map-marker-alt" style="color: var(--primary);"></i> ${h.address}
          </p>

          <div style="background: #F8FAFC; border-left: 3px solid var(--primary); padding: 8px 12px; border-radius: 4px; margin-bottom: 14px;">
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-dark); display: block; margin-bottom: 2px;"><i class="fas fa-tags"></i> सवलतीचा तपशील:</span>
            <span style="font-size: 0.84rem; font-weight: 700; color: #15803D;">${h.discount}</span>
          </div>
        </div>

        <div>
          ${h.phone ? `
            <a href="tel:${h.phone}" class="btn" style="width: 100%; background: var(--gradient-primary); color: #ffffff; text-decoration: none; padding: 8px 12px; font-size: 0.88rem; font-weight: 700; border-radius: var(--radius-sm); text-align: center; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
              <i class="fas fa-phone-alt"></i> कॉल करा (${h.phone})
            </a>
          ` : `
            <span style="font-size: 0.82rem; color: var(--text-muted); text-align: center; display: block; padding: 6px 0;">
              <i class="fas fa-info-circle"></i> प्रत्यक्ष भेटीसाठी पत्त्यावर संपर्क साधा
            </span>
          `}
        </div>
      </div>
    `).join('');
  }

  renderHospitals();

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderHospitals();
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter') || 'all';
      renderHospitals();
    });
  });
}

/* --- Donation & Support Modal --- */
function closeDonationModal() {
  const modal = document.getElementById('donationModal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.setProperty('display', 'none', 'important');
  }
}
window.closeDonationModal = closeDonationModal;

function openDonationModal() {
  let modal = document.getElementById('donationModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'donationModal';
    modal.className = 'modal-overlay active';
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.8); backdrop-filter:blur(6px); display:flex !important; align-items:center; justify-content:center; z-index:9999999; padding:15px;';
    modal.innerHTML = `
      <div class="modal-card" style="background:#ffffff; border-radius:16px; max-width:520px; width:100%; max-height:90vh; overflow-y:auto; box-shadow:0 25px 50px -12px rgba(0,0,0,0.3); position:relative; animation:modalPopIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
        <button class="close-modal-btn" onclick="closeDonationModal();" aria-label="Close" style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.2); border:none; width:36px; height:36px; border-radius:50%; font-size:1.4rem; cursor:pointer; color:#ffffff; display:flex; align-items:center; justify-content:center; transition:0.2s;">&times;</button>
        <div style="padding:24px 24px 18px; background:linear-gradient(135deg, #059669 0%, #047857 100%); color:#ffffff; border-top-left-radius:16px; border-top-right-radius:16px; text-align:center;">
          <i class="fas fa-hand-holding-heart" style="font-size:2.5rem; margin-bottom:8px; color:#A7F3D0;"></i>
          <h2 style="font-size:1.4rem; font-weight:800; margin:0 0 4px; color:#ffffff;">देणगी व सामाजिक मदत केंद्र</h2>
          <p style="font-size:0.85rem; margin:0; opacity:0.95;">छत्रपती शाहू महाराज बहुउद्देशीय संस्था (Reg. No. 699/MH F 5559)</p>
        </div>
        <div style="padding:20px;">
          <div style="background:#ECFDF5; border:1px solid #A7F3D0; padding:12px 14px; border-radius:10px; margin-bottom:16px; font-size:0.85rem; color:#065F46; line-height:1.4; display:flex; align-items:flex-start; gap:8px;">
            <i class="fas fa-shield-alt" style="font-size:1.1rem; color:#059669; margin-top:2px;"></i>
            <div><strong>८०जी कर सवलत / 80G Tax Benefit:</strong> संस्था नोंदणीकृत असून आपल्या देणगीवर आयकर नियमांनुसार सवलत अनुज्ञेय आहे.</div>
          </div>

          <h3 style="font-size:1.02rem; font-weight:700; color:#1E293B; margin-bottom:10px; display:flex; align-items:center; gap:8px;">
            <i class="fas fa-university" style="color:#059669;"></i> बँक खात्याचा तपशील (Direct Bank Transfer)
          </h3>
          <div style="background:#F8FAFC; border:1px solid #E2E8F0; padding:14px; border-radius:10px; font-size:0.86rem; color:#334155; line-height:1.65; margin-bottom:16px;">
            <div><strong>संस्थेचे नाव:</strong> छत्रपती शाहू महाराज बहुउद्देशीय संस्था</div>
            <div><strong>बँकेचे नाव:</strong> बँक ऑफ महाराष्ट्र (Bank of Maharashtra)</div>
            <div><strong>खाते क्रमांक:</strong> XXXXXXXXXXXX</div>
            <div><strong>आयएफएससी कोड:</strong> MAHB000XXXX</div>
            <div><strong>शाखा:</strong> छत्रपती संभाजीनगर / जळगाव, महाराष्ट्र</div>
          </div>

          <h3 style="font-size:1.02rem; font-weight:700; color:#1E293B; margin-bottom:10px; display:flex; align-items:center; gap:8px;">
            <i class="fas fa-qrcode" style="color:#059669;"></i> UPI / QR द्वारे पेमेंट (GPay / PhonePe / Paytm)
          </h3>
          <div style="background:#F8FAFC; border:1px solid #E2E8F0; padding:14px; border-radius:10px; text-align:center; margin-bottom:18px;">
            <div style="font-weight:700; color:#059669; font-size:1.05rem; margin-bottom:4px;">UPI ID: csmbsanstha@upi</div>
            <p style="font-size:0.82rem; color:#64748B; margin:0 0 8px;">मोबाईल नंबरवर डायरेक्ट ट्रांसफर करा:</p>
            <div style="font-size:1.05rem; font-weight:800; color:#1E293B; background:#ffffff; display:inline-block; padding:8px 16px; border-radius:8px; border:1px dashed #059669;">
              <i class="fas fa-mobile-alt" style="color:#059669;"></i> +91 9021757353 / +91 8007474503
            </div>
          </div>

          <div style="text-align:center;">
            <a href="https://wa.me/919021757353?text=नमस्कार,%20मी%20छत्रपती%20शाहू%20महाराज%20संस्थेला%20देणगी%20दिली%20आहे.%20पावती%20साठी%20तपशील." target="_blank" class="btn" style="background:#25D366; color:#ffffff; width:100%; border-radius:10px; padding:12px; font-weight:700; display:inline-flex; align-items:center; justify-content:center; gap:8px; text-decoration:none; box-shadow:0 4px 12px rgba(37,211,102,0.3);">
              <i class="fab fa-whatsapp" style="font-size:1.3rem;"></i> देणगी पावती व ८०जी पावतीसाठी WhatsApp करा
            </a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeDonationModal();
      }
    });
  } else {
    modal.classList.add('active');
    modal.style.setProperty('display', 'flex', 'important');
  }

  const navMenu = document.querySelector('.nav-menu');
  const hamburger = document.querySelector('.hamburger');
  if (navMenu && navMenu.classList.contains('active')) {
    navMenu.classList.remove('active');
    if (hamburger) hamburger.classList.remove('active');
  }
}
window.openDonationModal = openDonationModal;

function initDonationModal() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.open-donation-modal-btn');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      openDonationModal();
    }
  });
}



