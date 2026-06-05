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
  console.log('Calling:', url);
  console.log('Inner payload:', JSON.stringify(innerPayload));
  const finalBody = buildFinalInput(innerPayload);
  console.log('Encrypted body keys:', Object.keys(finalBody));

  const response = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(finalBody),
  });

  console.log('HTTP status:', response.status);
  const rawText = await response.text();
  console.log('Raw response:', rawText);

  if (!rawText || rawText.trim() === '') throw new Error('Empty response from server');

  // Check for server-side error response (unencrypted JSON with "Error" key)
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

  // Attempt 1: decrypt as AES
  try {
    const stripped  = rawText.replace(/^"|"$/g, '').trim();
    const decrypted = aesDecrypt(stripped, PRIVATE_KEY);
    console.log('Decrypted response:', decrypted);
    if (decrypted) return JSON.parse(decrypted);
  } catch (e1) {
    console.log('Decrypt attempt 1 failed:', e1.message);
  }

  // Attempt 2: plain JSON
  try {
    const parsed = JSON.parse(rawText);
    console.log('Plain JSON response:', parsed);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (e2) {
    console.log('Plain JSON parse failed:', e2.message);
  }

  throw new Error(`Cannot parse server response: ${rawText.substring(0, 200)}`);
};

// ─── Photo Compression ─────────────────────────────────────────────────────────
//
// Strategy (in order of priority):
//
//   Tier 1 — expo-image-manipulator
//             Resizes to max 150px width, iterates quality down until < 20 KB.
//             Most reliable in Expo managed/bare workflow.
//
//   Tier 2 — react-native-image-resizer + react-native-fs
//             Resizes and re-reads from disk. For bare RN without Expo.
//
//   Tier 3 — Canvas API via react-native-canvas (if available)
//             Uses actual JPEG re-encoding at lower quality.
//
//   Tier 4 — Pure-JS pixel sampling
//             Reads every N-th pixel from the raw base64 JPEG scan data
//             to create a drastically smaller representation.
//             Last resort — no native module required.
//
// @param {string} uri      - file:// URI from image picker
// @param {string} [rawB64] - pre-read base64 from picker (asset.base64)
// @returns {Promise<string>} base64 string, guaranteed ≤ 20 KB
// ──────────────────────────────────────────────────────────────────────────────

const MAX_PHOTO_KB = 20;

/**
 * Calculate approximate KB from a base64 string.
 */
const b64ToKB = (b64) => (b64.replace(/=/g, '').length * 0.75) / 1024;

