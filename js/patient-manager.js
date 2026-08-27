/* ==========================================================================
   Chhatrapati Shahu Maharaj Bahuuddeshiya Sanstha
   Multi-Device Shared Patient Database Sync & Management System Module
   ========================================================================== */

// Authorized Security PIN for Deleting Patient Records
const SECURITY_DELETE_PIN = 'pranav8208623009';
let pendingDeleteRegId = null;

// Robust Global Toast Notification Helper (Prevents ReferenceError)
function showToast(message, type = 'info') {
  let container = document.getElementById('csmsToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'csmsToastContainer';
    container.style.cssText = 'position:fixed; top:20px; right:20px; z-index:9999999; display:flex; flex-direction:column; gap:10px; pointer-events:none;';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  const bg = type === 'success' ? '#28a745' : (type === 'warning' ? '#ff9800' : (type === 'error' ? '#dc3545' : '#6F4BFF'));
  const icon = type === 'success' ? 'fa-check-circle' : (type === 'warning' ? 'fa-exclamation-triangle' : (type === 'error' ? 'fa-times-circle' : 'fa-info-circle'));
  
  toast.style.cssText = `background:${bg}; color:#fff; padding:12px 20px; border-radius:10px; font-weight:700; font-size:0.9rem; box-shadow:0 8px 25px rgba(0,0,0,0.25); transition:all 0.3s ease; pointer-events:auto; font-family:'Noto Sans Devanagari', sans-serif; display:flex; align-items:center; gap:10px;`;
  toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => { toast.remove(); }, 300);
  }, 4000);
}
window.showToast = showToast;

document.addEventListener('DOMContentLoaded', () => {
  initPatientRegistration();
  initPatientTable();
  initCameraCapture();
  initPatientSearch();
  syncPatientsFromCloud(); // Initial cross-device sync on load

  // Poll cloud database every 4 seconds so data added on any device displays to all users
  setInterval(syncPatientsFromCloud, 4000);
});

/* --- Pre-loaded Registered Patients Database & Storage Helpers --- */
const initialSamplePatients = [];

function getStoredPatients() {
  const data = localStorage.getItem('CSM_PATIENTS');
  if (!data) {
    savePatients([]);
    return [];
  }
  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    // Filter out initial sample records if present
    const sampleIds = ["REG-PAT-2026-1609", "REG-PAT-2026-1001", "REG-PAT-2026-1002", "REG-PAT-2026-1535", "REG-PAT-2026-1296"];
    const filtered = parsed.filter(p => p && p.regId && !sampleIds.includes(p.regId) && !((p.name || '').toLowerCase().includes('katturwar')));
    if (filtered.length !== parsed.length) {
      savePatients(filtered);
    }
    return filtered;
  } catch (e) {
    return [];
  }
}

function savePatients(patients) {
  try {
    const jsonStr = JSON.stringify(patients);
    localStorage.setItem('CSM_PATIENTS', jsonStr);
    localStorage.setItem('CSM_PATIENTS_BACKUP', jsonStr);
  } catch (err) {
    console.warn('Storage quota exceeded: ', err);
  }
}

/* --- Image Compression Helper (Prevents HTTP 413 Payload Too Large) --- */
function compressImageBase64(base64Str, maxWidth = 600, quality = 0.6) {
  return new Promise((resolve) => {
    if (!base64Str || !base64Str.startsWith('data:image')) {
      resolve(base64Str);
      return;
    }
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(base64Str);
    img.src = base64Str;
  });
}

// Get candidate API endpoints (supports Vercel Serverless API + cPanel PHP backend + live production domain)
function getApiEndpoints() {
  const endpoints = ['api/patients', 'api/patients.js', 'api/patients.php'];
  const prodUrl = 'https://chatrpatishahumaharajbahuuddeshiyasanstha.in/api/patients.php';
  if (!window.location.href.includes('chatrpatishahumaharajbahuuddeshiyasanstha.in')) {
    endpoints.push(prodUrl);
  }
  return endpoints;
}

const RESTFUL_PATIENTS_URL = 'https://api.restful-api.dev/objects/ff8081819ff5b11001a0286cc47274af';
let lastPatientHash = '';

/* --- Robust Real-Time Cross-Device Cloud Sync Function --- */
async function syncPatientsFromCloud() {
  const endpoints = ['api/patients', RESTFUL_PATIENTS_URL];
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { cache: 'no-store' });
      if (response.ok) {
        const text = await response.text();
        if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
          const json = JSON.parse(text);
          let cloudPatients = Array.isArray(json) ? json : (json.data?.patients || json.patients || null);
          if (Array.isArray(cloudPatients) && cloudPatients.length > 0) {
            const localPatients = getStoredPatients();
            const mergedMap = new Map();

            const sampleIds = ["REG-PAT-2026-1609", "REG-PAT-2026-1001", "REG-PAT-2026-1002", "REG-PAT-2026-1535", "REG-PAT-2026-1296"];
            // Cloud records take precedence for live synchronization across devices
            cloudPatients.forEach(p => {
              if (p && p.regId && !sampleIds.includes(p.regId) && !((p.name || '').toLowerCase().includes('katturwar'))) {
                mergedMap.set(p.regId, p);
              }
            });
            localPatients.forEach(p => {
              if (p && p.regId && !sampleIds.includes(p.regId) && !((p.name || '').toLowerCase().includes('katturwar')) && !mergedMap.has(p.regId)) {
                mergedMap.set(p.regId, p);
              }
            });

            const mergedList = Array.from(mergedMap.values());
            savePatients(mergedList);

            const newHash = mergedList.length + '_' + (mergedList[0]?.regId || '');
            if (newHash !== lastPatientHash) {
              lastPatientHash = newHash;
              initPatientTable();
            }
            return; // Successful sync from working endpoint
          }
        }
      }
    } catch (err) {
      console.warn(`Sync attempt failed for ${endpoint}:`, err);
    }
  }
}

// Post new or edited patient record to shared cloud database across all candidate endpoints
async function savePatientToCloudAPI(patientRecord) {
  const currentLocal = getStoredPatients();
  const existingIdx = currentLocal.findIndex(p => p.regId === patientRecord.regId);
  if (existingIdx >= 0) {
    currentLocal[existingIdx] = { ...currentLocal[existingIdx], ...patientRecord };
  } else {
    currentLocal.unshift(patientRecord);
  }
  savePatients(currentLocal);

  // Sync to Hostinger local endpoint
  try {
    await fetch('api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientRecord)
    });
  } catch (e) {}

  // Sync to persistent cloud database
  try {
    const payload = {
      name: "CSM_SANSTHA_LIVE_DATABASE_2026",
      data: { patients: currentLocal }
    };
    await fetch(RESTFUL_PATIENTS_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Cloud PUT failed:', err);
  }
}

