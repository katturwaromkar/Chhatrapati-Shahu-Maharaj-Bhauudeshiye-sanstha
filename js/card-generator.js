/* ==========================================================================
   Chhatrapati Shahu Maharaj Bahuuddeshiya Sanstha
   Family Health Card Online Application, Digital Generator & Verification Module
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initHealthCardApplication();
  initHealthCardVerification();
  initHospitalDirectory();
  initLanguageSwitcher();
  syncHealthCardsFromCloud();
  setInterval(syncHealthCardsFromCloud, 4000);
});

const RESTFUL_CARDS_URL = 'https://api.restful-api.dev/objects/ff8081819ff5b11001a0286d82a474b1';

/* --- Real-Time Cross-Device Health Card Cloud Sync --- */
async function syncHealthCardsFromCloud() {
  const endpoints = [RESTFUL_CARDS_URL, 'api/cards'];
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { cache: 'no-store' });
      if (response.ok) {
        const text = await response.text();
        if (text.trim().startsWith('{')) {
          const json = JSON.parse(text);
          const cloudCards = json.data?.cards || json.cards || json;
          if (cloudCards && typeof cloudCards === 'object') {
            const storedCards = JSON.parse(localStorage.getItem('CSM_CARDS') || '{}');
            const merged = { ...sampleCardsDB, ...storedCards, ...cloudCards };
            localStorage.setItem('CSM_CARDS', JSON.stringify(merged));
            return;
          }
        }
      }
    } catch (err) {
      console.warn(`Card sync failed for ${endpoint}:`, err);
    }
  }
}

async function saveHealthCardToCloudAPI(cardData) {
  const storedCards = JSON.parse(localStorage.getItem('CSM_CARDS') || '{}');
  storedCards[cardData.cardId] = cardData;
  localStorage.setItem('CSM_CARDS', JSON.stringify(storedCards));

  try {
    const payload = {
      name: "CSM_SANSTHA_CARDS_DB_2026",
      data: { cards: storedCards }
    };
    await fetch(RESTFUL_CARDS_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Card cloud PUT failed:', err);
  }
}

/* --- Sample Pre-loaded Verified Cards Database --- */
const sampleCardsDB = {
  "CSM-2026-5559": {
    cardId: "CSM-2026-5559",
    name: "आकाश संभाजी अरके (Akash S. Arke)",
    phone: "+91 9021757353",
    city: "छत्रपती संभाजीनगर",
    issued: "15 Jan 2026",
    validTill: "31 Mar 2027",
    status: "सक्रिय (ACTIVE)",
    members: ["आकाश अरके (मुख्य)", "सुनीता अरके (पत्नी)", "अनिकेत अरके (मुलगा)"],
    discount: "२०% ओपीडी सवलत, २५% लॅब टेस्ट सवलत"
  },
  "CSM-2026-8942": {
    cardId: "CSM-2026-8942",
    name: "विजय रामभाऊ पाटील (Vijay R. Patil)",
    phone: "+91 9822012345",
    city: "जळगाव",
    issued: "01 Feb 2026",
    validTill: "31 Mar 2027",
    status: "सक्रिय (ACTIVE)",
    members: ["विजय पाटील (मुख्य)", "रेखा पाटील (पत्नी)", "सुरेश पाटील (वडील)"],
    discount: "२०% ओपीडी सवलत, १५% आयपीडी सवलत"
  }
};

/* --- Health Card Online Application & Digital Generator --- */
function initHealthCardApplication() {
  // Global modal triggers
  document.querySelectorAll('.open-card-apply-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCardModal();
    });
  });

  // Global submit event listener delegation for healthCardApplyForm
  document.addEventListener('submit', (e) => {
    if (e.target && e.target.id === 'healthCardApplyForm') {
      e.preventDefault();

      const name = document.getElementById('cardHeadName')?.value.trim();
      const phone = document.getElementById('cardHeadPhone')?.value.trim();
      const aadhaar = document.getElementById('cardAadhaar')?.value.trim();
      const city = document.getElementById('cardCity')?.value;
      const member1 = document.getElementById('cardMember1')?.value.trim();
      const member2 = document.getElementById('cardMember2')?.value.trim();

      if (!name || !phone || !city) {
        showToast('कृपया सर्व आवश्यक माहिती भरा.', 'warning');
        return;
      }

      // Generate Unique Registration ID
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const cardId = `CSM-2026-${randomNum}`;

      const membersList = [name + " (प्रमुख)"];
      if (member1) membersList.push(member1);
      if (member2) membersList.push(member2);

      const maskedAadhaar = maskAadhaar(aadhaar);
      const cardData = {
        cardId: cardId,
        name: name,
        phone: phone,
        aadhaar: maskedAadhaar,
        city: city,
        issued: new Date().toLocaleDateString('mr-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        validTill: "31 मार्च 2027",
        status: "सक्रिय (ACTIVE)",
        members: membersList,
        discount: "२०% ओपीडी सवलत, २५% लॅब टेस्ट सवलत"
      };

      // Save in LocalStorage and Sync to Cloud Database
      const storedCards = JSON.parse(localStorage.getItem('CSM_CARDS') || '{}');
      storedCards[cardId] = cardData;
      localStorage.setItem('CSM_CARDS', JSON.stringify(storedCards));
      saveHealthCardToCloudAPI(cardData);

      // Render Live Digital Card Preview
      renderDigitalCardPreview(cardData);
      showToast(`अभिनंदन! तुमचे फॅमिली हेल्थ कार्ड तयार झाले आहे. नोंदणी क्र: ${cardId}`, 'success');
    }
  });
}

