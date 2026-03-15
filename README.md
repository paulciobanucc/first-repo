# Holiday Hunter

Holiday Hunter is a free-first MVP that searches Danish public package-holiday websites for cheap flight + hotel deals from Billund and publishes a phone-friendly dashboard that can be hosted on GitHub Pages.

The current implementation is static-first:

- React + Vite + TypeScript frontend
- Tailwind CSS dashboard
- Node + TypeScript search/report pipeline
- Playwright scraping and screenshots
- JSON files committed/generated in-repo
- GitHub Actions for scheduled runs and GitHub Pages deploy
- Optional Telegram summary if secrets are configured

## What works today

- Typed normalized deal model with Zod validation
- Transparent rule-based scoring with Greece boost
- Static dashboard with mobile-friendly filters
- Search pipeline that tolerates source failures
- `afbudsrejser.dk` implemented as the first real adapter
- `travelmarket.dk` and `tui.dk` scaffolded with documented blockers instead of fake scraping
- Report generation to JSON and Markdown
- GitHub Actions for scheduled/manual search and Pages deployment

## Current source status

- `afbudsrejser.dk`: working end-to-end via its public charter search page
- `travelmarket.dk`: partial blocker only; public package pages linked from the homepage returned 404 responses during headless verification
- `tui.dk`: partial skeleton only

## Local setup on Windows

Prerequisites:

- Node.js 20+
- npm
- VS Code

Install dependencies:

```powershell
npm install
```

If PowerShell blocks `npm` because of local execution policy, use:

```powershell
npm.cmd install
```

Install the Playwright browser used by the scraper:

```powershell
npx playwright install chromium
```

Run the local dashboard in dev mode:

```powershell
npm run dev
```

Run one local search:

```powershell
npm run search
npm run report
npm run site-data
```

Build the static site locally:

```powershell
npm run build
```

Preview the production build:

```powershell
npm run preview
```

Lint and test:

```powershell
npm run lint
npm run test
```

## npm scripts

- `npm run dev`: start the Vite dev server
- `npm run build`: regenerate public JSON and build the static site
- `npm run preview`: preview the production build locally
- `npm run lint`: run ESLint
- `npm run test`: run unit/integration tests with Vitest
- `npm run search`: run source adapters and generate `data/latest.json`
- `npm run report`: generate Markdown/JSON report buckets
- `npm run site-data`: copy generated data into `public/data`

## GitHub Pages deployment

`deploy-pages.yml` builds the Vite app and deploys `dist/` to GitHub Pages.

Important notes:

- The workflow sets `VITE_BASE_PATH` to `/${repo-name}/` so asset paths work on GitHub Pages project sites.
- In GitHub repo settings, set Pages to use GitHub Actions as the source.
- The site is static and reads generated JSON from `public/data`.

## GitHub Actions scheduling

There are separate workflows for scheduled and manual search runs:

- `.github/workflows/scheduled-search.yml`
- `.github/workflows/manual-search.yml`

The scheduled workflow runs on Monday and Thursday at `06:15 UTC`.

Important:

- GitHub Actions cron uses UTC, not Europe/Copenhagen local time.
- Because Denmark observes DST, the local run time will shift by one hour across the year.

The search workflows:

1. install dependencies
2. install the Playwright Chromium browser
3. run `search`, `report`, and `site-data`
4. commit generated `data/`, `public/data/`, and `public/screenshots/` back to the repo

That follow-up push triggers the Pages deployment workflow on `main`.

## Optional Telegram notification

Telegram is disabled by default. If you want summary messages, add these repository secrets:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

If those secrets are missing, the pipeline skips notifications cleanly and still generates site data.

## Project structure

```text
src/
  app/
  components/
  lib/
    scoring/
    types/
    utils/
scripts/
sources/
  base/
  travelmarket/
  afbudsrejser/
  tui/
data/
public/
  data/
  screenshots/
.github/workflows/
tests/
```

## Known limitations

- `travelmarket.dk` extraction uses resilient heuristics, but public travel sites change frequently.
- `afbudsrejser.dk` is the only live source in this MVP; it is still dependent on the public DOM staying reasonably stable.
- The MVP intentionally avoids logins, CAPTCHA bypassing, hidden APIs, bookings, and any non-public data.
- If a field cannot be extracted reliably, it is left missing instead of guessed.
- `travelmarket.dk` and `tui.dk` are not live yet because deterministic public extraction was not verified.
- No hosted backend or database is used in this version.

## Ethical and legal scraping notes

- Only scrape public pages and public search results.
- Do not log in, bypass anti-bot protections, or automate bookings.
- Treat all scraped content as untrusted input.
- Fail safely when a source breaks instead of inventing or guessing travel data.

## What to configure on GitHub

1. Push this repo to GitHub.
2. In repository settings, enable GitHub Pages with GitHub Actions.
3. Ensure the default branch is `main` or update the deploy workflow branch filter.
4. Optionally add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` as secrets.

## Suggested first local commands

```powershell
npm install
npx playwright install chromium
npm run search
npm run report
npm run site-data
npm run test
npm run lint
npm run build
```
