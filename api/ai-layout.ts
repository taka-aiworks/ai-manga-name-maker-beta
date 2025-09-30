import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple CORS helper (allow cross-origin POST from GitHub Pages)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Cache-Control', 'max-age=86400');
    return res.status(204).setHeaders(corsHeaders as any).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).setHeaders(corsHeaders as any).json({ error: 'Method Not Allowed' });
  }

  try {
    const { sceneBrief, characters, options, candidateTemplateIds } = (req.body || {});

    if (!sceneBrief || typeof sceneBrief !== 'string') {
      return res.status(400).setHeaders(corsHeaders as any).json({ error: 'sceneBrief is required' });
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

    return res.status(200).setHeaders(corsHeaders as any).json(body);
  } catch (err: any) {
    return res.status(500).setHeaders(corsHeaders as any).json({ error: 'Internal Error', detail: String(err?.message || err) });
  }
}


