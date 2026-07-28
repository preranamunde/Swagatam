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

export const callSwagatamAPI = async (url, innerPayload) => {
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
 * Login a visitor with mobile number and password.
 * Returns the first element of the Data array (visitor session object).
 *
 * Response shape:
 *   { Success: true, Message: "...", Data: [{ Vis_Reg_No, Name, Mobile, Email }] }
 */
export const loginVisitor = async (mobileNo, password) => {
  const result = await callSwagatamAPI(API_ENDPOINTS.LOGIN, {
    MobileNo: mobileNo,
    Password: password,
  });
  return Array.isArray(result) ? result[0] : result;
};

/**
 * Send (or resend) a login OTP to a registered mobile number.
 * Same endpoint handles both "Send OTP" and "Resend OTP" — no separate resend API.
 *
 * Server-side rules the UI should account for:
 *   - 3 minute cooldown between consecutive requests for the same number
 *   - Max 5 OTP requests per calendar day per number (resets at midnight)
 *   - Each new OTP invalidates any previously issued one
 *
 * Response shape (success):
 *   [{ "Result": "OTP successfully sent to your registered mobile number." }]
 * Response shape (error), still HTTP 200 — check the Result text:
 *   [{ "Result": "Please wait 165 seconds before requesting another OTP." }]
 *   [{ "Result": "This mobile number is not registered. Please register first." }]
 *   [{ "Result": "You have reached the maximum OTP requests for today. Please try again tomorrow." }]
 */
export const sendLoginOtp = async (mobileNo) => {
  const result = await callSwagatamAPI(API_ENDPOINTS.SEND_LOGIN_OTP, {
    MobileNo: mobileNo,
  });
  return Array.isArray(result) ? result[0] : result;
};

/**
 * Verify a login OTP for a mobile number.
 *
 * Server-side rules the UI should account for:
 *   - OTP must be entered within 5 minutes of being sent
 *   - Max 5 verification attempts per calendar day per number
 *   - A successful verification does not count toward the attempt limit
 *
 * Response shape (success):
 *   { Success: true, Message: "Login successful.",
 *     Data: [{ Vis_Reg_No, Name, Mobile, Email }] }
 * Response shape (error):
 *   { Success: false, Message: "Invalid OTP entered.", Data: null }
 */
export const verifyLoginOtp = async (mobileNo, otp) => {
  const result = await callSwagatamAPI(API_ENDPOINTS.VERIFY_LOGIN_OTP, {
    MobileNo: mobileNo,
    OTP: otp,
  });
  return Array.isArray(result) ? result[0] : result;
};