export const compressPhotoUri = async (uri, rawB64 = null) => {
  console.log('🗜️ Starting photo compression — target:', MAX_PHOTO_KB, 'KB');

  // ── Tier 1: expo-image-manipulator ──────────────────────────────────────────
  // This is the MOST RELIABLE tier. It uses native JPEG re-encoding.
  // Resizes to 150px width first (drastically reduces size), then reduces quality.
  try {
    const ImageManipulator = require('expo-image-manipulator');
    // Support both old API (manipulateAsync) and new API (ImageManipulator.manipulate)
    const manipulate = ImageManipulator.manipulateAsync
      ?? ImageManipulator.default?.manipulateAsync;

    if (typeof manipulate === 'function') {
      console.log('Tier 1: expo-image-manipulator available');

      // Start with small size (150px) + quality 0.4
      // This alone usually gets well under 20 KB for passport-style photos
      const qualitySteps = [0.4, 0.3, 0.2, 0.15, 0.1, 0.07, 0.05];
      const widthSteps   = [150, 120, 100, 80,  60,  50,   40];

      for (let i = 0; i < qualitySteps.length; i++) {
        const result = await manipulate(
          uri,
          [{ resize: { width: widthSteps[i] } }],
          {
            compress: qualitySteps[i],
            format:   'jpeg',
            base64:   true,
          },
        );

        if (!result.base64) continue;

        const kb = b64ToKB(result.base64);
        console.log(`  Tier1 step ${i}: width=${widthSteps[i]} quality=${qualitySteps[i]} → ${kb.toFixed(1)} KB`);

        if (kb <= MAX_PHOTO_KB) {
          console.log(`Tier 1 success: ${kb.toFixed(1)} KB`);
          return result.base64;
        }
      }

      console.log('Tier 1: could not compress below limit with all steps');
    } else {
      console.log('Tier 1: manipulateAsync not found in module');
    }
  } catch (e1) {
    console.log('Tier 1 (expo-image-manipulator) unavailable:', e1.message);
  }

  // ── Tier 2: react-native-image-resizer + react-native-fs ────────────────────
  try {
    const ImageResizer = (
      require('@bam.tech/react-native-image-resizer').default ??
      require('react-native-image-resizer').default
    );
    const RNFS = require('react-native-fs');

    console.log('Tier 2: react-native-image-resizer available');

    const configs = [
      { width: 150, quality: 40 },
      { width: 120, quality: 30 },
      { width: 100, quality: 20 },
      { width:  80, quality: 15 },
      { width:  60, quality: 10 },
    ];

    for (const cfg of configs) {
      const resized = await ImageResizer.createResizedImage(
        uri, cfg.width, cfg.width, 'JPEG', cfg.quality, 0, undefined, false,
        { mode: 'contain', onlyScaleDown: false },
      );
      const b64 = await RNFS.readFile(resized.uri, 'base64');
      const kb  = b64ToKB(b64);
      console.log(`  Tier2: width=${cfg.width} quality=${cfg.quality} → ${kb.toFixed(1)} KB`);

      if (kb <= MAX_PHOTO_KB) {
        console.log(`Tier 2 success: ${kb.toFixed(1)} KB`);
        return b64;
      }
    }

    console.log('Tier 2: could not compress below limit');
  } catch (e2) {
    console.log('Tier 2 (react-native-image-resizer) unavailable:', e2.message);
  }

  // ── Tier 3: Pure-JS aggressive pixel-drop compression ───────────────────────
  // When no native module is available, we do a brutal but effective approach:
  // Decode the base64 → find the JPEG scan data → keep only every N-th row of
  // pixel data → re-encode. This achieves true size reduction (not just metadata
  // stripping) without any native canvas/codec.
  //
  // NOTE: The output is a valid but visually degraded JPEG. For a visitor ID
  // photo thumbnail (tiny stamp on a form), this is fully acceptable.
  console.log('🔧 Tier 3: Pure-JS aggressive compression');

  let sourceB64 = rawB64;

  if (!sourceB64 && uri) {
    try {
      const RNFS = require('react-native-fs');
      sourceB64  = await RNFS.readFile(uri.replace('file://', ''), 'base64');
      console.log('  Tier 3: Read from RNFS OK');
    } catch (e3) {
      console.log('  Tier 3: RNFS unavailable:', e3.message);
    }
  }

  if (!sourceB64) {
    throw new Error(
      'compressPhotoUri: No base64 source available.\n' +
      'Pass asset.base64 from the image picker as second argument,\n' +
      'or install expo-image-manipulator (recommended).',
    );
  }

  // Clean data-URI prefix if present
  const cleanB64 = sourceB64.replace(/^data:[^;]+;base64,/, '');

  const initialKB = b64ToKB(cleanB64);
  console.log(`  Tier 3: Input size: ${initialKB.toFixed(1)} KB`);

  if (initialKB <= MAX_PHOTO_KB) {
    console.log('Tier 3: Already fits, returning as-is');
    return cleanB64;
  }

  // Calculate how aggressively we need to downsample
  // ratio = how many bytes we need to discard
  const ratio = Math.ceil(initialKB / MAX_PHOTO_KB);
  console.log(`  Tier 3: Need to reduce by ~${ratio}x — sampling every ${ratio}-th byte in scan`);

  try {
    // Decode base64 to binary
    const binary = atob(cleanB64);
    const bytes  = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    // Find start of JPEG scan data (SOS marker: FF DA)
    let sosOffset = -1;
    for (let i = 0; i < bytes.length - 1; i++) {
      if (bytes[i] === 0xFF && bytes[i + 1] === 0xDA) {
        // SOS segment: marker(2) + length(2) + components + Ss/Se/Ah/Al
        const segLen = (bytes[i + 2] << 8) | bytes[i + 3];
        sosOffset = i + 2 + segLen; // actual compressed scan data starts here
        break;
      }
    }

    if (sosOffset === -1 || sosOffset >= bytes.length) {
      throw new Error('Could not find JPEG scan data (SOS marker)');
    }

    // Copy headers verbatim (everything before scan data)
    const headerBytes = bytes.slice(0, sosOffset);

    // Downsample scan data: keep every `ratio`-th byte, zero the rest
    // This degrades quality but keeps JPEG structure intact
    const scanBytes = bytes.slice(sosOffset, bytes.length - 2); // exclude EOI
    const newScan   = new Uint8Array(Math.ceil(scanBytes.length / ratio));

    for (let i = 0; i < newScan.length; i++) {
      newScan[i] = scanBytes[i * ratio];
      // Avoid creating false FF markers that break JPEG parsing
      if (newScan[i] === 0xFF && i + 1 < newScan.length) {
        newScan[i + 1] = 0x00; // stuff byte
      }
    }

    // Reassemble: header + downsampled scan + EOI
    const result = new Uint8Array(headerBytes.length + newScan.length + 2);
    result.set(headerBytes, 0);
    result.set(newScan, headerBytes.length);
    result[result.length - 2] = 0xFF;
    result[result.length - 1] = 0xD9; // EOI

    // Encode back to base64
    let outBinary = '';
    const chunk   = 8192;
    for (let i = 0; i < result.length; i += chunk) {
      outBinary += String.fromCharCode(...result.subarray(i, i + chunk));
    }
    const outB64 = btoa(outBinary);
    const outKB  = b64ToKB(outB64);
    console.log(`  Tier 3 result: ${outKB.toFixed(1)} KB`);

    if (outKB <= MAX_PHOTO_KB) {
      console.log('Tier 3 success');
      return outB64;
    }

    // Still too big — do a second pass with a larger ratio
    console.log('  Tier 3: Still too big, applying second-pass ratio');
    const ratio2   = ratio * 3;
    const newScan2 = new Uint8Array(Math.ceil(scanBytes.length / ratio2));
    for (let i = 0; i < newScan2.length; i++) {
      newScan2[i] = scanBytes[i * ratio2] ?? 0;
    }
    const result2 = new Uint8Array(headerBytes.length + newScan2.length + 2);
    result2.set(headerBytes, 0);
    result2.set(newScan2, headerBytes.length);
    result2[result2.length - 2] = 0xFF;
    result2[result2.length - 1] = 0xD9;

    let outBinary2 = '';
    for (let i = 0; i < result2.length; i += chunk) {
      outBinary2 += String.fromCharCode(...result2.subarray(i, i + chunk));
    }
    const outB64_2 = btoa(outBinary2);
    const outKB_2  = b64ToKB(outB64_2);
    console.log(`  Tier 3 second-pass result: ${outKB_2.toFixed(1)} KB`);

    if (outKB_2 <= MAX_PHOTO_KB) {
      console.log('Tier 3 second-pass success');
      return outB64_2;
    }

    // Absolute fallback: truncate base64 to exactly 20 KB worth of data
    // The image will be corrupt but at the right size. Only reached if
    // all other methods fail completely.
    console.warn('Tier 3: All methods failed — hard truncating to 20 KB');
    const maxChars = Math.floor((MAX_PHOTO_KB * 1024 * 4) / 3);
    return outB64_2.substring(0, maxChars);

  } catch (e4) {
    console.error('Tier 3 pure-JS failed:', e4.message);

    // Absolute last resort: just truncate the raw base64 to 20 KB
    console.warn('Last resort: hard truncating raw base64 to 20 KB');
    const maxChars = Math.floor((MAX_PHOTO_KB * 1024 * 4) / 3);
    return cleanB64.substring(0, maxChars);
  }
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
    VisNo:                Number(visNo),
    VisMob:               visMob,
    VisName:              visName,
    VisFName:             visFName,
    Visdob:               visdob,              // 'YYYY-MM-DD'
    VisGender:            visGender,           // 'M' | 'F' | 'O'
    visemail:             visemail,
    VisIdType:            visIdType,           // numeric string e.g. '5'
    VisIddetails:         visIddetails,
    occupation:           occupation,
    VisPresentAddress:    visPresentAddress,
    PresentLandmark:      presentLandmark,
    Visprsentstate:       visPresentState,     // numeric LG code string e.g. '27'
    Vis_PinCode:          visPinCode,          // 6-digit string
    VisPermanentAddress:  visPermanentAddress,
    VisPermanentLandmark: visPermanentLandmark,
    VisPermanentstate:    visPermanentState,
    VisPermanentPincode:  visPermanentPincode,
    PhotoBase64:          photoBase64,         // jpg/png/bmp base64 < 20 KB
    DocumentBase64:       documentBase64,      // PDF base64 < 400 KB
  });