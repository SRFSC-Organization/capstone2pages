# SRFSC backend connections

| Feature | Local service | Production configuration |
| --- | --- | --- |
| Member sign-in, profile, interest quiz | Sibling `SRFSC-Backend` on `http://localhost:8587` | `srfsc_account_api_url` in `_config.yml` |
| Council events, reports, volunteer forms | `srfsc_backend/` on `http://localhost:8599` | `SRFSC_PRODUCTION_API` in `js/srfscConfig.js` |

The shared Open Coding Society account service currently returns 404 for SRFSC
profile and quiz routes. Member requests must use the deployed SRFSC backend.
An empty production account URL disables member requests.

## Connect member accounts

1. Follow the sibling `SRFSC-Backend/README.md` to migrate profile storage and
   start the account service without resetting existing accounts.
2. Deploy that backend behind HTTPS. Set `srfsc_account_api_url` to its origin
   (scheme and host, without `/api` or a trailing slash).
3. Allow the frontend origin in both Flask and nginx CORS rules. For this
   repository's GitHub Pages site it is `https://srfsc-organization.github.io`,
   without the repository path. Credentialed responses must return this origin
   and `Access-Control-Allow-Credentials: true`. Preflight must allow
   `Content-Type` and `X-Origin` headers and the requested method.
4. Check the production authentication cookie domain in `api/user.py` in the
   backend: it currently uses `.opencodingsociety.com`, which needs adjustment
   if the backend is deployed outside that domain.
5. Rebuild and redeploy the frontend after changing `_config.yml`.

## Local login

Start `./run_backend.sh` in the sibling `SRFSC-Backend` checkout. It prepares
account storage without resetting data, then serves port 8587. The login page
checks `GET /api/login` before enabling password submission. `POST /api/login`
verifies credentials and sets the existing JWT cookie; `GET /api/login/me`
returns the signed-in user, and `DELETE /api/login` signs out. These resources
follow the Flask Blueprint/Api/Resource structure used by `/api/jokes`.
The local account hostname matches the frontend hostname so cookies also work
when opening the frontend through `127.0.0.1`.

## Verify the deployment

- `GET /api/srfsc/quiz` returns the questionnaire as JSON.
- Unauthenticated `GET /api/srfsc/profile` returns 401 with credentialed CORS
  headers, rather than 404 or HTML.
- Preflight for `POST /api/login` and `PUT /api/srfsc/profile` allows the
  frontend origin, request method, and headers.
- Sign in using a verified account, confirm the browser accepts the
  authentication cookie, then save and reload the profile.

Frontend tests: `node --test tests/test_srfsc_member.mjs`.
Backend tests, from its checkout:
`venv/bin/python -B -m unittest testing.test_srfsc_profile -v`.
