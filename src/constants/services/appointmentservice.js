import CryptoJS from 'crypto-js';
import { API_ENDPOINTS } from '../../api/apiEndpoints';

// ─── Credentials ───────────────────────────────────────────────────────────────
const USER_ID      = 'swgtm';
const RAW_PASSWORD = '$wgtm@76543';
const PRIVATE_KEY  = 'Yst@wGH#!34trak'; // 15 chars — Java truncates/pads to 16

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
  }).toString(); // Base64
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
 * Builds the 3-layer encrypted body:
 *   Layer 1: innerPayload  → AES(PRIVATE_KEY)  → encData
 *   Layer 2: { UserId, Password, TimeStamp, Data: encData } → AES(sharedKey) → Input
 *   Layer 3: { Input: ... }  ← final POST body
 */
const buildFinalInput = (innerPayload) => {
  const timestamp = getTimestamp();
  const encData   = aesEncrypt(JSON.stringify(innerPayload), PRIVATE_KEY);
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
  console.log('Inner payload:', JSON.stringify(innerPayload));

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

  // Check for unencrypted server-side error response
  try {
    const errCheck = JSON.parse(rawText);
    if (errCheck?.Error || errCheck?.error) {
      const msg = errCheck.Error || errCheck.error;
      console.error('Server error:', msg, '| Log-Id:', errCheck['Log-Id']);
      throw new Error(`Server error: ${msg} (Log-Id: ${errCheck['Log-Id'] ?? 'N/A'})`);
    }
  } catch (e) {
    if (e.message.startsWith('Server error:')) throw e;
  }

  // Attempt 1: strip surrounding quotes then decrypt with PRIVATE_KEY
  try {
    const stripped  = rawText.replace(/^"|"$/g, '').trim();
    const decrypted = aesDecrypt(stripped, PRIVATE_KEY);
    console.log('Decrypted response:', decrypted);
    if (decrypted) return JSON.parse(decrypted);
  } catch (e1) {
    console.log('Decrypt attempt 1 failed:', e1.message);
  }

  // Attempt 2: plain JSON (server returned unencrypted)
  try {
    const parsed = JSON.parse(rawText);
    console.log('Plain JSON response:', parsed);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (e2) {
    console.log('Plain JSON parse failed:', e2.message);
  }

  throw new Error(`Cannot parse server response: ${rawText.substring(0, 200)}`);
};

// ─── Exported Service Functions ────────────────────────────────────────────────

/**
 * Fetch organization / government types.
 *
 * URL:      POST /eVisitors/PopulateGovtype
 * Payload:  {}
 * Response: { Success: true, Data: [{ Id: "1", Name: "Central Governement" }, ...] }
 */
export const fetchGovTypes = async () => {
  const result = await callSwagatamAPI(API_ENDPOINTS.POPULATE_GOV_TYPE, {});
  if (!result?.Success) throw new Error(result?.Message || 'Failed to fetch organization types');
  return result.Data || [];
};

/**
 * Fetch states / ministries for a given government type.
 *
 * URL:      POST /eVisitors/GetStateOrMinistry
 * Payload:  { GovType: "1" }
 * Response: { Success: true, Data: [{ Id: "1", Name: "National Informatics Centre" }, ...] }
 *
 * @param {string} govType - Id returned from fetchGovTypes (e.g. "1")
 */
export const fetchStateOrMinistry = async (govType) => {
  const result = await callSwagatamAPI(
    API_ENDPOINTS.GET_STATE_OR_MINISTRY,
    { GovType: String(govType) },
  );
  if (!result?.Success) throw new Error(result?.Message || 'Failed to fetch states/ministries');
  return result.Data || [];
};

/**
 * Fetch buildings for a given ministry / department.
 *
 * URL:      POST /eVisitors/GetBhawanByMinistry
 * Payload:  { MinistryCode: "1" }
 * Response: { Success: true, Data: [{ Id: "20", Name: "NIC Headquarter" }, ...] }
 *
 * @param {string} ministryCode - Id returned from fetchStateOrMinistry (e.g. "1")
 */
export const fetchBhawanByMinistry = async (ministryCode) => {
  const result = await callSwagatamAPI(
    API_ENDPOINTS.GET_BHAWAN_BY_MINISTRY,
    { MinistryCode: String(ministryCode) },
  );
  if (!result?.Success) throw new Error(result?.Message || 'Failed to fetch buildings');
  return result.Data || [];
};

/**
 * Fetch officers for a given ministry + building combination.
 *
 * URL:      POST /eVisitors/GetOfficerByBhawan
 * Payload:  { MinistryCode: "3", BhawanCode: "6" }
 * Response: {
 *   IsVehicleAllowed: true,
 *   IsAddlVisitorAllowed: true,
 *   Success: true,
 *   Message: "Officers fetched successfully.",
 *   Data: [{ Id: "R000600030035", Name: "test data( Constable - dete )" }, ...]
 * }
 *
 * @param {string} ministryCode - department/ministry Id (from fetchStateOrMinistry)
 * @param {string} bhawanCode   - building Id (from fetchBhawanByMinistry)
 * @returns {{ officers: Array, isVehicleAllowed: boolean, isAddlVisitorAllowed: boolean }}
 */
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
 * URL:      POST /eVisitors/InsertAppVisitor
 * Payload:
 *   {
 *     Vis_Reg_No:             "13",              // REQUIRED — from login session
 *     MCode:                  "3",
 *     BCode:                  "6",
 *     Loc_Id:                 "R000600030021",
 *     Officer_Name:           "Testuser",        // just the name, NO designation
 *     Approving_Officer_Name: "Testuser( Scientist F - xyz Project Divison )", // full label
 *     Vis_Date:               "17/04/2026",      // DD/MM/YYYY
 *     Visit_Time:             "11:30",           // HH:MM 24-hr
 *     Visit_Purpose:          "Meeting",
 *     AdditionalVisitors:     "0",
 *     GovCode:                "2",
 *     StateCode:              "07",              // only required when GovCode = "2" (State Govt)
 *   }
 * Response: { Success: true, Message: "Visit request submitted successfully.", Data: ["I/0006/0003/8/2026/4002"] }
 *
 * @param {object} payload - All required fields as described above
 * @returns {{ Success: boolean, Message: string, Data: string[] }}
 */
export const insertAppVisitor = async (payload) => {
  if (!payload?.Vis_Reg_No || String(payload.Vis_Reg_No).trim() === '') {
    throw new Error(
      'Vis_Reg_No is required. ' +
      'Pass visRegNo via navigation params when opening CreateAppointmentScreen.',
    );
  }

  const result = await callSwagatamAPI(API_ENDPOINTS.INSERT_APP_VISITOR, payload);
  if (!result?.Success) throw new Error(result?.Message || 'Failed to submit appointment');
  return result;
};