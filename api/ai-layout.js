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
    const templateId = typeof options.templateId === 'string' ? options.templateId : 'reverse_t';
    const panelBriefs = Array.isArray(options.panelBriefs) ? options.panelBriefs : [];

    if (!sceneBrief) {
      return res.status(400).json({ error: 'sceneBrief is required' });
    }

    // Heuristic placement: build minimal panels[] with characters/bubbles/backgrounds
    const panelCount = Math.max(panelBriefs.length, 2); // use panelBriefs length or default 2-4
    const panels = [];

    for (let i = 0; i < panelCount; i++) {
      const panelBrief = panelBriefs[i] || '';
      const isFirstPanel = i === 0;
      const isLastPanel = i === panelCount - 1;

      // Simple heuristic: place 1-2 characters per panel
      const panelChars = [];
      if (characters.length > 0) {
        const charType = characters[Math.min(i % characters.length, characters.length - 1)] || characters[0];
        panelChars.push({
          type: `character_${(i % 4) + 1}`, // cycle character_1..4
          x: 0.3 + (i % 2) * 0.2, // alternate left/center/right
          y: 0.4,
          scale: 1.0,
          faceDirection: i % 2 === 0 ? 'right' : 'left',
          emotion: isLastPanel ? 'surprised' : isFirstPanel ? 'neutral' : 'happy'
        });
      }

      // Simple bubble: 1 per panel, positioned above character
      const panelBubbles = [];
      if (panelChars.length > 0) {
        panelBubbles.push({
          type: 'normal',
          speaker: panelChars[0].type,
          text: panelBrief || `コマ${i+1}のセリフ`,
          x: panelChars[0].x,
          y: panelChars[0].y - 0.15,
          width: 0.3,
          height: 0.12
        });
      }

      // Background: simple gradient/solid
      const panelBackgrounds = [{
        type: 'gradient_v',
        x: 0, y: 0, width: 1, height: 1, opacity: 0.3
      }];

      panels.push({ characters: panelChars, bubbles: panelBubbles, backgrounds: panelBackgrounds });
    }

    return res.status(200).json({ panels, rationale: 'heuristic-placement' });
  } catch (err) {
    setCors(res);
    return res.status(500).json({ error: 'Internal Error', detail: String(err && err.message || err) });
  }
};