function maskAadhaar(str) {
  if (!str) return "XXXX-XXXX-4829";
  const digits = str.replace(/\D/g, '');
  if (digits.length >= 4) {
    return `XXXX-XXXX-${digits.slice(-4)}`;
  }
  return "XXXX-XXXX-4829";
}

function openCardModal() {
  let modal = document.getElementById('cardApplyModal');
  if (!modal) {
    createApplyModalDOM();
    modal = document.getElementById('cardApplyModal');
  }
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCardModal() {
  const modal = document.getElementById('cardApplyModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

function renderDigitalCardPreview(data) {
  const previewContainer = document.getElementById('digitalCardResultWrapper');
  if (!previewContainer) return;

  const currentOrigin = window.location.origin && window.location.origin !== 'null' && !window.location.origin.includes('file://') ? window.location.origin : 'https://chatrpatishahumaharajbahuuddeshiyasanstha.in';
  const verifyUrl = `${currentOrigin}/family-health-card.html?verify=${encodeURIComponent(data.cardId)}`;
  const qrCodeImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}&color=1E2432&bgcolor=FFFFFF`;

  previewContainer.innerHTML = `
    <div class="card-preview-container reveal active">
      <div class="card-success-badge">
        <i class="fas fa-check-circle"></i> डिजिटल फॅमिली हेल्थ कार्ड यशस्वीरीत्या तयार झाले!
      </div>
      
      <!-- Physical Digital Card UI -->
      <div class="digital-health-card" id="printableHealthCard">
        <div class="dhc-header">
          <div class="dhc-logo">
            <i class="fas fa-hands-holding-child"></i>
            <div>
              <h3>छत्रपती शाहू महाराज बहुउद्देशीय संस्था</h3>
              <span>REG NO: 699(MH) F 5559 | फॅमिली हेल्थ कार्ड</span>
            </div>
          </div>
          <div class="dhc-chip">
            <i class="fas fa-microchip"></i>
          </div>
        </div>

        <div class="dhc-body">
          <div class="dhc-photo-box">
            <i class="fas fa-user-circle"></i>
            <span class="dhc-badge-active">सक्रिय कार्ड</span>
          </div>

          <div class="dhc-info">
            <div class="dhc-id-number">${data.cardId}</div>
            <div class="dhc-field">
              <span class="dhc-label">कुटुंब प्रमुख (Head Name):</span>
              <span class="dhc-val">${data.name}</span>
            </div>
            <div class="dhc-field">
              <span class="dhc-label">मोबाईल नंबर:</span>
              <span class="dhc-val">${data.phone}</span>
            </div>
            <div class="dhc-field">
              <span class="dhc-label">शहर/जिल्हा:</span>
              <span class="dhc-val">${data.city}</span>
            </div>
            <div class="dhc-field">
              <span class="dhc-label">समाविष्ट सदस्य:</span>
              <span class="dhc-val">${Array.isArray(data.members) ? data.members.join(', ') : data.members}</span>
            </div>
          </div>

          <div class="dhc-qr-box">
            <div class="qr-placeholder" style="background:#ffffff; padding:4px; border-radius:6px; border:1px solid #ddd; display:inline-block;">
              <img src="${qrCodeImgSrc}" alt="QR Code" style="width:75px; height:75px; display:block;" onerror="this.onerror=null; this.parentElement.innerHTML='<i class=\'fas fa-qrcode\' style=\'font-size:2.5rem;\'></i>';">
            </div>
            <span class="qr-text" style="font-size:0.75rem; font-weight:700; margin-top:4px; display:block; color:var(--primary);">Scan to Verify</span>
          </div>
        </div>

        <div class="dhc-footer">
          <div><i class="fas fa-calendar-check"></i> वैधता: ${data.validTill}</div>
          <div><i class="fas fa-hospital"></i> सवलत: २०% OPD / २५% Lab</div>
          <div><i class="fas fa-phone-alt"></i> 9021757353</div>
        </div>
      </div>

      <!-- Card Action Buttons -->
      <div class="card-action-btns" style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
        <button class="btn btn-primary" onclick="printHealthCard()">
          <i class="fas fa-print"></i> प्रिंट / PDF डाउनलोड
        </button>
        <button class="btn" style="background: #25D366; color: #fff; font-weight: 700;" onclick="shareCardOnWhatsApp('${data.cardId}', '${encodeURIComponent(data.name)}')">
          <i class="fab fa-whatsapp"></i> व्हॉट्सॲपवर पाठवा
        </button>
        <button class="btn btn-secondary" onclick="closeCardModal()">
          <i class="fas fa-times"></i> बंद करा
        </button>
      </div>
    </div>
  `;

  // Scroll to preview
  previewContainer.scrollIntoView({ behavior: 'smooth' });
}

/* --- Global Print & Share Card Functions --- */
window.printHealthCard = function() {
  window.print();
};

window.shareCardOnWhatsApp = function(cardId, name) {
  const decodedName = decodeURIComponent(name);
  const verifyUrl = `https://chatrpatishahumaharajbahuuddeshiyasanstha.in/family-health-card.html?verify=${cardId}`;
  const text = `नमस्कार! छत्रपती शाहू महाराज बहुउद्देशीय संस्थेचे फॅमिली हेल्थ कार्ड तयार झाले आहे.\n\n` +
               `*कार्डधारक:* ${decodedName}\n` +
               `*कार्ड आयडी:* ${cardId}\n` +
               `*सवलत:* २०% ओपीडी / २५% लॅब चाचण्या\n\n` +
               `कार्ड तपासणी दुवा: ${verifyUrl}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
};


/* --- Health Card Verification Lookup --- */
function initHealthCardVerification() {
  document.querySelectorAll('.open-card-verify-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openVerifyModal();
    });
  });

  // Check URL query parameters for auto verification (e.g. from scanned QR code)
  const urlParams = new URLSearchParams(window.location.search);
  const verifyParam = urlParams.get('verify');
  if (verifyParam) {
    openVerifyModal();
    setTimeout(() => {
      const input = document.getElementById('verifyCardNumberInput');
      if (input) {
        input.value = verifyParam;
        window.verifyHealthCardStatus();
      }
    }, 400);
  }
}

function openVerifyModal() {
  let modal = document.getElementById('cardVerifyModal');
  if (!modal) {
    createVerifyModalDOM();
    modal = document.getElementById('cardVerifyModal');
  }
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeVerifyModal() {
  const modal = document.getElementById('cardVerifyModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

window.verifyHealthCardStatus = function() {
  const input = document.getElementById('verifyCardNumberInput');
  const resultBox = document.getElementById('verifyResultContainer');
  if (!input || !resultBox) return;

  const cardId = input.value.trim().toUpperCase();

  if (!cardId) {
    resultBox.innerHTML = `<div class="verify-error"><i class="fas fa-exclamation-circle"></i> कृपया वैध फॅमिली हेल्थ कार्ड क्रमांक प्रविष्ट करा.</div>`;
    return;
  }

  // Check stored cards in LocalStorage or predefined DB
  const storedCards = JSON.parse(localStorage.getItem('CSM_CARDS') || '{}');
  const cardData = storedCards[cardId] || sampleCardsDB[cardId];

  if (cardData) {
    resultBox.innerHTML = `
      <div class="verify-success-box">
        <div class="v-header">
          <i class="fas fa-shield-check" style="font-size: 2.5rem; color: var(--success);"></i>
          <div>
            <h3 style="color: var(--success); margin-bottom: 2px;">वैध फॅमिली हेल्थ कार्ड (VERIFIED ACTIVE)</h3>
            <span style="font-weight: 700; font-size: 1.1rem; color: var(--primary);">${cardData.cardId}</span>
          </div>
        </div>
        <div class="v-grid" style="margin-top: 1rem;">
          <div><strong>कुटुंब प्रमुख:</strong> ${cardData.name}</div>
          <div><strong>मोबाईल:</strong> ${cardData.phone}</div>
          <div><strong>शहर/जिल्हा:</strong> ${cardData.city}</div>
          <div><strong>वैधता मुदत:</strong> ${cardData.validTill}</div>
          <div style="grid-column: 1 / -1;"><strong>पात्र सवलत:</strong> ${cardData.discount}</div>
          <div style="grid-column: 1 / -1;"><strong>नोंदणीकृत सदस्य:</strong> ${Array.isArray(cardData.members) ? cardData.members.join(', ') : cardData.members}</div>
        </div>
      </div>
    `;
  } else {
    resultBox.innerHTML = `
      <div class="verify-error">
        <i class="fas fa-times-circle" style="font-size: 2rem; color: var(--danger);"></i>
        <div>
          <h4>कार्ड सापडले नाही (${cardId})</h4>
          <p>कृपया कार्ड क्रमांक तपासा किंवा नवीन फॅमिली हेल्थ कार्डसाठी अर्ज करा.</p>
          <button class="btn btn-primary btn-sm" onclick="closeVerifyModal(); openCardModal();" style="margin-top: 8px;">
            <i class="fas fa-id-card"></i> नवीन कार्ड अर्ज करा
          </button>
        </div>
      </div>
    `;
  }
};

/* --- Hospital & Doctor Directory Filter --- */
function initHospitalDirectory() {
  const searchInput = document.getElementById('hospSearchInput');
  const citySelect = document.getElementById('hospCitySelect');
  const specSelect = document.getElementById('hospSpecSelect');
  const hospCards = document.querySelectorAll('.hosp-card');

  if (hospCards.length === 0) return;

  function filterHospitals() {
    const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const city = citySelect ? citySelect.value : 'all';
    const spec = specSelect ? specSelect.value : 'all';

    hospCards.forEach(card => {
      const text = card.innerText.toLowerCase();
      const cardCity = card.getAttribute('data-city') || '';
      const cardSpec = card.getAttribute('data-spec') || '';

      const matchesText = q === '' || text.includes(q);
      const matchesCity = city === 'all' || cardCity === city;
      const matchesSpec = spec === 'all' || cardSpec === spec;

      if (matchesText && matchesCity && matchesSpec) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  if (searchInput) searchInput.addEventListener('input', filterHospitals);
  if (citySelect) citySelect.addEventListener('change', filterHospitals);
  if (specSelect) specSelect.addEventListener('change', filterHospitals);
}

/* --- Dynamic Language Switcher (Marathi / English) --- */
function initLanguageSwitcher() {
  const langToggleBtns = document.querySelectorAll('.lang-toggle-btn');
  if (langToggleBtns.length === 0) return;

  const savedLang = localStorage.getItem('CSM_LANG') || 'mr';
  setLanguage(savedLang);

  langToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = localStorage.getItem('CSM_LANG') || 'mr';
      const newLang = current === 'mr' ? 'en' : 'mr';
      setLanguage(newLang);
    });
  });
}

function setLanguage(lang) {
  localStorage.setItem('CSM_LANG', lang);
  const langBtns = document.querySelectorAll('.lang-toggle-btn');

  langBtns.forEach(btn => {
    btn.innerHTML = lang === 'mr' 
      ? `<i class="fas fa-globe"></i> English` 
      : `<i class="fas fa-globe"></i> मराठी`;
  });

  // Toggle visible bilingual spans if annotated
  document.querySelectorAll('[data-lang-mr]').forEach(el => {
    if (lang === 'en' && el.getAttribute('data-lang-en')) {
      el.textContent = el.getAttribute('data-lang-en');
    } else if (lang === 'mr' && el.getAttribute('data-lang-mr')) {
      el.textContent = el.getAttribute('data-lang-mr');
    }
  });
}

/* --- Create Apply Modal DOM dynamically if not in page --- */
function createApplyModalDOM() {
  const modalDiv = document.createElement('div');
  modalDiv.id = 'cardApplyModal';
  modalDiv.className = 'custom-modal';
  modalDiv.innerHTML = `
    <div class="custom-modal-content">
      <span class="custom-modal-close" onclick="closeCardModal()">&times;</span>
      <div class="custom-modal-header">
        <i class="fas fa-id-card" style="font-size: 2rem; color: var(--primary);"></i>
        <div>
          <h2>फॅमिली हेल्थ कार्ड ऑनलाइन नोंदणी अर्ज (2026-27)</h2>
          <p style="margin-bottom:0;">छत्रपती शाहू महाराज बहुउद्देशीय संस्था - REG NO 699(MH) F 5559</p>
        </div>
      </div>

      <div class="custom-modal-body">
        <form id="healthCardApplyForm">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">कुटुंब प्रमुखाचे नाव (Head Name) *</label>
              <input type="text" id="cardHeadName" class="form-control" placeholder="उदा. आकाश संभाजी अरके" required>
            </div>
            <div class="form-group">
              <label class="form-label">मोबाईल नंबर (Phone) *</label>
              <input type="tel" id="cardHeadPhone" class="form-control" placeholder="१० अंकी मोबाईल नंबर" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">आधार नंबर (Aadhaar Number)</label>
              <input type="text" id="cardAadhaar" class="form-control" placeholder="XXXX-XXXX-XXXX">
            </div>
            <div class="form-group">
              <label class="form-label">शहर / जिल्हा (City) *</label>
              <select id="cardCity" class="form-control" required>
                <option value="छत्रपती संभाजीनगर">छत्रपती संभाजीनगर (Chh. Sambhajinagar)</option>
                <option value="जळगाव">जळगाव (Jalgaon)</option>
                <option value="इतर शहर (महाराष्ट्र)">इतर शहर (महाराष्ट्र)</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">इतर कौटुंबिक सदस्य (Family Members)</label>
            <div class="form-row">
              <input type="text" id="cardMember1" class="form-control" placeholder="सदस्य १ (उदा. पत्नी/मुलगा)">
              <input type="text" id="cardMember2" class="form-control" placeholder="सदस्य २ (उदा. आई/वडील)">
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 1rem;">
            <i class="fas fa-magic"></i> हेल्थ कार्ड तयार करा (Generate Health Card)
          </button>
        </form>

        <div id="digitalCardResultWrapper" style="margin-top: 1.5rem;"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modalDiv);

  modalDiv.addEventListener('click', (e) => {
    if (e.target === modalDiv) closeCardModal();
  });
}

/* --- Create Verify Modal DOM dynamically if not in page --- */
function createVerifyModalDOM() {
  const modalDiv = document.createElement('div');
  modalDiv.id = 'cardVerifyModal';
  modalDiv.className = 'custom-modal';
  modalDiv.innerHTML = `
    <div class="custom-modal-content" style="max-width: 550px;">
      <span class="custom-modal-close" onclick="closeVerifyModal()">&times;</span>
      <div class="custom-modal-header">
        <i class="fas fa-search-location" style="font-size: 2rem; color: var(--primary);"></i>
        <div>
          <h2>हेल्थ कार्ड वैधता पडताळणी (Card Verification)</h2>
          <p style="margin-bottom:0;">कार्ड क्रमांक टाकून सक्रिय स्थिती व सवलत तपासा.</p>
        </div>
      </div>

      <div class="custom-modal-body">
        <div class="form-group">
          <label class="form-label">हेल्थ कार्ड क्रमांक (Card Registration Number) *</label>
          <div style="display: flex; gap: 8px;">
            <input type="text" id="verifyCardNumberInput" class="form-control" placeholder="उदा. CSM-2026-5559 किंवा CSM-2026-8942">
            <button class="btn btn-primary" onclick="verifyHealthCardStatus()">
              <i class="fas fa-search"></i> तपासा
            </button>
          </div>
          <span style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; display: inline-block;">
            डेमो कार्ड: CSM-2026-5559 किंवा CSM-2026-8942
          </span>
        </div>

        <div id="verifyResultContainer" style="margin-top: 1rem;"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modalDiv);

  modalDiv.addEventListener('click', (e) => {
    if (e.target === modalDiv) closeVerifyModal();
  });
}
