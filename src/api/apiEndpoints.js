// ─── API Base & Endpoints ─────────────────────────────────────────────────────

export const BASE_URL = 'https://Swagatam.gov.in/SuSwagatamAPI/api';

export const API_ENDPOINTS = {
  LOGIN:                     `${BASE_URL}/eVisitors/Login`,
  VERIFY_OTP:                `${BASE_URL}/eVisitors/OTPVerifyAppvisitors`,
  SEND_OTP:                  `${BASE_URL}/eVisitors/InsertAppvisitors`,
  RESEND_OTP:                `${BASE_URL}/eVisitors/ReSendOTPForVisitor`,
  CHECK_PROFILE_STATUS:      `${BASE_URL}/eVisitors/CheckAppvisitorsProfileStatus`,
  COMPLETE_PROFILE:          `${BASE_URL}/eVisitors/CompleteAppvisitorsProfile`,
  GET_STATE_OR_MINISTRY:     `${BASE_URL}/eVisitors/GetStateOrMinistry`,
  POPULATE_GOV_TYPE:         `${BASE_URL}/eVisitors/PopulateGovtype`,
  GET_BHAWAN_BY_MINISTRY:    `${BASE_URL}/eVisitors/GetBhawanByMinistry`,
  GET_OFFICER_BY_BHAWAN:     `${BASE_URL}/eVisitors/GetOfficerByBhawan`,
  INSERT_APP_VISITOR:        `${BASE_URL}/eVisitors/InsertAppVisitor`,
  GET_VISITOR_APPOINTMENTS:  `${BASE_URL}/eVisitors/GetVisitorAppointments`,
  GET_VISIT_DETAILS:         `${BASE_URL}/eVisitors/GetVisitDetails`,

  // ── Login with OTP (URL 14 & 15) ──────────────────────────────────────────
  SEND_LOGIN_OTP:            `${BASE_URL}/eVisitors/SendLoginOTP`,
  VERIFY_LOGIN_OTP:          `${BASE_URL}/eVisitors/VerifyLoginOTP`,

  // ── Cancel Visit Request (URL 16) ──────────────────────────────────────────
  CANCEL_VISIT_REQUEST:      `${BASE_URL}/eVisitors/CancelVisitRequest`,
};