import CryptoJS from 'crypto-js';
import { API_ENDPOINTS } from '../../api/apiEndpoints';

// ─── Credentials ───────────────────────────────────────────────────────────────
const USER_ID      = 'swgtm';
const RAW_PASSWORD = '$wgtm@76543';
const PRIVATE_KEY  = 'Yst@wGH#!34trak';

// ─── Crypto Helpers ────────────────────────────────────────────────────────────

const getKeyWordArray = (key) => {
  const keyUtf8  = CryptoJS.enc.Utf8.parse(key);
  const keyBytes = new Uint8Array(16);
  const srcBytes = [];
  for (let i = 0; i < keyUtf8.sigBytes; i++) {
    srcBytes.push((keyUtf8.words[Math.floor(i / 4)] >>> (24 - (i % 4) * 8)) & 0xff);
  }
  for (let i = 0; i < Math.min(srcBytes.length, 16); i++) {
    keyBytes[i] = srcBytes[i];
  }
  const words = [];
  for (let i = 0; i < 16; i += 4) {
    words.push(
      ((keyBytes[i]     & 0xff) << 24) |
      ((keyBytes[i + 1] & 0xff) << 16) |
      ((keyBytes[i + 2] & 0xff) << 8)  |
       (keyBytes[i + 3] & 0xff)
    );
  }
  return CryptoJS.lib.WordArray.create(words, 16);
};

