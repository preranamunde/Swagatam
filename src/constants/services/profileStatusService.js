import { API_ENDPOINTS } from '../../api/apiEndpoints';
import { callSwagatamAPI } from './visitorloginservice';

export const checkProfileStatus = async (visNo) => {
  if (!visNo) {
    console.warn('checkProfileStatus: visNo is empty, treating as incomplete');
    return false;
  }

  const result = await callSwagatamAPI(
    API_ENDPOINTS.CHECK_PROFILE_STATUS,
    { VisNo: visNo },
  );

  const data   = Array.isArray(result) ? result : [result];
  const status = (data?.[0]?.Result ?? '').toLowerCase().trim();

  console.log('Profile status raw:', data?.[0]?.Result);

  // ✅ FIX: "Profile INCOMPLETE" also contains "complete"
  // so we must explicitly exclude "incomplete"
  return status.includes('complete') && !status.includes('incomplete');
};