// Delete patient record from shared cloud database across all candidate endpoints
async function deletePatientFromCloudAPI(regId) {
  const currentLocal = getStoredPatients().filter(p => p.regId !== regId);
  savePatients(currentLocal);

  try {
    await fetch(`api/patients?action=delete&regId=${encodeURIComponent(regId)}`, {
      method: 'DELETE'
    });
  } catch (e) {}

  try {
    const payload = {
      name: "CSM_SANSTHA_LIVE_DATABASE_2026",
      data: { patients: currentLocal }
    };
    await fetch(RESTFUL_PATIENTS_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Cloud delete failed:', err);
  }
}

// Temporary hold for uploaded/captured base64 photos (New Registration)
let currentAadhaarBase64 = null;
let currentPanBase64 = null;

// Temporary hold for uploaded/captured base64 photos (Edit Mode)
let editAadhaarBase64 = null;
let editPanBase64 = null;
let editingRegId = null;

/* --- Form Handling & Image Previews --- */
function initPatientRegistration() {
  const form = document.getElementById('patientRegistrationForm');
  if (!form) return;

  // Aadhaar File Upload Handler with auto-compression
  const aadhaarFileInput = document.getElementById('aadhaarFile');
  if (aadhaarFileInput) {
    aadhaarFileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async function(evt) {
          currentAadhaarBase64 = await compressImageBase64(evt.target.result);
          displayImagePreview('aadhaarPreview', currentAadhaarBase64, 'आधार कार्ड फोटो जोडला');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // PAN File Upload Handler with auto-compression
  const panFileInput = document.getElementById('panFile');
  if (panFileInput) {
    panFileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          currentPanBase64 = evt.target.result;
          displayImagePreview('panPreview', currentPanBase64, 'पॅन कार्ड फोटो जोडला');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Form Submit Handler
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('patName')?.value.trim();
    const gender = document.getElementById('patGender')?.value || "पुरुष";
    const age = document.getElementById('patAge')?.value.trim();
    const phone = document.getElementById('patPhone')?.value.trim();
    const emergencyPhone = document.getElementById('patEmergencyPhone')?.value.trim();
    const bloodGroup = document.getElementById('patBloodGroup')?.value || "माहित नाही";
    const rawAadhaarInput = document.getElementById('patAadhaar')?.value.trim() || '';
    const pan = document.getElementById('patPan')?.value.trim().toUpperCase() || "माहित नाही";
    const address = document.getElementById('patAddress')?.value.trim() || '';
    const city = document.getElementById('patCity')?.value.trim();
    const pincode = document.getElementById('patPincode')?.value.trim() || '';
    const notes = document.getElementById('patNotes')?.value.trim() || '';

    if (!name || !phone || !city) {
      showToast('कृपया आवश्यक माहिती (नाव, मोबाईल, शहर) पूर्ण भरा.', 'warning');
      return;
    }

    if (phone.replace(/\D/g, '').length < 10) {
      showToast('कृपया १० अंकी वैध मोबाईल नंबर टाका.', 'warning');
      return;
    }

    const cleanAadhaar = rawAadhaarInput.replace(/\D/g, '');
    if (cleanAadhaar.length > 0 && cleanAadhaar.length !== 12) {
      showToast('आधार क्रमांक १२ अंकी असणे आवश्यक आहे.', 'warning');
      return;
    }

    const randomId = Math.floor(1000 + Math.random() * 9000);
    const regId = `REG-PAT-2026-${randomId}`;

    const maskedAadhaar = cleanAadhaar.length === 12 
      ? `XXXX-XXXX-${cleanAadhaar.slice(-4)}` 
      : (cleanAadhaar.length > 0 ? cleanAadhaar : "माहित नाही");

    const newPatient = {
      regId: regId,
      name: name,
      gender: gender,
      age: age || "--",
      phone: phone,
      emergencyPhone: emergencyPhone || phone,
      bloodGroup: bloodGroup,
      aadhaar: maskedAadhaar,
      rawAadhaar: cleanAadhaar || rawAadhaarInput,
      pan: pan,
      address: address || city,
      city: city,
      pincode: pincode,
      notes: notes || "सक्रिय रुग्ण नोंदणी",
      regDate: new Date().toISOString().split('T')[0],
      status: "सक्रिय (ACTIVE)",
      aadhaarPhoto: currentAadhaarBase64,
      panPhoto: currentPanBase64
    };

    const patients = getStoredPatients();
    patients.unshift(newPatient);
    savePatients(patients);

    savePatientToCloudAPI(newPatient);

    form.reset();
    currentAadhaarBase64 = null;
    currentPanBase64 = null;
    clearPreview('aadhaarPreview');
    clearPreview('panPreview');

    initPatientTable();

    showToast(`अभिनंदन! रुग्ण नोंदणी यशस्वी झाली. नोंदणी क्रमांक: ${regId}`, 'success');

    showRegistrationSuccessModal(newPatient);

    const tableEl = document.getElementById('patientDirectorySection');
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

function displayImagePreview(containerId, base64Src, title) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `
    <div style="position: relative; display: inline-block; margin-top: 10px;">
      <img src="${base64Src}" alt="${title}" style="max-width: 140px; max-height: 100px; border-radius: 8px; border: 2px solid var(--primary); object-fit: cover;">
      <span style="position: absolute; top: -8px; right: -8px; background: #28a745; color: #fff; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; cursor: pointer;" onclick="clearPreview('${containerId}')"><i class="fas fa-check"></i></span>
      <div style="font-size: 0.75rem; color: var(--success); font-weight: 700; text-align: center; margin-top: 2px;">${title}</div>
    </div>
  `;
}

window.clearPreview = function(containerId) {
  const container = document.getElementById(containerId);
  if (container) container.innerHTML = '';
  if (containerId === 'aadhaarPreview') currentAadhaarBase64 = null;
  if (containerId === 'panPreview') currentPanBase64 = null;
  if (containerId === 'editAadhaarPreview') editAadhaarBase64 = null;
  if (containerId === 'editPanPreview') editPanBase64 = null;
};

/* --- Registration Success Modal Banner --- */
function showRegistrationSuccessModal(patient) {
  let modal = document.getElementById('regSuccessModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'regSuccessModal';
    modal.className = 'modal-overlay';
    modal.style.display = 'none';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-card" style="max-width: 580px; width: 95%; text-align: center; border-top: 5px solid #28a745;">
      <div style="width: 60px; height: 60px; background: #e8f5e9; color: #28a745; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 15px;">
        <i class="fas fa-check"></i>
      </div>
      <h3 style="color: #28a745; margin: 0 0 6px;">रुग्ण नोंदणी यशस्वी झाली!</h3>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px;">रुग्णाची माहिती सिस्टीम आणि डेटाबेसमध्ये जतन झाली आहे.</p>

      <div style="background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 10px; padding: 16px; text-align: left; margin-bottom: 20px; font-size: 0.92rem; line-height: 1.6;">
        <div><strong>नोंदणी क्रमांक (Reg ID):</strong> <span style="color: var(--primary); font-weight: 800;">${patient.regId}</span></div>
        <div><strong>रुग्णाचे नाव:</strong> ${patient.name}</div>
        <div><strong>मोबाईल नंबर:</strong> ${patient.phone}</div>
        <div><strong>शहर / जिल्हा:</strong> ${patient.city}</div>
        <div><strong>नोंदणी तारीख:</strong> ${patient.regDate}</div>
      </div>

      <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
        <button class="btn btn-primary" onclick="printPatientSlip('${patient.regId}')"><i class="fas fa-print"></i> OPD स्लिप प्रिंट करा</button>
        <button class="btn btn-success" onclick="downloadFilledPatientForm('${patient.regId}')" style="background:#28a745; border:none; color:#fff; font-weight:700;"><i class="fas fa-download"></i> अर्ज डाउनलोड</button>
        <button class="btn btn-secondary" onclick="closeRegSuccessModal()"><i class="fas fa-times"></i> बंद करा</button>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

window.closeRegSuccessModal = function() {
  const modal = document.getElementById('regSuccessModal');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
};

/* --- Camera Snapshot Module (Strictly On-Demand with Preview & Confirmation) --- */
let mediaStream = null;
let activeCameraTarget = 'aadhaar';
let tempCapturedBase64 = null;

function initCameraCapture() {
  const modal = document.getElementById('cameraCaptureModal');
  if (!modal) return;

  stopCameraStream();

  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeCameraModal();
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeCameraModal();
    }
  });

  window.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      closeCameraModal();
    }
  });

  window.addEventListener('beforeunload', function() {
    stopCameraStream();
  });

  window.openCameraModal = function(targetType) {
    activeCameraTarget = targetType;
    tempCapturedBase64 = null;

    const videoView = document.getElementById('cameraVideoView');
    const previewView = document.getElementById('cameraSnapshotPreviewView');
    const liveActions = document.getElementById('cameraLiveActions');
    const confirmActions = document.getElementById('cameraConfirmActions');

    if (videoView) videoView.style.display = 'flex';
    if (previewView) previewView.style.display = 'none';
    if (liveActions) liveActions.style.display = 'flex';
    if (confirmActions) confirmActions.style.display = 'none';

    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    startCameraStream();
  };

  window.closeCameraModal = function() {
    modal.style.display = 'none';
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    stopCameraStream();
  };

  window.takeCameraSnapshot = function() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');
    if (!video || !canvas || !mediaStream) {
      showToast('कृपया कॅमेरा पूर्ण सुरू होईपर्यंत थांबा.', 'warning');
      return;
    }

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    tempCapturedBase64 = canvas.toDataURL('image/jpeg', 0.88);
    stopCameraStream();

    const capturedImg = document.getElementById('cameraCapturedImg');
    const videoView = document.getElementById('cameraVideoView');
    const previewView = document.getElementById('cameraSnapshotPreviewView');
    const liveActions = document.getElementById('cameraLiveActions');
    const confirmActions = document.getElementById('cameraConfirmActions');

    if (capturedImg) capturedImg.src = tempCapturedBase64;
    if (videoView) videoView.style.display = 'none';
    if (previewView) previewView.style.display = 'block';
    if (liveActions) liveActions.style.display = 'none';
    if (confirmActions) confirmActions.style.display = 'flex';

    showToast('फोटो काढला! फोटो तपासा व वापरण्यासाठी Confirm वर क्लिक करा.', 'info');
  };

  window.retakeCameraSnapshot = function() {
    tempCapturedBase64 = null;

    const videoView = document.getElementById('cameraVideoView');
    const previewView = document.getElementById('cameraSnapshotPreviewView');
    const liveActions = document.getElementById('cameraLiveActions');
    const confirmActions = document.getElementById('cameraConfirmActions');

    if (videoView) videoView.style.display = 'flex';
    if (previewView) previewView.style.display = 'none';
    if (liveActions) liveActions.style.display = 'flex';
    if (confirmActions) confirmActions.style.display = 'none';

    startCameraStream();
  };

  window.confirmCameraSnapshot = function() {
    if (!tempCapturedBase64) {
      showToast('कोणताही फोटो काढलेला नाही.', 'warning');
      return;
    }

    if (activeCameraTarget === 'aadhaar') {
      currentAadhaarBase64 = tempCapturedBase64;
      displayImagePreview('aadhaarPreview', currentAadhaarBase64, 'आधार कार्ड (कॅमेरा फोटो)');
    } else if (activeCameraTarget === 'pan') {
      currentPanBase64 = tempCapturedBase64;
      displayImagePreview('panPreview', currentPanBase64, 'पॅन कार्ड (कॅमेरा फोटो)');
    } else if (activeCameraTarget === 'editAadhaar') {
      editAadhaarBase64 = tempCapturedBase64;
      displayImagePreview('editAadhaarPreview', editAadhaarBase64, 'नवीन आधार फोटो');
    } else if (activeCameraTarget === 'editPan') {
      editPanBase64 = tempCapturedBase64;
      displayImagePreview('editPanPreview', editPanBase64, 'नवीन पॅन फोटो');
    }

    showToast('फोटो कन्फर्म झाला व अर्जात जोडला गेला!', 'success');
    closeCameraModal();
  };
}

