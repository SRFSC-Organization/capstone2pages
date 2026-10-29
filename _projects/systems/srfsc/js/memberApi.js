// Account requests use the Flask backend, independently of the council events service.
import { srfscAccountURI, fetchOptions } from '../../api/config.js';

export class MemberApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function memberRequest(path, { method = 'GET', body, expectJson = true } = {}) {
  if (!srfscAccountURI) {
    throw new MemberApiError('Member sign-in is not available on this site yet. Please contact the council.', 0);
  }
  let response;
  try {
    response = await fetch(`${srfscAccountURI}${path}`, {
      ...fetchOptions, method,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new MemberApiError('Cannot connect to member login. Please try connecting again.', 0);
  }
  if (response.ok && !expectJson) return {};
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 404 && !data?.message) {
      throw new MemberApiError('Member accounts are not available on this server yet. Please contact the council.', 404);
    }
    throw new MemberApiError(data?.message || `Request failed (${response.status}).`, response.status);
  }
  if (!data || typeof data !== 'object') {
    throw new MemberApiError('The account service returned an unexpected response.', response.status);
  }
  return data;
}

export const loginMember = (credentials) => memberRequest('/api/login', { method: 'POST', body: credentials });
export const logoutMember = () => memberRequest('/api/login', { method: 'DELETE', expectJson: false });
export const loadMemberProfile = () => memberRequest('/api/srfsc/profile');
export const loadInterestQuiz = () => memberRequest('/api/srfsc/quiz');
export const saveMemberProfile = (profile) => memberRequest('/api/srfsc/profile', { method: 'PUT', body: profile });

// Like GET /api/jokes, this confirms the Flask resource is reachable before POSTing.
export async function checkLoginService() {
  const service = await memberRequest('/api/login');
  if (service.service !== 'srfsc-accounts' || service.status !== 'ready') {
    throw new MemberApiError('This server does not provide SRFSC member login.', 503);
  }
  return service;
}
