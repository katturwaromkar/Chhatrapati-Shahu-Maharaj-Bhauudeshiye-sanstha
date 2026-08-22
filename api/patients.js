// Vercel Serverless API Route for Shared Patient Database
let inMemoryPatients = [
  {
    regId: "REG-PAT-2026-1609",
    name: "Omkar Katturwar",
    gender: "पुरुष",
    age: "--",
    phone: "7219290885",
    emergencyPhone: "7219290885",
    bloodGroup: "माहित नाही",
    aadhaar: "माहित नाही",
    pan: "माहित नाही",
    address: "Pune",
    city: "Pune",
    pincode: "",
    notes: "सक्रिय रुग्ण नोंदणी",
    regDate: "2026-08-22",
    status: "सक्रिय (ACTIVE)",
    aadhaarPhoto: null,
    panPhoto: null
  },
  {
    regId: "REG-PAT-2026-1001",
    name: "रामेश्वर तुकाराम शिंदे (Rameshwar T. Shinde)",
    gender: "पुरुष",
    age: "42",
    phone: "9823456789",
    emergencyPhone: "9823456790",
    bloodGroup: "O+",
    aadhaar: "XXXX-XXXX-4589",
    pan: "ABCDE1234F",
    address: "प्लॉट नं. 45, नक्षत्रवाडी, छत्रपती संभाजीनगर",
    city: "छत्रपती संभाजीनगर",
    pincode: "431002",
    notes: "ओपीडी सवलतीसाठी रुग्ण नोंदणी, नियमित बीपी तपासणी",
    regDate: "2026-08-20",
    status: "सक्रिय (ACTIVE)",
    aadhaarPhoto: null,
    panPhoto: null
  },
  {
    regId: "REG-PAT-2026-1002",
    name: "सुनीता विष्णू कांबळे (Sunita V. Kamble)",
    gender: "स्त्री",
    age: "36",
    phone: "9021123456",
    emergencyPhone: "9021123457",
    bloodGroup: "B+",
    aadhaar: "XXXX-XXXX-7812",
    pan: "XYZPD9876K",
    address: "शिवजी नगर, जळगाव रोड, छत्रपती संभाजीनगर",
    city: "छत्रपती संभाजीनगर",
    pincode: "431003",
    notes: "नेत्र चिकित्सा शिबीर नोंदणी",
    regDate: "2026-08-21",
    status: "सक्रिय (ACTIVE)",
    aadhaarPhoto: null,
    panPhoto: null
  }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ status: 'CORS_OK' });
  }

  if (req.method === 'GET') {
    return res.status(200).json(inMemoryPatients);
  }

  if (req.method === 'POST') {
    const inputData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!inputData || !inputData.regId) {
      return res.status(400).json({ success: false, message: "Invalid patient payload" });
    }
    const idx = inMemoryPatients.findIndex(p => p.regId === inputData.regId);
    if (idx >= 0) {
      inMemoryPatients[idx] = { ...inMemoryPatients[idx], ...inputData };
    } else {
      inMemoryPatients.unshift(inputData);
    }
    return res.status(200).json({ success: true, patients: inMemoryPatients });
  }

  if (req.method === 'DELETE' || req.query.action === 'delete') {
    const regId = req.query.regId || (req.body && req.body.regId);
    if (regId) {
      inMemoryPatients = inMemoryPatients.filter(p => p.regId !== regId);
    }
    return res.status(200).json({ success: true, patients: inMemoryPatients });
  }
};
