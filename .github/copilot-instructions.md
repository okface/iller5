# Copilot instructions (Iller5)

## Big picture
- This is a static Vue 3 + Vite app with Tailwind styling; there is no backend.
- App state is centralized in the Pinia store [src/stores/study.js](../src/stores/study.js) and the UI is a simple view switch (`dashboard`/`quiz`) in [src/App.vue](../src/App.vue).
- Study content is authored as YAML under `data/` and bundled into `public/content.json` (served as `content.json`) by `python scripts/bundle.py`.

## Content/data pipeline
- Source of truth: `data/<subject>/<topic>.yaml` (e.g. `data/medical_exam/neurologi.yaml`).
- Bundling: `scripts/bundle.py` recursively loads `data/**/*.y{a,}ml`, skips `incorrectly_formatted_questions/`, and adds `source: "<subject>/<topic>"` to every question before writing `public/content.json`.
- Runtime loading: `store.loadContent()` fetches `content.json` using `import.meta.env.BASE_URL` (important because Vite is configured with `base: '/iller5/'` for GitHub Pages).

## Question schema used by the app
- A YAML file is a list of question objects. The quiz UI expects at least: `id`, `tags[]`, `question`, `options[]` (each with `text`, `correct`, `feedback`), `explanation`, and optional `image`.
- `image` is either `null` or a string path usable in `<img :src>`; images are expected to live under `public/assets/` and are typically referenced as `assets/<filename>`.

## Study logic (SRS)
- Progress is browser-only in `localStorage` via VueUse `useStorage('iller5-progress', {})`.
- Buckets are a lightweight SRS system in [src/stores/study.js](../src/stores/study.js):
  - New cards or last-wrong → Bucket A
  - Correct streak promotes A → B → C; wrong answer resets to A
  - Session sampling is weighted 70% A / 20% B / 10% C (`selectQuestionsSRS`).
- Note: the "Worst" button exists in the dashboard UI, but there is currently no implemented stats-based category selection in the store.

## Developer workflows (what to run)
- Install + dev server: `npm install` then `npm run dev`.
- Bundle YAML → JSON locally: `python scripts/bundle.py` (writes `public/content.json`).
- Deploy: `./deploy.ps1 "message"` runs the bundler, then `git add/commit/push`.
- CI/CD: on push to `main`, GitHub Actions runs the bundler, then `npm ci` + `npm run build`, and deploys `dist/` (see `.github/workflows/deploy.yml`).

## Local content generation scripts (OpenAI)
- `scripts/generate.py` is an interactive generator that appends new questions to a selected YAML file using OpenAI Structured Outputs (strict JSON schema) and expects `OPENAI_API_KEY` to be set.
- `scripts/migrate.py` is a one-off migrator from `data/medical_exam/incorrectly_formatted_questions/questions.yaml` into per-topic YAML files.

## When changing things
- If you move/rename the bundled JSON, update both `scripts/bundle.py` (output path) and `store.loadContent()` (fetch path).
- If you change question fields, update the YAML generator and the quiz renderer together; `Quiz.vue` relies on `options[*].feedback` and always shows `explanation` after answering.