const aesEncrypt = (plainText, key) => {
  const keyWA = getKeyWordArray(key);
  return CryptoJS.AES.encrypt(plainText, keyWA, {
    iv:      keyWA,
    mode:    CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
};

const aesDecrypt = (cipherText, key) => {
  const keyWA = getKeyWordArray(key);
  const bytes = CryptoJS.AES.decrypt(cipherText, keyWA, {
    iv:      keyWA,
    mode:    CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return bytes.toString(CryptoJS.enc.Utf8);
};

// ─── Key & Timestamp Helpers ───────────────────────────────────────────────────

const getSharedKey = () => {
  const now  = new Date();
  const dd   = String(now.getDate()).padStart(2, '0');
  const mm   = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  return `eVisitors${dd}${mm}${yyyy}`;
};

const getTimestamp = () => {
  const n   = new Date();
  const pad = (v) => String(v).padStart(2, '0');
  return `${n.getFullYear()}${pad(n.getMonth() + 1)}${pad(n.getDate())}${pad(n.getHours())}${pad(n.getMinutes())}${pad(n.getSeconds())}`;
};

const buildHashedPassword = (timestamp) => {
  const hash1 = CryptoJS.MD5(RAW_PASSWORD).toString().toLowerCase();
  return CryptoJS.MD5(timestamp + hash1).toString().toLowerCase();
};

/**
 * CRITICAL: innerPayload must be a plain JS object.
 * JSON.stringify safely escapes all special chars (apostrophes, quotes, tabs, etc.)
 * before AES encryption. Never manually build a JSON string for the payload.
 */
const buildFinalInput = (innerPayload) => {
  const timestamp = getTimestamp();

  // Safely serialise — apostrophes like "Hon'ble" become "Hon\'ble" in JSON
  const innerJson = JSON.stringify(innerPayload);
  console.log('Inner payload JSON (safe):', innerJson);

  const encData   = aesEncrypt(innerJson, PRIVATE_KEY);
  const secondary = {
    UserId:    USER_ID,
    Password:  buildHashedPassword(timestamp),
    TimeStamp: timestamp,
    Data:      encData,
  };
  return { Input: aesEncrypt(JSON.stringify(secondary), getSharedKey()) };
};

// ─── Core API Caller ───────────────────────────────────────────────────────────

const callSwagatamAPI = async (url, innerPayload) => {
  console.log('Calling:', url);

  const finalBody = buildFinalInput(innerPayload);
  console.log('Encrypted body:', JSON.stringify(finalBody));

  const response = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(finalBody),
  });

  console.log('HTTP status:', response.status);
  const rawText = await response.text();
  console.log('Raw response:', rawText);

  if (!rawText || rawText.trim() === '') {
    throw new Error('Empty response from server');
  }

  try {
    const errCheck = JSON.parse(rawText);
    if (errCheck?.Error || errCheck?.error) {
      const msg = errCheck.Error || errCheck.error;
      throw new Error(`Server error: ${msg} (Log-Id: ${errCheck['Log-Id'] ?? 'N/A'})`);
    }
  } catch (e) {
    if (e.message.startsWith('Server error:')) throw e;
  }

  try {
    const stripped  = rawText.replace(/^"|"$/g, '').trim();
    const decrypted = aesDecrypt(stripped, PRIVATE_KEY);
    console.log('Decrypted response:', decrypted);
    if (decrypted) return JSON.parse(decrypted);
  } catch (e1) {
    console.log('Decrypt attempt 1 failed:', e1.message);
  }

  try {
    const parsed = JSON.parse(rawText);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (e2) {
    console.log('Plain JSON parse failed:', e2.message);
  }

  throw new Error(`Cannot parse server response: ${rawText.substring(0, 200)}`);
};

// ─── Exported Service Functions ────────────────────────────────────────────────

export const fetchGovTypes = async () => {
  const result = await callSwagatamAPI(API_ENDPOINTS.POPULATE_GOV_TYPE, {});
  if (!result?.Success) throw new Error(result?.Message || 'Failed to fetch organization types');
  return result.Data || [];
};

export const fetchStateOrMinistry = async (govType) => {
  const result = await callSwagatamAPI(
    API_ENDPOINTS.GET_STATE_OR_MINISTRY,
    { GovType: String(govType) },
  );
  if (!result?.Success) throw new Error(result?.Message || 'Failed to fetch states/ministries');
  return result.Data || [];
};

export const fetchBhawanByMinistry = async (ministryCode) => {
  const result = await callSwagatamAPI(
    API_ENDPOINTS.GET_BHAWAN_BY_MINISTRY,
    { MinistryCode: String(ministryCode) },
  );
  if (!result?.Success) throw new Error(result?.Message || 'Failed to fetch buildings');
  return result.Data || [];
};

export const fetchOfficersByBhawan = async (ministryCode, bhawanCode) => {
  const result = await callSwagatamAPI(
    API_ENDPOINTS.GET_OFFICER_BY_BHAWAN,
    { MinistryCode: String(ministryCode), BhawanCode: String(bhawanCode) },
  );
  if (!result?.Success) throw new Error(result?.Message || 'Failed to fetch officers');
  return {
    officers:             result.Data || [],
    isVehicleAllowed:     result.IsVehicleAllowed     ?? false,
    isAddlVisitorAllowed: result.IsAddlVisitorAllowed ?? false,
  };
};

/**
 * Submit a visit appointment.
 *
 * StateCode rules (from API docs):
 *   - GovCode = "2" (State Govt) → send the numeric state Id from GetStateOrMinistry
 *     e.g. Maharashtra = "27", Delhi = "7"  (no zero-padding needed)
 *   - All other GovCodes            → send "0"
 *
 * Pass innerPayload as a plain JS object — do NOT pre-stringify it.
 * buildFinalInput will call JSON.stringify internally, which safely escapes
 * apostrophes (Hon'ble → Hon\'ble) and all other special characters.
 */
export const insertAppVisitor = async (payload) => {
  if (!payload?.Vis_Reg_No || String(payload.Vis_Reg_No).trim() === '') {
    throw new Error('Vis_Reg_No is required.');
  }

  // Log safely — JSON.stringify here too so apostrophes don't break the log line
  console.log('Submit payload (safe):', JSON.stringify(payload));

  const result = await callSwagatamAPI(API_ENDPOINTS.INSERT_APP_VISITOR, payload);
  if (!result?.Success) throw new Error(result?.Message || 'Failed to submit appointment');
  return result;
};