<!-- 
NOTE: This file serves as the English documentation and explanation for `AGENTS.md` (which is maintained in Chinese to maximize token efficiency and context retention). Any updates or new rules added to `AGENTS.md` must also be translated and updated in this file.
-->

# Agent Programming Guidelines

## Core Principles

### Single Responsibility Principle (SRP)

* Every function, class, and module should have one clear reason to change.
* Avoid "god functions" that handle multiple concerns.
* If you describe a function with "and", it likely violates SRP.
* Prefer composition over large multi-purpose units.

### Simplicity over Cleverness

* Prefer readable code over "clever" abstractions.
* Avoid premature optimization.
* If a junior engineer can’t understand it in 30 seconds → simplify.

### Explicit Over Implicit

* Make dependencies visible.
* Avoid hidden state changes.
* Avoid "magic behavior" (implicit globals, side effects).
* Isolate I/O, network, and filesystem operations where possible.

## Architecture Rules

### Separation of Concerns

Split logic into clear layers:

* UI / interface layer
* Business logic layer
* Data / persistence layer
* Utility/helpers (pure functions)
**Agent rule:** Never mix data access with business logic unless explicitly justified.

### Feature-based Modularity

* Prefer modular files over large monoliths.
* Keep file sizes reasonable (soft rule: <300–500 lines).
* Group by feature, not by type (often better for scaling systems).
* Prefer modular monolith over microservices unless scale demands it.

## System-Specific Rules

### Ecosystem & Tooling Defaults

* **Prioritize SASS:** Use SASS (`.scss`) for styling instead of standard CSS or inline styles.
* **SASS compatibility:** The current Jekyll build uses Ruby Sass. Use `rgba(0, 0, 0, 0.15)` for transparent colors, not unsupported `rgb(0 0 0 / 15%)` syntax. Validate through the Makefile's Jekyll build.
* **Use `_projects`:** Leverage the modular project auto-registration system in the `_projects/` directory for new projects.
* **System Expansion:** Work within the existing systems and expand them if needed, rather than creating completely new parallel architectures.
* **Calendar pages:** Keep layout and modal styling out of `navigation/calendar.md`; use semantic classes and SCSS instead of utility-heavy inline markup.
* **Cross-origin APIs:** Spring endpoints consumed from `pages.opencodingsociety.com` should explicitly allow credentialed cross-origin requests.
* **Documentation:** Create detailed documentation for difficult or complex implementations as necessary.
* **Commenting:** Add comments for non-trivial logic, but keep them minimal and focused on *why* rather than *what*.
* **Ask Questions:** If system-level constraints, requirements, or patterns are unclear, pause and ask the user questions before proceeding.

### Project Workflow

* **Deployment runtime:** The Jekyll GitHub Actions build pins `ubuntu-24.04` and Ruby `4.0` to match the current Bundler 4 lockfile. Validate the runner, Ruby, and Bundler together when upgrading; do not pair Ruby 3.1 with `ubuntu-latest` (Ubuntu 26.04 has no matching prebuilt Ruby).

* Treat [Makefile](Makefile) as the single source of truth; common targets are `make`/`make serve-current`, `make dev`, `make stop`, `make convert`, and `make convert-single` (details in [README.md](README.md)).
* Order matters: stop → build projects → convert notebooks/docx → split courses → jekyll serve (follow [Makefile](Makefile)).
* Project builds must run the [SASS import generator](scripts/generate_sass_imports.py) to create `_sass/projects/_all.scss`; `build-registered-projects` owns this dependency so Jekyll can resolve `projects/all`.
* Use template-generated project Makefiles. Do not add local npm manifests, `.gitignore` files or Makefile overrides for shared browser libraries. Keep shared runtime libraries in `assets/js/vendor/` with licenses and version documentation; ordinary builds need no npm installation.

### Sources vs Generated Files

* Sources live in [notebook sources](_notebooks/) and [docx sources](_docx/); converted Markdown is written to [generated posts](_posts/) (generated, do not hand-edit).
* Course-split outputs (`*_csp.md`/`*_csa.md`/`*_csse.md`/`*_content.md`) are generated; never edit them. See [scripts/split_multi_course_files.py](scripts/split_multi_course_files.py).
* Conversion behavior is defined in [scripts/convert_notebooks.py](scripts/convert_notebooks.py) and [scripts/convert_docx.py](scripts/convert_docx.py).
* GameBuilder lesson notebooks are authored in [_projects/systems/gamebuilder/notebooks/](_projects/systems/gamebuilder/notebooks/); `_notebooks/projects/gamebuilder/` contains build copies. Project Makefiles are generated from [_projects/_template/Makefile](_projects/_template/Makefile), so persistent build/watch fixes belong in the template. Use a subshell for `cd` inside conversion loops so processing several notebooks does not change the loop's working directory.

### Project Registry & Styling

* New projects must follow [_projects/REGISTRATION.md](_projects/REGISTRATION.md); architecture reference in [_projects/ARCHITECTURE.md](_projects/ARCHITECTURE.md).
* Use SCSS-first styling; theme and styling conventions are in [README.md](README.md).

### Backend Boundary

