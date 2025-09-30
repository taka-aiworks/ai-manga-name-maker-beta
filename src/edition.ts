// src/edition.ts - Edition flags and runtime overrides

// Edition: 'free' | 'pro'
export const EDITION: 'free' | 'pro' =
  (process.env.REACT_APP_EDITION === 'pro' ? 'pro' : 'free');

export const IS_PRO = EDITION === 'pro';

// Resolve max pages with priority: URL param > localStorage > env > default
const getUrlOverride = (): number | null => {
  try {
    const sp = new URLSearchParams(window.location.search);
    const v = sp.get('maxPages');
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
};

const getLocalOverride = (): number | null => {
  try {
    const v = localStorage.getItem('max_pages_override');
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
};

const getEnvDefault = (): number => {
  const env = Number(process.env.REACT_APP_MAX_PAGES);
  if (Number.isFinite(env) && env > 0) return env;
  return IS_PRO ? 1000 : 10;
};

export const MAX_PAGES: number =
  getUrlOverride() ?? getLocalOverride() ?? getEnvDefault();

// Optional feature flags (placeholders for future use)
export const ENABLE_SEO: boolean = (process.env.REACT_APP_ENABLE_SEO ?? 'true') === 'true';
export const MOBILE_COMPACT: boolean = (process.env.REACT_APP_MOBILE_COMPACT ?? 'true') === 'true';



