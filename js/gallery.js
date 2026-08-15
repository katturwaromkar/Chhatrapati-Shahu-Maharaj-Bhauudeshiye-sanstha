/* ==========================================================================
   Chhatrapati Shahu Maharaj Bahuuddeshiya Sanstha
   Gallery Filter & Lightbox Viewer Module
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initGalleryFilter();
  initMiscGallery();
  initLightbox();
});

/* --- Category & City Filter for Gallery, Doctors, Hospitals & Projects --- */
function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('.gallery-filter-btn, .project-filter-btn');
  const items = document.querySelectorAll('.gallery-item, .project-card, .doctor-album-card, .gallery-grid > .card, .hospitals-grid > .card');

  if (filterBtns.length > 0 && items.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        items.forEach(item => {
          const category = item.getAttribute('data-category');
          const itemText = item.innerText.toLowerCase();
          
          let isMatch = false;
          if (filterValue === 'all') {
            isMatch = true;
          } else if (category && category === filterValue) {
            isMatch = true;
          } else if (filterValue === 'sambhajinagar' && (itemText.includes('संभाजीनगर') || itemText.includes('पेज १') || itemText.includes('पेज २'))) {
            isMatch = true;
          } else if (filterValue === 'jalgaon' && (itemText.includes('जळगाव') || itemText.includes('पेज ३') || itemText.includes('पेज ४'))) {
            isMatch = true;
          } else if (filterValue === 'pune' && (itemText.includes('पुणे') || itemText.includes('पेज ५') || itemText.includes('पेज ६'))) {
            isMatch = true;
          } else if (filterValue === 'nashik' && (itemText.includes('नाशिक') || itemText.includes('पेज ७') || itemText.includes('पेज ८'))) {
            isMatch = true;
          }

          if (isMatch) {
            item.style.display = '';
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.9)';
            setTimeout(() => {
              if (item.style.opacity === '0') item.style.display = 'none';
            }, 200);
          }
        });
      });
    });
  }

  // Doctor Live Search Input Handler
  const doctorSearchInput = document.getElementById('doctorSearchInput');
  if (doctorSearchInput && items.length > 0) {
    doctorSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      items.forEach(item => {
        const text = item.innerText.toLowerCase();
        if (!q || text.includes(q)) {
          item.style.display = '';
          item.style.opacity = '1';
        } else {
          item.style.opacity = '0';
          item.style.display = 'none';
        }
      });
    });
  }
}

/* --- Lightbox Viewer Popup & Document Zoom --- */
function initLightbox() {
  if (window.initImageLightbox) {
    window.initImageLightbox();
  }
}
window.initLightbox = initLightbox;

/* --- Dynamic Miscellaneous Gallery Loader --- */
function initMiscGallery() {
  const container = document.querySelector('.misc-album-grid');
  if (!container || !window.MISC_IMAGES || !window.MISC_IMAGES.length) return;

  let currentIndex = 0;
  const BATCH_SIZE = 24;

  function renderBatch() {
    const nextBatch = window.MISC_IMAGES.slice(currentIndex, currentIndex + BATCH_SIZE);
    
    nextBatch.forEach((fileName, i) => {
      const globalIdx = currentIndex + i + 1;
      const card = document.createElement('div');
      card.className = 'misc-album-card reveal active';
      card.innerHTML = `
        <div class="misc-album-img-wrap">
          <img src="assets/images/miscellaneous/${fileName}" alt="विविध सामाजिक उपक्रम photo ${globalIdx}" class="misc-album-img" loading="lazy">
        </div>
        <div class="misc-album-caption">
          <h4>संकीर्ण व विविध सामाजिक उपक्रम #${globalIdx}</h4>
          <p><i class="fas fa-search-plus"></i> मोठ्या आकारात पाहण्यासाठी क्लिक करा</p>
        </div>
      `;
      container.appendChild(card);
    });

    currentIndex += nextBatch.length;

    let loadBtn = document.getElementById('loadMoreMiscBtn');
    if (currentIndex < window.MISC_IMAGES.length) {
      if (!loadBtn) {
        loadBtn = document.createElement('button');
        loadBtn.id = 'loadMoreMiscBtn';
        loadBtn.className = 'btn btn-primary btn-lg';
        loadBtn.style.cssText = 'display: block; margin: 35px auto 0 auto; padding: 12px 36px; cursor: pointer;';
        loadBtn.innerHTML = `<i class="fas fa-images"></i> आणखी फोटो दाखवा (Load More Photos - ${window.MISC_IMAGES.length - currentIndex} remaining)`;
        loadBtn.addEventListener('click', renderBatch);
        container.parentNode.appendChild(loadBtn);
      } else {
        loadBtn.innerHTML = `<i class="fas fa-images"></i> आणखी फोटो दाखवा (Load More Photos - ${window.MISC_IMAGES.length - currentIndex} remaining)`;
      }
    } else if (loadBtn) {
      loadBtn.remove();
    }

    if (window.initLightbox) {
      window.initLightbox();
    }
  }

  container.innerHTML = '';
  renderBatch();
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

