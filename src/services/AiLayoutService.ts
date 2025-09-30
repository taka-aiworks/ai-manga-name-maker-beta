// src/services/AiLayoutService.ts
// Minimal client for AI layout suggestion. Safe to ship without backend; falls back locally.

export type AiLayoutRequest = {
  sceneBrief: string;
  characters?: string[];
  options?: {
    tone?: string;
    desiredPanels?: number | 'auto';
  };
  candidateTemplateIds?: string[];
};

export type AiPanelPlacement = {
  characters?: Array<{ type: string; x: number; y: number; scale?: number; faceDirection?: string; emotion?: string }>;
  bubbles?: Array<{ type: string; speaker: string; text?: string; x: number; y: number; width: number; height: number }>;
  backgrounds?: Array<{ type?: string; prompt?: string; x: number; y: number; width: number; height: number; opacity?: number }>;
  effects?: Array<{ type: string; intensity?: number; angle?: number; x: number; y: number; width: number; height: number }>
};

export type AiLayoutResponse = {
  templateId: string;
  panels?: AiPanelPlacement[];
  alternates?: Array<{ templateId: string; shortReason?: string }>;
  rationale?: string;
};

const DEFAULT_ENDPOINT = (process.env.REACT_APP_AI_ENDPOINT || '/api/ai-layout');

export async function requestAiLayout(payload: AiLayoutRequest, endpoint: string = DEFAULT_ENDPOINT): Promise<AiLayoutResponse> {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // Basic shape check
    if (!data || typeof data.templateId !== 'string') throw new Error('Invalid response');
    return data as AiLayoutResponse;
  } catch (e) {
    // Local heuristic fallback: pick a reasonable default by characters count / scene density from text length
    const charCount = payload.characters?.length || 2;
    const len = payload.sceneBrief?.length || 0;
    let templateId = 'reverse_t';
    if (payload.options?.desiredPanels && payload.options.desiredPanels !== 'auto') {
      templateId = pickByPanelCount(payload.options.desiredPanels);
    } else if (charCount >= 3 || len > 120) {
      templateId = 'quad';
    } else if (len > 60) {
      templateId = 'triple';
    } else {
      templateId = 'reverse_t';
    }
    return { templateId };
  }
}

function pickByPanelCount(n: number): string {
  if (n <= 2) return 'reverse_t';
  if (n === 3) return 'triple';
  return 'quad';
}


