// Vercel Serverless API Route for Global Visitor Counter
let globalMemoryCount = 5432;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ status: 'CORS_OK' });
  }

  const isHit = req.query.action === 'hit' || req.method === 'POST';
  if (isHit) {
    globalMemoryCount += 1;
  }

  return res.status(200).json({
    success: true,
    count: globalMemoryCount,
    formatted: globalMemoryCount.toLocaleString('en-IN')
  });
};
