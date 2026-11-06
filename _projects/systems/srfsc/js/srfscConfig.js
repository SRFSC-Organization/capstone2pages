// ============================================
// srfscConfig.js
// RESPONSIBILITY: Where the SRFSC council API (events, volunteers, hazard reports, map) lives.
// It is served by SRFSC-Backend, the same server as member accounts, so it shares the
// address set by `srfsc_account_api_url` in _config.yml (localhost:8587 when developing).
// ============================================
import { srfscAccountURI } from '../../api/config.js';

/** Base URL for /api/srfsc, or '' when no backend is configured for this site (offline mode). */
export const SRFSC_API_ORIGIN = srfscAccountURI || '';
