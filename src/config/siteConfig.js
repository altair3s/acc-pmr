// src/config/siteConfig.js

function getQueryParam(name) {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// SITE courant : ?site=XXX (prioritaire) > env > défaut
export const SITE_ID =
  getQueryParam('site') ||
  process.env.REACT_APP_SITE_ID ||
  'CDG_T2A';

// Mapping comptoir -> Google Sheet ID
export const SITE_SHEETS = {
  P10: '14m0-BHCaBHeKK7Aq-At4-ybdrkf1s3Ma1JD_VGKjzx4',
  CDG_T2B: 'PASTE_SHEET_ID_FOR_T2B',
  // ...
};

export function getCurrentSheetId() {
  return SITE_SHEETS[SITE_ID];
}
