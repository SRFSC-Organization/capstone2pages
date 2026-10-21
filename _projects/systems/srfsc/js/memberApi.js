// Account requests use the Flask backend, independently of the council events service.
import { pythonURI, fetchOptions } from '../../api/config.js';

export class MemberApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function memberRequest(path, { method = 'GET', body, expectJson = true } = {}) {
  let response;
  try {
    response = await fetch(`${pythonURI}${path}`, {
      ...fetchOptions, method,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new MemberApiError('Unable to reach the account service. Check your connection and try again.', 0);
  }
  if (response.ok && !expectJson) return {};
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new MemberApiError(data?.message || `Request failed (${response.status}).`, response.status);
  }
  if (!data || typeof data !== 'object') {
    throw new MemberApiError('The account service returned an unexpected response.', response.status);
  }
  return data;
}

export const loginMember = (credentials) => memberRequest('/api/authenticate', { method: 'POST', body: credentials });
export const logoutMember = () => memberRequest('/api/authenticate', { method: 'DELETE', expectJson: false });
export const loadMemberProfile = () => memberRequest('/api/srfsc/profile');
export const loadInterestQuiz = () => memberRequest('/api/srfsc/quiz');
export const saveMemberProfile = (profile) => memberRequest('/api/srfsc/profile', { method: 'PUT', body: profile });
