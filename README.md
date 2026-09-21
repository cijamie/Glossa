# Glossa 🌐🗂️

> **The Google Translate-inspired Web Application with Multi-Engine Translation, an "Added Dictionary" Word Bank, and SuperMemo 2 (SM-2) Spaced Repetition Flashcards & Quizzes.**
>
> 🚀 **100% Serverless & Client-Side** — Designed specifically for static hosting on **GitHub Pages** with zero backend or server required!

---

## ✨ Features

### 1. 🔤 Google Translate-Styled Interface
- **Dual-Card Layout**: Familiar split-pane cards for source and translated text with Google Material 3 styling.
- **100+ World Languages**: Searchable picker modal with popular shortcuts and quick language swapping.
- **Live Auto-Translation**: Debounced translation while typing (or manual trigger).
- **Text-to-Speech Pronunciation**: Listen to both source and translated text in natural cadence using the browser's native Speech Synthesis API.
- **Phonetics & Dictionary Definitions**: Displays romanization (pinyin, romaji, IPA) and grammatical parts-of-speech definitions.
- **Copy & Star**: One-click clipboard copy and **"★ Add to Word Bank"** button with active status indicator.

### 2. 🔌 Multi-Engine Translation Support
All translation requests run directly from the browser with CORS support enabled:
- **Google Translate (Client API)**: Fast, free, zero API key required.
- **MyMemory Translated API**: Open public translation database with match quality rating.
- **LibreTranslate**: Open-source neural machine translation (public mirror or custom URL).
- **DeepL API (Optional)**: Support for personal DeepL Free or Pro API keys configured directly in user settings.
- **Auto-Fallback**: If one provider encounters a rate limit or network glitch, the app automatically fails over to the next engine seamlessly.

### 3. 📖 "Added Dictionary" Word Bank & Cookie Sync
- **One-Click Vocabulary Saving**: Save any translation directly into your personal Word Bank.
- **Cookie & LocalStorage Hybrid Sync**:
  - Session settings (`tc_source_lang`, `tc_target_lang`, `tc_engine`, `tc_word_count`, `tc_streak`) and a compact dictionary summary are saved directly to **Cookies**.
  - Complete vocabulary lists, review logs, and tags are persisted in **LocalStorage**.
- **Management & Search**: Instant filter by search term, tags, mastery level, or due status.
- **Import / Export**:
  - Export to **JSON** (full backup).
  - Export to **CSV** (Anki flashcard compatible).
  - Import existing JSON vocabulary decks.

### 4. 🧠 Systematic Spaced Repetition System (SRS)
Glossa implements the **SuperMemo 2 (SM-2)** algorithm to schedule reviews at optimal intervals for permanent retention:
- **3D Flip Note Cards (Flashcards)**:
  - Spacebar or click to flip.
  - 4 SM-2 Grading Buttons: **Again** (reset), **Hard**, **Good**, **Easy** (bonus interval).
  - Live projected intervals displayed on each button (e.g. `1 day`, `3 days`, `6 days`, `1 mo`).
  - Keyboard shortcuts (`1`, `2`, `3`, `4`).
- **Interactive Quiz Modes**:
  - **Multiple Choice**: Rapid 4-option quiz with smart distractors generated from your dictionary.
  - **Spelling & Active Recall**: Type the target word with letter hints.
- **Progress Tracking & Analytics**:
  - Daily review queue ("Due Today" counter).
  - Daily learning streak counter.
  - Visual mastery distribution bar (New, Learning, Review, Mastered).
  - Session celebration screen with fireworks!

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/glossa.git
cd glossa

# 2. Install dependencies
npm install

# 3. Start Vite dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Deploying to GitHub Pages

Because Glossa is a 100% static single-page application with relative asset paths (`base: './'`), it is ready to host on GitHub Pages:

### Option A: Automatic via GitHub Actions (Recommended)
1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Glossa"
   git branch -M main
   git remote add origin https://github.com/<your-username>/glossa.git
   git push -u origin main
   ```
2. On GitHub, go to your repository **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` will automatically build and publish your site!

### Option B: Manual Deploy using `gh-pages`
```bash
npm run deploy
```
This builds the production files and pushes them to your `gh-pages` branch. In repository Settings → Pages, select the `gh-pages` branch as the source.

---

## 🛠️ Technology Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (Google Material 3 design palette)
- **Icons**: Lucide React
- **Animations**: CSS 3D Transforms + Canvas Confetti
- **Algorithms**: SuperMemo 2 (SM-2) Spaced Repetition
- **APIs**: Google Translate Client API, MyMemory Translated API, Web Speech Synthesis
