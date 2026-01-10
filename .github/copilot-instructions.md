# Copilot instructions for FMPI.Ui

This file gives targeted, actionable guidance for AI coding assistants working on this Angular 17 single-page app.

- **Project type:** Angular 17 SPA. Entry points: `src/main.ts` and `src/app/app.config.ts` (router + http client providers).
- **Build / Run:** use the npm scripts in `package.json`:
  - `npm run start` — runs `ng serve --ssl true` (dev server with SSL)
  - `npm run build` — standard build
  - `npm run build-prod` — production build (uses Angular `production` configuration)
  - `npm run test` — runs Karma/Jasmine unit tests

- **API integration pattern:** API base comes from `src/environments/environment.ts` (change `apiUrl` for local testing). HTTP endpoints are composed in `src/app/services/http.service.ts` (Product and Settings controllers with action strings like `GetAllItems`, `GetProduct`, etc.). Prefer reading/using the DTOs under `src/app/models/dto/` when constructing or parsing requests/responses.

- **Routing & navigation:** routes are declared in `src/app/app.routes.ts`. Features map to `src/app/components/<feature>` (examples: `product`, `product-detail`, `product-inquiry`, `product-stock-take`). When adding routes, update `app.routes.ts` and ensure `provideRouter(routes)` remains configured in `src/app/app.config.ts`.

- **State & client-side patterns:** ephemeral UI state uses `StateService` (`src/app/services/state.service.ts`) via `BehaviorSubject`s. Use the service for cross-component communication rather than global variables.

- **Conventions to follow:**
  - Use existing DTO classes in `src/app/models/dto/` for typing API payloads and responses.
  - Services are provided in root; follow existing method signatures in `HttpService` when adding endpoints (return Observables of DTO-wrapped types).
  - Component folder names follow feature names; keep component templates/styles alongside component TS files.

- **External libraries of note:** `bootstrap`, `bootstrap-icons`, `angularx-qrcode`, `pdfmake`. Keep usage consistent with the existing styles and imports.

- **Testing:** unit tests use Karma/Jasmine. Keep tests in `*.spec.ts` next to the related component/service (existing examples under `components/*/*.spec.ts` and `services/*.spec.ts`). Run with `npm run test`.

- **Debugging tips:**
  - The dev server uses SSL by default; if troubleshooting API calls, ensure `environment.apiUrl` and browser trust for the dev certificate are handled.
  - For API contract issues, inspect `src/app/models/dto/*` and the HTTP methods in `src/app/services/http.service.ts` to match backend expectations.

- **When editing code:** prefer small, focused changes. Keep public API shapes (DTOs, service methods, route paths) stable unless a coordinated change across frontend and backend is intended.

- **Files to inspect for context/examples:**
  - `src/app/services/http.service.ts` — canonical HTTP patterns and action names
  - `src/environments/environment.ts` — API base URL configuration
  - `src/app/app.routes.ts` and `src/app/app.config.ts` — routing configuration and app providers
  - `src/app/models/dto/` — data transfer object definitions used across the app

If anything here is unclear or you want more examples (e.g., a sample PR that adds a new API call or a new route), tell me which workflow to expand and I will iterate.
