// Account requests use the Flask backend, independently of the council events service.
import { srfscAccountURI, fetchOptions } from '../../api/config.js';

const COUNCIL_CONTACT = 'call 858-201-3711 or email srfiresafecouncil@gmail.com';

export class MemberApiError extends Error {
  /** @param {boolean} offline true when the account service itself is unavailable, not this request */
  constructor(message, status, offline = false) {
    super(message);
    this.status = status;
    this.offline = offline;
  }
}

export async function memberRequest(path, { method = 'GET', body, expectJson = true } = {}) {
  if (!srfscAccountURI) {
    throw new MemberApiError(
      `Member sign-in and online requests are not available on this site yet. Please ${COUNCIL_CONTACT}.`, 0, true);
  }
  let response;
  try {
    response = await fetch(`${srfscAccountURI}${path}`, {
      ...fetchOptions, method,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new MemberApiError(`Cannot connect to the council's account service. Please try again, or ${COUNCIL_CONTACT}.`, 0, true);
  }
  if (response.ok && !expectJson) return {};
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 404 && !data?.message) {
      throw new MemberApiError(`Member accounts are not available on this server yet. Please ${COUNCIL_CONTACT}.`, 404, true);
    }
    throw new MemberApiError(data?.message || `Request failed (${response.status}).`, response.status);
  }
  if (!data || typeof data !== 'object') {
    throw new MemberApiError('The account service returned an unexpected response.', response.status);
  }
  return data;
}

export const signupMember = (account) => memberRequest('/api/srfsc/signup', { method: 'POST', body: account });
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

// Council request survey: anyone can submit; only council Admin accounts can review.
export const loadRequestOptions = () => memberRequest('/api/srfsc/requests/options');
export const submitCouncilRequest = (survey) => memberRequest('/api/srfsc/requests', { method: 'POST', body: survey });
export const loadCouncilRequests = (status = '') =>
  memberRequest(`/api/srfsc/requests${status ? `?status=${encodeURIComponent(status)}` : ''}`);
export const reviewCouncilRequest = (id, review) =>
  memberRequest(`/api/srfsc/requests/${id}`, { method: 'PUT', body: review });
