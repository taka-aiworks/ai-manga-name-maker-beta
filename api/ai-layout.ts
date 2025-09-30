// Simple CORS helper (allow cross-origin POST from GitHub Pages)
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
} as const;

function setCors(res: any) {
  res.setHeader('Access-Control-Allow-Origin', CORS['Access-Control-Allow-Origin']);
  res.setHeader('Access-Control-Allow-Methods', CORS['Access-Control-Allow-Methods']);
  res.setHeader('Access-Control-Allow-Headers', CORS['Access-Control-Allow-Headers']);
}

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Cache-Control', 'max-age=86400');
    setCors(res);
    return res.status(204).send('');
  }

  if (req.method === 'GET') {
    // Helpful ping for browser open
    setCors(res);
    return res.status(200).json({ ok: true, endpoint: '/api/ai-layout', method: 'POST', usage: 'POST JSON { sceneBrief, characters[] }' });
  }

  if (req.method !== 'POST') {
    setCors(res);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let bodyData: any = req.body;
    if (!bodyData || typeof bodyData === 'string') {
      try { bodyData = JSON.parse(req.body || '{}'); } catch { bodyData = {}; }
    }
    const { sceneBrief, characters, options, candidateTemplateIds } = (bodyData || {});

    if (!sceneBrief || typeof sceneBrief !== 'string') {
      setCors(res);
      return res.status(400).json({ error: 'sceneBrief is required' });
    }

    // Heuristic fallback (no OpenAI call yet): choose templateId by brief length / characters size
    const charCount = Array.isArray(characters) ? characters.length : 0;
    const len = sceneBrief.length;

    let templateId = 'reverse_t';
    const desired = options?.desiredPanels;
    const withinCandidates = (id: string) => Array.isArray(candidateTemplateIds) ? candidateTemplateIds.includes(id) : true;

    const pickByPanels = (n: number) => (n <= 2 ? 'reverse_t' : n === 3 ? 'triple' : 'quad');

    if (typeof desired === 'number') templateId = pickByPanels(desired);
    else if (charCount >= 3 || len > 120) templateId = 'quad';
    else if (len > 60) templateId = 'triple';
    else templateId = 'reverse_t';

    if (!withinCandidates(templateId) && Array.isArray(candidateTemplateIds) && candidateTemplateIds.length) {
      // fallback to first candidate if our pick not allowed
      templateId = candidateTemplateIds[0];
    }

    const body = {
      templateId,
      rationale: 'heuristic-fallback',
    };

    setCors(res);
    return res.status(200).json(body);
  } catch (err: any) {
    setCors(res);
    return res.status(500).json({ error: 'Internal Error', detail: String(err?.message || err) });
  }
}