/* --- Export Patient Records to CSV Spreadsheet --- */
window.exportPatientsToCSV = function() {
  const patients = getStoredPatients();
  if (!patients || !patients.length) {
    showToast('डाउनलोड करण्यासाठी कोणतेही रुग्ण रेकॉर्ड उपलब्ध नाहीत.', 'warning');
    return;
  }

  const headers = ["Reg ID", "Name", "Gender", "Age", "Phone", "Emergency Phone", "Blood Group", "Aadhaar", "PAN", "City", "Address", "Registration Date"];
  const rows = patients.map(p => [
    p.regId || '',
    `"${(p.name || '').replace(/"/g, '""')}"`,
    p.gender || '',
    p.age || '',
    p.phone || '',
    p.emergencyPhone || '',
    p.bloodGroup || '',
    p.aadhaar || '',
    p.pan || '',
    `"${(p.city || '').replace(/"/g, '""')}"`,
    `"${(p.address || '').replace(/"/g, '""')}"`,
    p.regDate || ''
  ]);

  const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `CSM-Registered-Patients-${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('रुग्ण नोंदणी यादी CSV रिपोर्ट यशस्वीरीत्या डाउनलोड झाली आहे.', 'success');
};

function startCameraStream() {
  const video = document.getElementById('cameraVideo');
  if (!video) return;

  stopCameraStream();

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const constraints = {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        mediaStream = stream;
        video.srcObject = stream;
        video.play().catch(e => console.warn('Video play auto error:', e));
      })
      .catch(err => {
        console.warn('HD camera fallback to standard constraints: ', err);
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(stream => {
            mediaStream = stream;
            video.srcObject = stream;
          })
          .catch(e => {
            showToast('कॅमेरा ॲक्सेस नाकारला गेला किंवा कॅमेरा उपलब्ध नाही. कृपया फाईल अपलोड पर्याय वापरा.', 'warning');
            closeCameraModal();
          });
      });
  } else {
    showToast('आपल्या ब्राऊझरमध्ये कॅमेरा सपोर्ट उपलब्ध नाही.', 'warning');
    closeCameraModal();
  }
}

function stopCameraStream() {
  const video = document.getElementById('cameraVideo');
  if (video) {
    video.srcObject = null;
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => {
      track.stop();
    });
    mediaStream = null;
  }
}

/* --- Render Patients List Table with Edit & Delete Options --- */
function initPatientTable() {
  const tbody = document.getElementById('patientTableBody');
  const countEl = document.getElementById('patientTotalCount');
  const todayCountEl = document.getElementById('patientTodayCount');

  const patients = getStoredPatients();

  if (countEl) countEl.innerText = patients.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayPatients = patients.filter(p => p.regDate === todayStr);
  if (todayCountEl) todayCountEl.innerText = todayPatients.length;

  if (!tbody) return;

  if (patients.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 30px; color: var(--text-muted);">
          <i class="fas fa-folder-open" style="font-size: 2.5rem; margin-bottom: 10px; display: block; color: var(--primary);"></i>
          कोणताही रुग्ण डेटा उपलब्ध नाही.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = patients.map((p) => {
    const hasAadhaarDoc = p.aadhaarPhoto ? `<span style="background:#e8f5e9; color:#2e7d32; padding:3px 8px; border-radius:4px; font-size:0.75rem; font-weight:700;"><i class="fas fa-check-circle"></i> आधार</span>` : `<span style="color:#aaa; font-size:0.75rem;">-</span>`;
    const hasPanDoc = p.panPhoto ? `<span style="background:#e3f2fd; color:#1565c0; padding:3px 8px; border-radius:4px; font-size:0.75rem; font-weight:700;"><i class="fas fa-check-circle"></i> पॅन</span>` : `<span style="color:#aaa; font-size:0.75rem;">-</span>`;

    return `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="font-weight: 700; color: var(--primary); font-size: 0.88rem;">${p.regId}</td>
        <td>
          <div style="font-weight: 700; color: var(--text-dark);">${p.name}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${p.gender} | वय: ${p.age} | रक्तगट: ${p.bloodGroup}</div>
        </td>
        <td style="font-weight: 600;"><i class="fas fa-phone-alt" style="color:var(--accent); font-size:0.8rem;"></i> ${p.phone}</td>
        <td>${p.city}</td>
        <td style="font-size: 0.85rem;">${p.regDate}</td>
        <td>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${hasAadhaarDoc}
            ${hasPanDoc}
          </div>
        </td>
        <td>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button class="btn btn-sm btn-primary" onclick="viewPatientDetails('${p.regId}')" title="तपशील पहा" style="padding: 4px 10px; font-size: 0.8rem;">
              <i class="fas fa-eye"></i> पहा
            </button>
            <button class="btn btn-sm btn-warning" onclick="openEditPatientModal('${p.regId}')" title="माहिती संपादन करा (Edit Data)" style="padding: 4px 10px; font-size: 0.8rem; background: #ff9800; color: #fff; border: none; border-radius: 6px; font-weight: 700;">
              <i class="fas fa-edit"></i> एडिट
            </button>
            <button class="btn btn-sm btn-danger" onclick="promptDeletePatient('${p.regId}')" title="डेटा डिलीट करा (Registration ID PIN रिक्वायर्ड)" style="padding: 4px 10px; font-size: 0.8rem; background: #dc3545; color: #fff; border: none; border-radius: 6px; font-weight: 700;">
              <i class="fas fa-trash-alt"></i> डिलीट
            </button>
            <button class="btn btn-sm btn-secondary" onclick="downloadFilledPatientForm('${p.regId}')" title="भरलेला फॉर्म डाउनलोड करा" style="padding: 4px 10px; font-size: 0.8rem; background: #28a745; color: #fff; border: none; border-radius: 6px; font-weight: 700;">
              <i class="fas fa-download"></i> फॉर्म
            </button>
            <button class="btn btn-sm btn-secondary" onclick="printPatientSlip('${p.regId}')" title="OPD स्लिप प्रिंट करा" style="padding: 4px 8px; font-size: 0.8rem;">
              <i class="fas fa-print"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/* --- Search Filter --- */
function initPatientSearch() {
  const searchInput = document.getElementById('patientSearchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase().trim();
    const patients = getStoredPatients();
    const tbody = document.getElementById('patientTableBody');
    if (!tbody) return;

    const filtered = patients.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.regId.toLowerCase().includes(query) ||
      p.phone.includes(query) ||
      p.city.toLowerCase().includes(query) ||
      p.aadhaar.includes(query)
    );

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 25px; color: var(--text-muted);">
            '${query}' साठी कोणताही रुग्ण आढळला नाही.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(p => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="font-weight: 700; color: var(--primary); font-size: 0.88rem;">${p.regId}</td>
        <td>
          <div style="font-weight: 700; color: var(--text-dark);">${p.name}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${p.gender} | वय: ${p.age}</div>
        </td>
        <td style="font-weight: 600;">${p.phone}</td>
        <td>${p.city}</td>
        <td style="font-size: 0.85rem;">${p.regDate}</td>
        <td>
          ${p.aadhaarPhoto ? '<span style="color:#2e7d32; font-size:0.75rem; font-weight:700;"><i class="fas fa-check-circle"></i> आधार</span> ' : ''}
          ${p.panPhoto ? '<span style="color:#1565c0; font-size:0.75rem; font-weight:700;"><i class="fas fa-check-circle"></i> पॅन</span>' : ''}
        </td>
        <td>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button class="btn btn-sm btn-primary" onclick="viewPatientDetails('${p.regId}')" style="padding: 4px 10px; font-size: 0.8rem;">
              <i class="fas fa-eye"></i> पहा
            </button>
            <button class="btn btn-sm btn-warning" onclick="openEditPatientModal('${p.regId}')" style="padding: 4px 10px; font-size: 0.8rem; background: #ff9800; color: #fff; border: none; border-radius: 6px; font-weight: 700;">
              <i class="fas fa-edit"></i> एडिट
            </button>
            <button class="btn btn-sm btn-danger" onclick="promptDeletePatient('${p.regId}')" title="डेटा डिलीट करा" style="padding: 4px 10px; font-size: 0.8rem; background: #dc3545; color: #fff; border: none; border-radius: 6px; font-weight: 700;">
              <i class="fas fa-trash-alt"></i> डिलीट
            </button>
            <button class="btn btn-sm btn-secondary" onclick="downloadFilledPatientForm('${p.regId}')" style="padding: 4px 10px; font-size: 0.8rem; background: #28a745; color: #fff; border: none; border-radius: 6px; font-weight: 700;">
              <i class="fas fa-download"></i> फॉर्म
            </button>
            <button class="btn btn-sm btn-secondary" onclick="printPatientSlip('${p.regId}')" style="padding: 4px 8px; font-size: 0.8rem;">
              <i class="fas fa-print"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  });
}

