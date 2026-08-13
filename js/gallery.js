/* ==========================================================================
   Chhatrapati Shahu Maharaj Bahuuddeshiya Sanstha
   Gallery Filter & Lightbox Viewer Module
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initGalleryFilter();
  initLightbox();
});

/* --- Category Filter for Gallery & Projects --- */
function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('.gallery-filter-btn, .project-filter-btn');
  const items = document.querySelectorAll('.gallery-item, .project-card');

  if (filterBtns.length === 0 || items.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      items.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          item.style.display = 'block';
          setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'scale(1)'; }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.8)';
          setTimeout(() => { item.style.display = 'none'; }, 300);
        }
      });
    });
  });
}

/* --- Lightbox Viewer Popup & Document Zoom (Triggered ONLY on clicking text) --- */
function initLightbox() {
  const triggerItems = document.querySelectorAll('.zoom-trigger, .gallery-item p, .doc-card p, .zoomable-text');

  // Create Lightbox DOM if not exists
  let modal = document.querySelector('.lightbox-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'lightbox-modal';
    modal.innerHTML = `
      <span class="lightbox-close">&times;</span>
      <div class="lightbox-content">
        <img src="" alt="Image Preview" id="lightboxImg">
        <div class="lightbox-caption" id="lightboxCaption"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeBtn = modal.querySelector('.lightbox-close');

  triggerItems.forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const card = item.closest('.gallery-item, .doc-card, .news-album-card, .misc-album-card, .doctor-album-card, .card');
      const img = card ? card.querySelector('img') : null;
      const title = card?.querySelector('h4, h3, .gallery-title, .doc-title')?.innerText || img?.alt || 'छायाचित्र दर्शन';

      if (img && img.src) {
        lightboxImg.src = img.src;
        lightboxCaption.innerHTML = `<h3>${title}</h3>`;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  // Initialize Health Card Booklet switcher if present
  initBookletSwitcher();
}

/* --- Health Card Booklet Interactive Viewer --- */
function initBookletSwitcher() {
  const thumbs = document.querySelectorAll('.booklet-thumb');
  const mainImg = document.getElementById('bookletMainImg');
  const pageCounter = document.getElementById('bookletPageCounter');

  if (!thumbs.length || !mainImg) return;

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');

      const fullSrc = thumb.getAttribute('data-fullsrc') || thumb.querySelector('img').src;
      mainImg.src = fullSrc;
      if (pageCounter) {
        pageCounter.innerText = `पृष्ठ ${index + 1} / ${thumbs.length}`;
      }
    });
  });
}

