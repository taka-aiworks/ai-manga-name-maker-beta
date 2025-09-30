// Vercel Node.js (CommonJS) API - AI Layout stub

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

module.exports = async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      setCors(res);
      res.setHeader('Cache-Control', 'max-age=86400');
      return res.status(204).send('');
    }

    if (req.method === 'GET') {
      setCors(res);
      return res.status(200).json({ ok: true, endpoint: '/api/ai-layout', method: 'POST', usage: 'POST JSON { sceneBrief, characters[] }' });
    }

    if (req.method !== 'POST') {
      setCors(res);
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    setCors(res);
    let data = req.body;
    if (!data || typeof data === 'string') {
      try { data = JSON.parse(req.body || '{}'); } catch { data = {}; }
    }

    const sceneBrief = typeof data.sceneBrief === 'string' ? data.sceneBrief : '';
    const characters = Array.isArray(data.characters) ? data.characters : [];
    const options = data.options || {};
    const candidateTemplateIds = Array.isArray(data.candidateTemplateIds) ? data.candidateTemplateIds : null;

    if (!sceneBrief) {
      return res.status(400).json({ error: 'sceneBrief is required' });
    }

    const charCount = characters.length;
    const len = sceneBrief.length;

    const pickByPanels = (n) => (n <= 2 ? 'reverse_t' : n === 3 ? 'triple' : 'quad');
    let templateId;
    if (typeof options.desiredPanels === 'number') templateId = pickByPanels(options.desiredPanels);
    else if (charCount >= 3 || len > 120) templateId = 'quad';
    else if (len > 60) templateId = 'triple';
    else templateId = 'reverse_t';

    if (candidateTemplateIds && !candidateTemplateIds.includes(templateId)) {
      templateId = candidateTemplateIds[0];
    }

    return res.status(200).json({ templateId, rationale: 'heuristic-fallback' });
  } catch (err) {
    setCors(res);
    return res.status(500).json({ error: 'Internal Error', detail: String(err && err.message || err) });
  }
};


