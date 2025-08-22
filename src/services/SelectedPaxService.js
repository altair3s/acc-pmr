// src/services/SelectedPaxService.js
import { SITE_ID, getCurrentSheetId } from '../config/siteConfig';

const WEBAPP_URL = process.env.REACT_APP_GAS_WEBAPP_URL;
const SITE_TOKEN = process.env.REACT_APP_SITE_TOKEN || '';

function makeUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'uuid-' + Date.now() + '-' + Math.random().toString(16).slice(2);
}
function requireSheetId() {
  const id = getCurrentSheetId();
  if (!id) throw new Error(`Aucun Sheet ID pour le site "${SITE_ID}"`);
  return id;
}

// ---- transport fire-and-forget (évite les erreurs CORS et les rejets de promesse)
function postOpaque(bodyObj) {
  const payload = JSON.stringify(bodyObj);

  // 1) sendBeacon (pas de CORS, jamais d'erreur JS)
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    try {
      const blob = new Blob([payload], { type: 'text/plain;charset=UTF-8' });
      const ok = navigator.sendBeacon(WEBAPP_URL, blob);
      if (ok) return; // done
    } catch (_) {}
  }

  // 2) fallback fetch no-cors (on n’attend pas, on ignore les erreurs)
  try {
    fetch(WEBAPP_URL, { method: 'POST', mode: 'no-cors', body: payload });
  } catch (_) {
    // on avale l’erreur : best-effort
  }
}

export async function appendSelectedPassenger(passenger) {
  if (!WEBAPP_URL) throw new Error('REACT_APP_GAS_WEBAPP_URL manquant.');
  const sheetId = requireSheetId();
  const uuid = makeUUID();

  const body = {
    action: 'append',
    sheetId,
    siteId: SITE_ID,
    token: SITE_TOKEN,
    passenger: {
      uuid,
      created_at: new Date().toISOString(),
      idPax: passenger.idPax || '',
      lastName: passenger.lastName || '',
      firstName: passenger.firstName || '',
      flightNumber: passenger.flightNumber || '',
      departureTime: passenger.departureTime || '',
      goAcc: passenger.goAcc || '',
      ssr1: passenger.ssr1 || '',
      isSkyPriority: !!passenger.isSkyPriority,
      isAssisted: !!passenger.isAssisted
    }
  };

  postOpaque(body);
  return { rowNumber: undefined, uuid };
}

export function deleteRowByUuid(uuid) {
  if (!WEBAPP_URL || !uuid) return;
  const sheetId = requireSheetId();
  postOpaque({ action: 'deleteByUuid', sheetId, token: SITE_TOKEN, uuid });
}

// Optionnel: gardé pour compat si jamais tu as un rowNumber
export function deleteRowByNumber(rowNumber) {
  if (!WEBAPP_URL || !rowNumber || rowNumber < 2) return;
  const sheetId = requireSheetId();
  postOpaque({ action: 'deleteByRow', sheetId, token: SITE_TOKEN, rowNumber });
}

// 🔧 Nouveau: update partiel de champs par UUID (goAcc, isSkyPriority, isAssisted, …)
export function updateSelectedPassenger(uuid, fields) {
  if (!WEBAPP_URL || !uuid || !fields) return;
  const sheetId = requireSheetId();
  postOpaque({ action: 'updateByUuid', sheetId, token: SITE_TOKEN, uuid, fields });
}
