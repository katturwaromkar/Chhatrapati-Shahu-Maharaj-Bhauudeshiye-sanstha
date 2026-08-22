// Vercel Serverless API Route for Shared Patient Database
let inMemoryPatients = [];

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