/* --- Security PIN Delete Protection System --- */
window.promptDeletePatient = function(regId) {
  pendingDeleteRegId = regId;

  let modal = document.getElementById('deleteSecurityPinModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'deleteSecurityPinModal';
    modal.className = 'modal-overlay';
    modal.style.display = 'none';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-card" style="max-width: 480px; width: 95%; text-align: center; border-top: 5px solid #dc3545;">
      <div style="width: 56px; height: 56px; background: #ffebee; color: #dc3545; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; margin: 0 auto 14px;">
        <i class="fas fa-lock"></i>
      </div>
      <h3 style="color: #dc3545; margin: 0 0 6px;">सुरक्षा पिन आवश्यक (Security PIN Required)</h3>
      <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 20px;">
        रुग्ण नोंदणी (<strong style="color:var(--primary);">${regId}</strong>) कायमची डिलीट करण्यासाठी अधिकृत सुरक्षा पिन प्रविष्ट करा.
      </p>

      <form onsubmit="confirmDeleteWithPin(event)" style="display: flex; flex-direction: column; gap: 15px;">
        <div>
          <input type="password" id="deletePinInput" class="form-control" placeholder="सुरक्षा पिन टाका..." required autocomplete="off" style="width: 100%; padding: 14px; font-size: 1.1rem; border-radius: 8px; border: 2px solid #dc3545; text-align: center; letter-spacing: 2px; box-sizing: border-box;">
        </div>

        <div style="display: flex; justify-content: center; gap: 12px; margin-top: 5px;">
          <button type="submit" class="btn btn-danger" style="background: #dc3545; color: #fff; border: none; font-weight: 700; padding: 10px 22px;">
            <i class="fas fa-trash-alt"></i> डिलीट कन्फर्म करा
          </button>
          <button type="button" class="btn btn-secondary" onclick="closeDeletePinModal()">
            <i class="fas fa-times"></i> रद्द करा
          </button>
        </div>
      </form>
    </div>
  `;

  modal.style.display = 'flex';
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    const input = document.getElementById('deletePinInput');
    if (input) input.focus();
  }, 100);
};

window.confirmDeleteWithPin = function(e) {
  if (e) e.preventDefault();
  if (!pendingDeleteRegId) return;

  const inputPin = document.getElementById('deletePinInput')?.value.trim();

  // Validate PIN against Registration ID or master security PIN
  if (
    inputPin && (
      inputPin.toUpperCase() === pendingDeleteRegId.toUpperCase() ||
      inputPin === SECURITY_DELETE_PIN
    )
  ) {
    const patients = getStoredPatients();
    const updatedList = patients.filter(p => p.regId !== pendingDeleteRegId);
    savePatients(updatedList);

    // Call Cloud API to delete from shared backend
    deletePatientFromCloudAPI(pendingDeleteRegId);

    const deletedId = pendingDeleteRegId;
    closeDeletePinModal();
    initPatientTable();

    showToast(`रुग्ण नोंदणी (${deletedId}) सिस्टीममधून कायमची डिलीट झाली!`, 'success');
  } else {
    showToast('चुकीचा सुरक्षा पिन! डिलीट करण्याची परवानगी नाकारली.', 'error');
    const input = document.getElementById('deletePinInput');
    if (input) {
      input.value = '';
      input.focus();
    }
  }
};

window.closeDeletePinModal = function() {
  const modal = document.getElementById('deleteSecurityPinModal');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
  pendingDeleteRegId = null;
};

/* --- Edit Patient Record Feature --- */
window.openEditPatientModal = function(regId) {
  const patients = getStoredPatients();
  const patient = patients.find(p => p.regId === regId);
  if (!patient) return;

  editingRegId = regId;
  editAadhaarBase64 = patient.aadhaarPhoto;
  editPanBase64 = patient.panPhoto;

  let modal = document.getElementById('editPatientModal');
  if (!modal) {
    createEditPatientModalDOM();
    modal = document.getElementById('editPatientModal');
  }

  // Populate Edit Modal Inputs
  document.getElementById('editRegIdTitle').innerText = patient.regId;
  document.getElementById('editPatName').value = patient.name || '';
  document.getElementById('editPatGender').value = patient.gender || 'पुरुष';
  document.getElementById('editPatAge').value = patient.age || '';
  document.getElementById('editPatPhone').value = patient.phone || '';
  document.getElementById('editPatEmergencyPhone').value = patient.emergencyPhone || '';
  document.getElementById('editPatBloodGroup').value = patient.bloodGroup || 'माहित नाही';
  document.getElementById('editPatAadhaar').value = patient.rawAadhaar || patient.aadhaar || '';
  document.getElementById('editPatPan').value = patient.pan || '';
  document.getElementById('editPatCity').value = patient.city || '';
  document.getElementById('editPatPincode').value = patient.pincode || '';
  document.getElementById('editPatAddress').value = patient.address || '';
  document.getElementById('editPatNotes').value = patient.notes || '';

  if (patient.aadhaarPhoto) {
    displayImagePreview('editAadhaarPreview', patient.aadhaarPhoto, 'सध्याचा आधार फोटो');
  } else {
    clearPreview('editAadhaarPreview');
  }

  if (patient.panPhoto) {
    displayImagePreview('editPanPreview', patient.panPhoto, 'सध्याचा पॅन फोटो');
  } else {
    clearPreview('editPanPreview');
  }

  const editAadhaarFile = document.getElementById('editAadhaarFile');
  if (editAadhaarFile) {
    editAadhaarFile.onchange = function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          editAadhaarBase64 = evt.target.result;
          displayImagePreview('editAadhaarPreview', editAadhaarBase64, 'नवीन आधार फोटो');
        };
        reader.readAsDataURL(file);
      }
    };
  }

  const editPanFile = document.getElementById('editPanFile');
  if (editPanFile) {
    editPanFile.onchange = function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          editPanBase64 = evt.target.result;
          displayImagePreview('editPanPreview', editPanBase64, 'नवीन पॅन फोटो');
        };
        reader.readAsDataURL(file);
      }
    };
  }

  modal.style.display = 'flex';
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeEditPatientModal = function() {
  const modal = document.getElementById('editPatientModal');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
};

window.savePatientEdit = function() {
  if (!editingRegId) return;

  const patients = getStoredPatients();
  const index = patients.findIndex(p => p.regId === editingRegId);
  if (index === -1) return;

  const name = document.getElementById('editPatName').value.trim();
  const phone = document.getElementById('editPatPhone').value.trim();
  const city = document.getElementById('editPatCity').value.trim();
  const rawAadhaarInput = document.getElementById('editPatAadhaar').value.trim();

  if (!name || !phone || !city) {
    showToast('कृपया नाव, मोबाईल व शहर रिकामे ठेवू नका.', 'warning');
    return;
  }

  const cleanAadhaar = rawAadhaarInput.replace(/\D/g, '');
  const maskedAadhaar = cleanAadhaar.length === 12 
    ? `XXXX-XXXX-${cleanAadhaar.slice(-4)}` 
    : (cleanAadhaar.length > 0 ? cleanAadhaar : "माहित नाही");

  patients[index].name = name;
  patients[index].gender = document.getElementById('editPatGender').value;
  patients[index].age = document.getElementById('editPatAge').value.trim() || '--';
  patients[index].phone = phone;
  patients[index].emergencyPhone = document.getElementById('editPatEmergencyPhone').value.trim();
  patients[index].bloodGroup = document.getElementById('editPatBloodGroup').value;
  patients[index].aadhaar = maskedAadhaar;
  patients[index].rawAadhaar = cleanAadhaar || rawAadhaarInput;
  patients[index].pan = document.getElementById('editPatPan').value.trim().toUpperCase();
  patients[index].city = city;
  patients[index].pincode = document.getElementById('editPatPincode').value.trim();
  patients[index].address = document.getElementById('editPatAddress').value.trim();
  patients[index].notes = document.getElementById('editPatNotes').value.trim();
  patients[index].aadhaarPhoto = editAadhaarBase64;
  patients[index].panPhoto = editPanBase64;
  patients[index].updatedAt = new Date().toISOString();

  savePatients(patients);
  savePatientToCloudAPI(patients[index]);
  initPatientTable();

  closeEditPatientModal();
  showToast(`रुग्ण माहिती (${editingRegId}) यशस्वीरीत्या अद्ययावत झाली!`, 'success');
};

function createEditPatientModalDOM() {
  const div = document.createElement('div');
  div.id = 'editPatientModal';
  div.className = 'modal-overlay';
  div.style.display = 'none';
  div.innerHTML = `
    <div class="modal-card" style="max-width: 720px; width: 95%;">
      <button class="modal-close-btn" onclick="closeEditPatientModal()">&times;</button>
      
      <div style="border-bottom: 2px solid var(--primary); padding-bottom: 10px; margin-bottom: 20px;">
        <h3 style="color: var(--primary); margin: 0;"><i class="fas fa-edit"></i> रुग्ण माहिती संपादन (Edit Patient Info)</h3>
        <span style="font-weight: 700; color: var(--secondary);" id="editRegIdTitle"></span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; max-height: 60vh; overflow-y: auto; padding-right: 5px;">
        <div>
          <label style="font-size:0.85rem; font-weight:700;">रुग्णाचे पूर्ण नाव *</label>
          <input type="text" id="editPatName" class="form-control" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc;">
        </div>

        <div>
          <label style="font-size:0.85rem; font-weight:700;">लिंग</label>
          <select id="editPatGender" class="form-control" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc;">
            <option value="पुरुष">पुरुष</option>
            <option value="स्त्री">स्त्री</option>
            <option value="इतर">इतर</option>
          </select>
        </div>

        <div>
          <label style="font-size:0.85rem; font-weight:700;">वय</label>
          <input type="number" id="editPatAge" class="form-control" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc;">
        </div>

        <div>
          <label style="font-size:0.85rem; font-weight:700;">मोबाईल नंबर *</label>
          <input type="tel" id="editPatPhone" class="form-control" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc;">
        </div>

        <div>
          <label style="font-size:0.85rem; font-weight:700;">पर्यायी संपर्क</label>
          <input type="tel" id="editPatEmergencyPhone" class="form-control" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc;">
        </div>

        <div>
          <label style="font-size:0.85rem; font-weight:700;">रक्तगट</label>
          <select id="editPatBloodGroup" class="form-control" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc;">
            <option value="माहित नाही">माहित नाही</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>

        <div>
          <label style="font-size:0.85rem; font-weight:700;">आधार नंबर</label>
          <input type="text" id="editPatAadhaar" class="form-control" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc;">
        </div>

        <div>
          <label style="font-size:0.85rem; font-weight:700;">पॅन नंबर</label>
          <input type="text" id="editPatPan" class="form-control" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc; text-transform:uppercase;">
        </div>

        <div>
          <label style="font-size:0.85rem; font-weight:700;">शहर / जिल्हा *</label>
          <input type="text" id="editPatCity" class="form-control" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc;">
        </div>

        <div>
          <label style="font-size:0.85rem; font-weight:700;">पिनकोड</label>
          <input type="text" id="editPatPincode" class="form-control" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc;">
        </div>

        <div style="grid-column: 1 / -1;">
          <label style="font-size:0.85rem; font-weight:700;">संपूर्ण पत्ता</label>
          <textarea id="editPatAddress" class="form-control" rows="2" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc;"></textarea>
        </div>

        <div style="grid-column: 1 / -1;">
          <label style="font-size:0.85rem; font-weight:700;">आरोग्य टीप / शेरा</label>
          <input type="text" id="editPatNotes" class="form-control" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc;">
        </div>

        <div style="grid-column: 1 / -1; background:#f9f9f9; padding:12px; border-radius:8px; margin-top:10px;">
          <h4 style="font-size:0.9rem; margin-top:0; color:var(--primary);">ओळखपत्र फोटो अपडेट करा (Aadhaar & PAN Photo Update)</h4>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
            <div>
              <label style="font-size:0.78rem; font-weight:700; display:block;">आधार फोटो अपडेट:</label>
              <label class="btn btn-sm btn-primary" style="padding:3px 8px; font-size:0.75rem; margin:2px 0; cursor:pointer;">
                <i class="fas fa-upload"></i> बदला
                <input type="file" id="editAadhaarFile" accept="image/*" style="display:none;">
              </label>
              <button type="button" class="btn btn-sm btn-secondary" onclick="openCameraModal('editAadhaar')" style="padding:3px 8px; font-size:0.75rem;">
                <i class="fas fa-camera"></i> कॅमेरा
              </button>
              <div id="editAadhaarPreview"></div>
            </div>

            <div>
              <label style="font-size:0.78rem; font-weight:700; display:block;">पॅन फोटो अपडेट:</label>
              <label class="btn btn-sm btn-primary" style="padding:3px 8px; font-size:0.75rem; margin:2px 0; cursor:pointer;">
                <i class="fas fa-upload"></i> बदला
                <input type="file" id="editPanFile" accept="image/*" style="display:none;">
              </label>
              <button type="button" class="btn btn-sm btn-secondary" onclick="openCameraModal('editPan')" style="padding:3px 8px; font-size:0.75rem;">
                <i class="fas fa-camera"></i> कॅमेरा
              </button>
              <div id="editPanPreview"></div>
            </div>
          </div>
        </div>

      </div>

      <div style="text-align: right; margin-top: 20px; border-top: 1px solid #eee; padding-top: 14px; display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn btn-secondary" onclick="closeEditPatientModal()"><i class="fas fa-times"></i> रद्द करा</button>
        <button class="btn btn-primary" onclick="savePatientEdit()"><i class="fas fa-save"></i> बदल जतन करा (Save Changes)</button>
      </div>
    </div>
  `;
  document.body.appendChild(div);
}

/* --- View Patient Details Modal --- */
window.viewPatientDetails = function(regId) {
  const patients = getStoredPatients();
  const patient = patients.find(p => p.regId === regId);
  if (!patient) return;

  let modal = document.getElementById('patientDetailModal');
  if (!modal) {
    createPatientDetailModalDOM();
    modal = document.getElementById('patientDetailModal');
  }

  const contentEl = document.getElementById('patientDetailContent');
  if (contentEl) {
    const aadhaarPhotoHTML = patient.aadhaarPhoto 
      ? `<div style="text-align:center; margin-top:8px;"><img src="${patient.aadhaarPhoto}" alt="Aadhaar Card" style="max-width:100%; max-height:220px; border-radius:8px; border:1px solid #ddd; object-fit:contain;"><div style="font-size:0.75rem; font-weight:700; color:var(--primary); margin-top:4px;">आधार कार्ड फोटो</div></div>`
      : `<div style="background:#f9f9f9; padding:20px; text-align:center; border-radius:8px; color:#aaa; font-size:0.85rem;"><i class="fas fa-file-excel" style="font-size:1.5rem; display:block; margin-bottom:4px;"></i>आधार कार्ड फोटो जोडलेला नाही</div>`;

    const panPhotoHTML = patient.panPhoto 
      ? `<div style="text-align:center; margin-top:8px;"><img src="${patient.panPhoto}" alt="PAN Card" style="max-width:100%; max-height:220px; border-radius:8px; border:1px solid #ddd; object-fit:contain;"><div style="font-size:0.75rem; font-weight:700; color:var(--primary); margin-top:4px;">पॅन कार्ड फोटो</div></div>`
      : `<div style="background:#f9f9f9; padding:20px; text-align:center; border-radius:8px; color:#aaa; font-size:0.85rem;"><i class="fas fa-file-excel" style="font-size:1.5rem; display:block; margin-bottom:4px;"></i>पॅन कार्ड फोटो जोडलेला नाही</div>`;

    contentEl.innerHTML = `
      <div style="border-bottom: 2px solid var(--primary); padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h3 style="color: var(--primary); margin: 0; font-size: 1.3rem;">${patient.name}</h3>
          <span style="font-weight: 700; color: var(--secondary); font-size: 0.95rem;">${patient.regId}</span>
        </div>
        <span style="background: #e8f5e9; color: #2e7d32; padding: 4px 12px; border-radius: 99px; font-weight: 700; font-size: 0.85rem;">${patient.status}</span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; background: #f8f9fa; padding: 14px; border-radius: 10px; margin-bottom: 18px;">
        <div><strong>मोबाईल:</strong> ${patient.phone}</div>
        <div><strong>पर्यायी संपर्क:</strong> ${patient.emergencyPhone || '--'}</div>
        <div><strong>लिंग:</strong> ${patient.gender}</div>
        <div><strong>वय:</strong> ${patient.age} वर्ष</div>
        <div><strong>रक्तगट:</strong> ${patient.bloodGroup}</div>
        <div><strong>आधार क्रमांक:</strong> ${patient.aadhaar}</div>
        <div><strong>पॅन क्रमांक:</strong> ${patient.pan}</div>
        <div><strong>शहर/जिल्हा:</strong> ${patient.city}</div>
        <div style="grid-column: 1 / -1;"><strong>संपूर्ण पत्ता:</strong> ${patient.address} ${patient.pincode ? '- ' + patient.pincode : ''}</div>
        <div style="grid-column: 1 / -1;"><strong>आरोग्य टीप/समस्या:</strong> ${patient.notes}</div>
      </div>

      <h4 style="color: var(--text-dark); margin-bottom: 10px; font-size: 1rem;"><i class="fas fa-id-card" style="color:var(--accent);"></i> जोडलेली ओळखपत्रे (Aadhaar & PAN Photos)</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        ${aadhaarPhotoHTML}
        ${panPhotoHTML}
      </div>
    `;
  }

  modal.style.display = 'flex';
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closePatientDetailModal = function() {
  const modal = document.getElementById('patientDetailModal');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
};

function createPatientDetailModalDOM() {
  const div = document.createElement('div');
  div.id = 'patientDetailModal';
  div.className = 'modal-overlay';
  div.style.display = 'none';
  div.innerHTML = `
    <div class="modal-card" style="max-width: 720px; width: 95%;">
      <button class="modal-close-btn" onclick="closePatientDetailModal()">&times;</button>
      <div id="patientDetailContent"></div>
      <div style="text-align: right; margin-top: 20px; border-top: 1px solid #eee; padding-top: 14px; display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn btn-secondary" onclick="closePatientDetailModal()"><i class="fas fa-times"></i> बंद करा</button>
      </div>
    </div>
  `;
  document.body.appendChild(div);
}

/* --- Form Download Feature --- */
window.downloadBlankForm = function() {
  const formHtml = `
    <!DOCTYPE html>
    <html lang="mr">
    <head>
      <meta charset="UTF-8">
      <title>Blank Patient Registration Form - CSM Sanstha</title>
      <style>
        body { font-family: 'Noto Sans Devanagari', sans-serif; padding: 30px; color: #1e2432; }
        .form-box { border: 2px solid #6F4BFF; padding: 30px; border-radius: 12px; max-width: 750px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #6F4BFF; padding-bottom: 15px; margin-bottom: 25px; }
        .header h2 { margin: 0; color: #6F4BFF; font-size: 1.6rem; }
        .header p { margin: 4px 0 0; font-size: 0.9rem; color: #555; }
        .field-row { display: flex; justify-content: space-between; margin-bottom: 18px; border-bottom: 1px dotted #ccc; padding-bottom: 6px; }
        .label { font-weight: 700; width: 35%; }
        .val-space { width: 65%; }
        .footer { margin-top: 30px; text-align: center; font-size: 0.85rem; border-top: 1px solid #eee; padding-top: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="form-box">
        <div class="header">
          <h2>छत्रपती शाहू महाराज बहुउद्देशीय संस्था</h2>
          <p>Reg No: 699/MH F 5559 | अधिकृत रुग्ण नोंदणी अर्ज (Blank Registration Form)</p>
        </div>
        <div class="field-row"><div class="label">रुग्णाचे नाव:</div><div class="val-space"></div></div>
        <div class="field-row"><div class="label">लिंग / वय:</div><div class="val-space"></div></div>
        <div class="field-row"><div class="label">मोबाईल नंबर:</div><div class="val-space"></div></div>
        <div class="field-row"><div class="label">पर्यायी संपर्क:</div><div class="val-space"></div></div>
        <div class="field-row"><div class="label">रक्तगट:</div><div class="val-space"></div></div>
        <div class="field-row"><div class="label">आधार कार्ड नंबर:</div><div class="val-space"></div></div>
        <div class="field-row"><div class="label">पॅन कार्ड नंबर:</div><div class="val-space"></div></div>
        <div class="field-row"><div class="label">शहर / जिल्हा:</div><div class="val-space"></div></div>
        <div class="field-row"><div class="label">संपूर्ण पत्ता:</div><div class="val-space"></div></div>
        <div class="field-row"><div class="label">आरोग्य समस्या / टिप्पणी:</div><div class="val-space"></div></div>
        <div class="field-row" style="margin-top: 40px; border: none;"><div class="label">रुग्णाची सही: ____________________</div><div class="val-space" style="text-align: right;">ॲडमिन सही: ____________________</div></div>
        <div class="footer">हेल्पलाइन: +91 9021757353 | मयूर पार्क, जळगाव रोड, छत्रपती संभाजीनगर</div>
      </div>
      <script>window.onload = function() { window.print(); };</script>
    </body>
    </html>
  `;
  const blob = new Blob([formHtml], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Blank_Patient_Registration_Form_CSM.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('ब्लँक नोंदणी अर्ज फाईल डाउनलोड झाली!', 'success');
};

window.downloadFilledPatientForm = function(regId) {
  const patients = getStoredPatients();
  const patient = patients.find(p => p.regId === regId);
  if (!patient) return;

  const currentOrigin = window.location.origin && window.location.origin !== 'null' && !window.location.origin.includes('file://') ? window.location.origin : 'https://chatrpatishahumaharajbahuuddeshiyasanstha.in';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(currentOrigin + '/patient-registration.html?verify=' + patient.regId)}`;

  const formHtml = `
    <!DOCTYPE html>
    <html lang="mr">
    <head>
      <meta charset="UTF-8">
      <title>Patient Registration Form - ${patient.regId}</title>
      <style>
        body { font-family: 'Noto Sans Devanagari', sans-serif; padding: 25px; color: #1e2432; }
        .form-box { border: 2px solid #6F4BFF; padding: 25px; border-radius: 12px; max-width: 700px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px dashed #6F4BFF; padding-bottom: 12px; margin-bottom: 20px; }
        .header h2 { margin: 0; color: #6F4BFF; font-size: 1.5rem; }
        .header p { margin: 4px 0 0; font-size: 0.85rem; color: #555; }
        .flex-box { display: flex; justify-content: space-between; gap: 20px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.95rem; line-height: 1.6; }
        .qr-box { text-align: center; }
        .qr-box img { width: 100px; height: 100px; }
        .footer { margin-top: 20px; border-top: 1px solid #ddd; padding-top: 12px; font-size: 0.8rem; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="form-box">
        <div class="header">
          <h2>छत्रपती शाहू महाराज बहुउद्देशीय संस्था</h2>
          <p>Reg No: 699/MH F 5559 | अधिकृत रुग्ण नोंदणी अर्ज (Patient Registration Form)</p>
        </div>
        <div class="flex-box">
          <div class="info-grid" style="flex: 1;">
            <div><strong>नोंदणी क्र:</strong> ${patient.regId}</div>
            <div><strong>नोंदणी तारीख:</strong> ${patient.regDate}</div>
            <div><strong>रुग्णाचे नाव:</strong> ${patient.name}</div>
            <div><strong>लिंग / वय:</strong> ${patient.gender} (${patient.age} वर्षे)</div>
            <div><strong>मोबाईल:</strong> ${patient.phone}</div>
            <div><strong>पर्यायी संपर्क:</strong> ${patient.emergencyPhone || '--'}</div>
            <div><strong>रक्तगट:</strong> ${patient.bloodGroup}</div>
            <div><strong>आधार:</strong> ${patient.aadhaar}</div>
            <div><strong>पॅन:</strong> ${patient.pan}</div>
            <div><strong>शहर / जिल्हा:</strong> ${patient.city}</div>
            <div style="grid-column: 1 / -1;"><strong>पत्ता:</strong> ${patient.address}</div>
            <div style="grid-column: 1 / -1;"><strong>आरोग्य टीप:</strong> ${patient.notes}</div>
          </div>
          <div class="qr-box">
            <img src="${qrUrl}" alt="QR">
            <div style="font-size:0.7rem; font-weight:700; margin-top:4px;">Scan to Verify</div>
          </div>
        </div>
        <div class="footer">
          संलग्न हॉस्पिटल्स आणि डॉक्टर्सकडे OPD व लॅब सवलतीसाठी हा अर्ज सादर करा. | हेल्पलाइन: +91 9021757353
        </div>
      </div>
      <script>window.onload = function() { window.print(); };</script>
    </body>
    </html>
  `;
  const blob = new Blob([formHtml], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Patient_Registration_${patient.regId}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast(`रुग्ण नोंदणी अर्ज (${patient.regId}) फाईल डाउनलोड झाली!`, 'success');
};

/* --- Export Patient List to CSV / Excel --- */
window.exportPatientsToCSV = function() {
  const patients = getStoredPatients();
  if (patients.length === 0) {
    showToast('डाउनलोड करण्यासाठी एकही रुग्ण उपलब्ध नाही.', 'warning');
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
  csvContent += "Registration ID,Full Name,Gender,Age,Phone,Blood Group,Aadhaar,PAN,City,Address,Registration Date\n";

  patients.forEach(p => {
    const row = [
      `"${p.regId}"`,
      `"${p.name}"`,
      `"${p.gender}"`,
      `"${p.age}"`,
      `"${p.phone}"`,
      `"${p.bloodGroup}"`,
      `"${p.aadhaar}"`,
      `"${p.pan}"`,
      `"${p.city}"`,
      `"${p.address.replace(/"/g, '""')}"`,
      `"${p.regDate}"`
    ].join(",");
    csvContent += row + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Registered_Patients_CSM_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('रुग्ण डेटाबेस CSV / Excel फाईलमध्ये डाउनलोड झाला!', 'success');
};

/* --- Print OPD Patient Registration Slip --- */
window.printPatientSlip = function(regId) {
  const patients = getStoredPatients();
  const patient = patients.find(p => p.regId === regId);
  if (!patient) return;

  const currentOrigin = window.location.origin && window.location.origin !== 'null' && !window.location.origin.includes('file://') ? window.location.origin : 'https://chatrpatishahumaharajbahuuddeshiyasanstha.in';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(currentOrigin + '/patient-registration.html?verify=' + patient.regId)}`;

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="mr">
    <head>
      <meta charset="UTF-8">
      <title>Patient Registration Slip - ${patient.regId}</title>
      <style>
        body { font-family: 'Noto Sans Devanagari', sans-serif; padding: 25px; color: #1e2432; }
        .slip-container { border: 2px solid #6F4BFF; padding: 25px; border-radius: 12px; max-width: 650px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px dashed #6F4BFF; padding-bottom: 15px; margin-bottom: 20px; }
        .header h2 { margin: 0; color: #6F4BFF; font-size: 1.5rem; }
        .header p { margin: 4px 0 0; font-size: 0.85rem; color: #555; }
        .flex-box { display: flex; justify-content: space-between; gap: 20px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.95rem; line-height: 1.6; }
        .qr-box { text-align: center; }
        .qr-box img { width: 100px; height: 100px; }
        .footer { margin-top: 20px; border-top: 1px solid #ddd; padding-top: 12px; font-size: 0.8rem; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="slip-container">
        <div class="header">
          <h2>छत्रपती शाहू महाराज बहुउद्देशीय संस्था</h2>
          <p>Reg No: 699/MH F 5559 | अधिकृत रुग्ण नोंदणी स्लिप (OPD Registration Slip)</p>
        </div>
        <div class="flex-box">
          <div class="info-grid" style="flex: 1;">
            <div><strong>नोंदणी क्र:</strong> ${patient.regId}</div>
            <div><strong>तारीख:</strong> ${patient.regDate}</div>
            <div><strong>रुग्णाचे नाव:</strong> ${patient.name}</div>
            <div><strong>लिंग / वय:</strong> ${patient.gender} (${patient.age} वर्षे)</div>
            <div><strong>मोबाईल:</strong> ${patient.phone}</div>
            <div><strong>रक्तगट:</strong> ${patient.bloodGroup}</div>
            <div><strong>आधार:</strong> ${patient.aadhaar}</div>
            <div><strong>पॅन:</strong> ${patient.pan}</div>
            <div style="grid-column: 1 / -1;"><strong>पत्ता:</strong> ${patient.address}, ${patient.city}</div>
          </div>
          <div class="qr-box">
            <img src="${qrUrl}" alt="QR">
            <div style="font-size:0.7rem; font-weight:700; margin-top:4px;">Scan to Verify</div>
          </div>
        </div>
        <div class="footer">
          संलग्न हॉस्पिटल्स आणि डॉक्टर्सकडे OPD व लॅब सवलतीसाठी ही स्लिप सादर करा. | हेल्पलाइन: +91 9021757353
        </div>
      </div>
      <script>
        window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
};
