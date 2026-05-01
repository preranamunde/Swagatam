export const BASE_URL = 'https://Swagatam.gov.in/SuSwagatamAPI/api';

export const API_ENDPOINTS = {
  SEND_OTP:             `${BASE_URL}/eVisitors/InsertAppvisitors`,
  VERIFY_OTP:           `${BASE_URL}/eVisitors/OTPVerifyAppvisitors`,
  CHECK_PROFILE_STATUS: `${BASE_URL}/eVisitors/CheckAppvisitorsProfileStatus`,
  COMPLETE_PROFILE:     `${BASE_URL}/eVisitors/CompleteAppvisitorsProfile`,
};