// Vercel Serverless API Route for Shared Family Health Cards Database
let inMemoryCards = {
  "CSM-2026-5559": {
    cardId: "CSM-2026-5559",
    name: "रवींद्र पाथरे",
    phone: "9823456789",
    aadhaar: "XXXX-XXXX-4589",
    city: "छत्रपती संभाजीनगर",
    issued: "20 ऑगस्ट 2026",
    validTill: "31 मार्च 2027",
    status: "सक्रिय (ACTIVE)",
    members: ["सुनिता पाथरे (पत्नी)", "अमित पाथरे (मुलगा)"],
    discount: "२०% ओपीडी सवलत, २५% लॅब टेस्ट सवलत"
  },
  "CSM-2026-8942": {
    cardId: "CSM-2026-8942",
    name: "सुनिता पाटील",
    phone: "9021123456",
    aadhaar: "XXXX-XXXX-7812",
    city: "जळगाव",
    issued: "21 ऑगस्ट 2026",
    validTill: "31 मार्च 2027",
    status: "सक्रिय (ACTIVE)",
    members: ["रमेश पाटील (पती)"],
    discount: "२०% ओपीडी सवलत, २५% लॅब टेस्ट सवलत"
  }
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ status: 'CORS_OK' });
  }

  if (req.method === 'GET') {
    return res.status(200).json(inMemoryCards);
  }

  if (req.method === 'POST') {
    const cardData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (cardData && cardData.cardId) {
      inMemoryCards[cardData.cardId] = cardData;
      return res.status(200).json({ success: true, cards: inMemoryCards });
    }
    return res.status(400).json({ success: false, message: "Invalid card payload" });
  }

  if (req.method === 'DELETE' || req.query.action === 'delete') {
    const cardId = req.query.cardId || (req.body && req.body.cardId);
    if (cardId && inMemoryCards[cardId]) {
      delete inMemoryCards[cardId];
    }
    return res.status(200).json({ success: true, cards: inMemoryCards });
  }
};
