import CryptoJS from 'crypto-js';
import { API_ENDPOINTS } from '../../api/apiEndpoints';

const USER_ID      = 'swgtm';
const RAW_PASSWORD = '$wgtm@76543';
const PRIVATE_KEY  = 'Yst@wGH#!34trak';

// ─── Crypto Helpers ────────────────────────────────────────────────────────────

const getKeyWordArray = (key) => {
  const keyUtf8 = CryptoJS.enc.Utf8.parse(key);
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
    iv: keyWA, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7,
  }).toString();
};

const aesDecrypt = (cipherText, key) => {
  const keyWA = getKeyWordArray(key);
  const bytes = CryptoJS.AES.decrypt(cipherText, keyWA, {
    iv: keyWA, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7,
  });
  return bytes.toString(CryptoJS.enc.Utf8);
};

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
  return `${n.getFullYear()}${pad(n.getMonth()+1)}${pad(n.getDate())}${pad(n.getHours())}${pad(n.getMinutes())}${pad(n.getSeconds())}`;
};

const buildHashedPassword = (timestamp) => {
  const hash1 = CryptoJS.MD5(RAW_PASSWORD).toString().toLowerCase();
  return CryptoJS.MD5(timestamp + hash1).toString().toLowerCase();
};

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
  console.log('📤 Calling:', url);
  console.log('📦 Inner payload:', JSON.stringify(innerPayload));
  const finalBody = buildFinalInput(innerPayload);
  console.log('🔐 Encrypted body keys:', Object.keys(finalBody));

  const response = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(finalBody),
  });

  console.log('📡 HTTP status:', response.status);
  const rawText = await response.text();
  console.log('📥 Raw response:', rawText);

  if (!rawText || rawText.trim() === '') throw new Error('Empty response from server');

  // Check for server-side error response (unencrypted JSON with "Error" key)
  try {
    const errCheck = JSON.parse(rawText);
    if (errCheck?.Error || errCheck?.error) {
      const msg = errCheck.Error || errCheck.error;
      console.error('🚨 Server error:', msg, '| Log-Id:', errCheck['Log-Id']);
      throw new Error(`Server error: ${msg} (Log-Id: ${errCheck['Log-Id'] ?? 'N/A'})`);
    }
  } catch (e) {
    // If it throws our own error, re-throw it
    if (e.message.startsWith('Server error:')) throw e;
    // Otherwise it wasn't plain JSON — continue to decryption
  }

  // Attempt 1: decrypt as AES
  try {
    const stripped  = rawText.replace(/^"|"$/g, '').trim();
    const decrypted = aesDecrypt(stripped, PRIVATE_KEY);
    console.log('✅ Decrypted response:', decrypted);
    if (decrypted) return JSON.parse(decrypted);
  } catch (e1) {
    console.log('⚠️ Decrypt attempt 1 failed:', e1.message);
  }

  // Attempt 2: plain JSON
  try {
    const parsed = JSON.parse(rawText);
    console.log('✅ Plain JSON response:', parsed);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (e2) {
    console.log('⚠️ Plain JSON parse failed:', e2.message);
  }

  throw new Error(`Cannot parse server response: ${rawText.substring(0, 200)}`);
};

// ─── Exported Service Functions ────────────────────────────────────────────────

/**
 * Step 1 – Send OTP to mobile number
 */
export const sendOTP = (mobileNo) =>
  callSwagatamAPI(API_ENDPOINTS.SEND_OTP, { VisMobNo: mobileNo });

/**
 * Step 2 – Verify OTP and register visitor
 */
export const verifyOTPAndRegister = ({ mobileNo, name, gender, otp, password }) =>
  callSwagatamAPI(API_ENDPOINTS.VERIFY_OTP, {
    VisMob:      mobileNo,
    VisName:     name.trim(),
    VisGender:   gender,
    OTP:         otp.trim(),
    VisPassword: password,
  });

/**
 * Step 3 – Check profile completion status
 * @param {number|string} visNo  – numeric visitor reference number from session
 */
export const checkProfileStatus = (visNo) =>
  callSwagatamAPI(API_ENDPOINTS.CHECK_PROFILE_STATUS, { VisNo: Number(visNo) });

/**
 * Step 4 – Complete visitor profile
 *
 * All params must already be mapped to API-expected codes before calling:
 *   - visGender  : 'M' | 'F' | 'O'
 *   - visIdType  : numeric string e.g. '1' (VOTER ID) … '5' (OTHER)
 *   - visPresentState / visPermanentState : numeric LG-directory state code strings
 *   - photoBase64    : base64 string of jpg/jpeg/png/bmp image < 20 KB
 *   - documentBase64 : base64 string of PDF < 400 KB
 */
export const completeProfile = ({
  visNo,
  visMob,
  visName,
  visFName,
  visdob,
  visGender,
  visemail,
  visIdType,
  visIddetails,
  occupation,
  visPresentAddress,
  presentLandmark,
  visPresentState,
  visPinCode,
  visPermanentAddress,
  visPermanentLandmark,
  visPermanentState,
  visPermanentPincode,
  photoBase64,
  documentBase64,
}) =>
  callSwagatamAPI(API_ENDPOINTS.COMPLETE_PROFILE, {
    VisNo:                1192563,             // hardcoded until session is wired up
    VisMob:               visMob,
    VisName:              visName,
    VisFName:             visFName,
    Visdob:               visdob,             // 'YYYY-MM-DD'
    VisGender:            visGender,          // 'M' | 'F' | 'O'
    visemail:             visemail,
    VisIdType:            visIdType,          // numeric string e.g. '1'
    VisIddetails:         visIddetails,
    occupation:           occupation,
    VisPresentAddress:    visPresentAddress,
    PresentLandmark:      presentLandmark,    // alpha text only
    Visprsentstate:       visPresentState,    // numeric LG code string e.g. '27'
    Vis_PinCode:          visPinCode,         // 6-digit string
    VisPermanentAddress:  visPermanentAddress,
    VisPermanentLandmark: visPermanentLandmark,
    VisPermanentstate:    visPermanentState,  // numeric LG code string
    VisPermanentPincode:  visPermanentPincode,
    PhotoBase64:          photoBase64,        // jpg/png/bmp base64 < 20 KB
    DocumentBase64:       documentBase64,     // PDF base64 < 400 KB
  });