* **SRFSC accounts:** Login, profiles, and the interest quiz use the sibling `SRFSC-Backend` repository (local port 8490; production `https://srfsc-api.opencodingsociety.com`; Socket.IO on 8491). Set the production origin explicitly with `srfsc_account_api_url` in `_config.yml`; never fall back to the shared OCS service, which lacks the SRFSC routes. Events, the calendar and map, hazard reports, and volunteer forms are served by the same `SRFSC-Backend` (`/api/srfsc/...`); the old in-repo `srfsc_backend/` service was retired. Verify credentialed CORS in nginx/Flask and the authentication cookie domain when deploying.
* **Site domain:** This repository is published at the root of `srfsc.opencodingsociety.com`. The GitHub Pages custom domain is set in the repo's Settings → Pages; the `CNAME` file has no effect with Actions deploys. The deploy workflow therefore uses an empty `baseurl` for this repository, and the SRFSC app home (`_projects/systems/srfsc/index.md`) has permalink `/`. Its subpages stay under `/capstone/srfsc/app/...` so they do not collide with the template's `/login`, `/signup`, and `/profile`; the root `index.md` forwards old `/capstone/srfsc/app/` links to the home page.
* **Site navigation:** When `srfsc_navigation.header_links` is set in `_config.yml`, `_includes/themes/minima/header.html` replaces the OCS `minima.nav_pages` links and Login with those few SRFSC links plus "Sign in" (to the SRFSC login page), and skips the OCS `login.js` and `dm-notifications.js`. The full link list is drawn by the council nav (`placement: sidebar` or `top`). With `placement: top` and `replace_site_header: true`, the council bar replaces the OCS site header on SRFSC pages (main.scss hides `.site-header` when `.srfsc-nav--replaces-header` is present) and carries its own Sign in; otherwise the council nav leaves Sign in to the header. The header's link is `#srfsc-header-account` and the nav's is `#srfsc-nav-account`; `srfscNav.js` swaps "Sign in" for "My profile" on every link with `data-profile-url`. The header Login button keeps the OCS `#loginArea` look (label from `account.header_title`, default Login) but opens the SRFSC login page. With `placement: sidebar`, the "On this page" list (`sections`) is drawn inside the council sidebar menu, under the council links, so both share one column. The live site uses `placement: header`: no council nav is drawn, the left sidebar is only the page's own "On this page" list, and Request Help, About and Community are reached from the footer. Top left of the header: `srfsc_navigation.logo` shows that image when set; otherwise the SRFSC text mark (▲ + brand + tagline) replaces the OCS logo.
* **SRFSC settings and preferences:** Signed in, `srfscNav.js` shows the member's initial and name in the header `#loginArea`, linking to `account.settings_path` (`/capstone/srfsc/app/settings/`). That page (`navigation/settings.md`, `srfscSettings.js`) changes the display name (the account service saves it only together with the quiz answers, so members who have not finished the quiz are sent to My profile) and holds the OCS preferences panel (`navigation/srfsc-preferences.html`). `js/preferences.js` and `js/preferences-layout.js` are unchanged copies of Open-Coding-Society/pages `assets/js/pages/dashboard/` (commit 5755dc3), and `assets/js/user-preferences.js` is that commit's site-wide engine; update by copying again. The OCS Spring calls are stubbed, so preferences live in localStorage only; "Create with AI" is left out (it needs `/api/user/ai-theme`). Keep every element id in the panel: `preferences.js` reads them by id. The language menu is built by `srfscSettings.js` from `SitePreferences.LANGUAGES` in `assets/js/user-preferences.js` (local change to the upstream copy): every Google Translate page-widget language (189). That list is also the widget's `includedLanguages`, so a code missing from it is silently ignored. Hebrew must be `iw` (the widget ignores `he`; a saved `he` is mapped to `iw`). Under a saved theme the engine forces text colors on every heading, paragraph, span and div, so `sass/_theme-bridge.scss` moves the council surfaces onto `--panel` / `--ui-bg` / `--ui-border` and keeps photo areas light-on-dark.

* The backend service lives under [node_backend/README.md](node_backend/README.md) and is separate from the site build pipeline; read it before making backend changes.

## Coding Standards

### Naming Conventions

Names should:

* Explain *intent*, not implementation.
* Avoid abbreviations unless standard.
* Be consistent across the codebase.
* Example: Use `normalizeUserTransactionData()` instead of `procData2()`.

### Error Handling

* **Fail Fast:** Validate inputs early, raise errors immediately with clear messages, and don't silently ignore failures.
* **Defensive Programming:** Assume inputs are invalid or malicious, add guards for edge cases, and never trust external data sources.
* **Discipline:** Never swallow exceptions silently. Always include context in errors and use typed/custom errors where appropriate.

### Logging Rules

* Log meaningful events, not noise.
* Logs should answer: *what happened and why?*
* Avoid logging sensitive data.

## Testing Rules

### Behavior-driven Tests

* Tests should describe behavior, not implementation.
* Every critical logic path should be testable.
* Prefer unit tests for logic, integration tests for flows.

### Critical Path Coverage Required

* **Agent rule:** If code changes behavior, update or add tests.
* Ensure deterministic behavior (avoid randomness unless explicitly required, fix seeds when needed).

## Agent Behavior Rules

### Plan Before Coding

* For non-trivial tasks: write a short plan before coding.
* Break into steps before implementation.

### Minimize Diffs

* Prefer minimal diffs over refactors unless required.
* Don’t rewrite working code without reason.

### Follow Existing Patterns

* Match existing codebase style and structure.
* Don’t introduce new architecture unless necessary.
* **Verify Assumptions:** If unclear, infer cautiously and flag assumptions. Never silently guess critical requirements.

### Self-Updating and Continuous Learning

* **Update this file:** As you iterate, make mistakes, and learn new system patterns or constraints, actively update `AGENTS.md` (and its optimized counterpart) with important notes so the system improves over time.

## Anti-Patterns

### God Functions

* Avoid functions that do too many things. Stick to SRP.

### Hidden Side Effects

* Ensure predictability by keeping side effects explicit and well-documented.

### Over-engineering

* **YAGNI (You Aren’t Gonna Need It):** Don’t build features unless required now. Avoid speculative generalization.
* Optimize only after correctness is guaranteed (Profile before optimizing).
