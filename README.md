# JD-Resume — Tailor Your Resume to Any Job Description

Upload your resume (PDF) + paste a job description → AI structures and rewrites
it to match the role → edit the result live → download a clean, ATS-friendly PDF.

## How it works

1. **Upload** a PDF resume — text is extracted in your browser, then AI structures
   it into sections (experience, skills, education, projects).
2. **Paste** the target job description and hit **Tailor Resume with AI** —
   summary, bullet points, and skills get rewritten around the JD's keywords
   (no facts invented).
3. **Edit** anything in the resume editor; the preview updates live.
4. **Download** the final PDF (real selectable text, ATS-parseable).

If AI extraction fails, a **Retry AI Extraction** button re-sends the request.
Your keystrokes never leave the page except for the two AI calls above.

## Prerequisites

- **Node.js 20+** (`node -v` to check) and `npm`.
- An API key from **one** of the supported providers (see below). The app runs
  keyless otherwise — every AI call just asks for a key.

## Setup (local)

```bash
git clone <your-repo-url>
cd jd-resume
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Add your API key (pick one option)

**Option A — paste it in the UI (easiest).**
Click the **key icon** (top-right of the left panel), choose your provider tab
(**Gemini** (Default) / **Muse Spark** / **OpenRouter**), paste the key, Save.
It's kept in your browser only and sent with each AI request — never stored
on the server. Each provider remembers its own key when you switch tabs.

**Option B — `.env.local` (local dev).**
Create a file named `.env.local` in the project root with the key for the
provider you use:

```bash
# Pick the line(s) you need:
AI_API_KEY=...            # generic, works for any provider
GEMINI_API_KEY=...        # Gemini fallback
MUSE_SPARK_API_KEY=...    # Muse Spark
OPENROUTER_API_KEY=...    # OpenRouter
```

Restart `npm run dev` after creating/editing `.env.local`. A key pasted in
the UI always takes precedence over env vars.

### Where to get a key

| Provider  | Get a key |
| --------- | --------- |
| Gemini    | [Google AI Studio](https://aistudio.google.com/app/apikey) (free, no credit card) |
| OpenRouter| [OpenRouter keys](https://openrouter.ai/keys) (free-tier models supported) |
| Muse Spark| Your Muse Spark console (wiring in progress — see note below) |

## Using the app

1. **Upload Resume (PDF)** — wait for "Extracted with AI". If it fails, the
   banner turns red with a **Retry AI Extraction** button.
2. **Target Job Description** — paste the responsibilities/requirements.
3. **Tailor Resume with AI** — review the status message, then switch to the
   **Edit Resume** tab to fine-tune any section (entries can be added/removed).
4. **Download** the PDF from the preview panel.

## Notes & limits

- **Muse Spark is not wired up yet** — selecting it returns a clear "not wired
  up" error until its SDK is implemented (`lib/providers/museSparkProvider.ts`).
- **OpenRouter** uses strict structured output across a free-model fallback
  chain. Free models can rate-limit or go offline; failures show in the status
  banner and the terminal log has the details.
- **Deploying (e.g. Vercel):** no keys needed in the deploy — visitors plug in
  their own key in the UI (bring-your-own-key). Nothing is logged or persisted
  server-side.
- `npm run build` / `npm start` for a production build; `npm run lint`
  (Biome) to check code style.

## Troubleshooting

| Symptom | Fix |
| ------- | --- |
| "API key required" banner / key modal pops up | No key found — paste one in the UI or set it in `.env.local` (restart dev server after) |
| Extraction failed, red banner | Use **Retry AI Extraction**; check the terminal for the API error |
| Changed `.env.local`, still "no key" | Restart `npm run dev` — env files load at startup |
| PDF degree line repeats ("X in X") | Fixed automatically; re-upload or retry extraction for old data |
