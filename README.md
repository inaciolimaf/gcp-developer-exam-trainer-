# Cloud Quest — GCP Professional Cloud Developer Exam Trainer

A playful, gamified web app for drilling the **Google Cloud Professional Cloud Developer (PCD)**
exam. Practice **741 questions** in several modes, take timed mock exams, and follow a data-driven
**study guide** with its own completion checklist — all wrapped in a dark "Midnight Neon" UI with
confetti, XP, streaks and badges.

> Keywords: Google Cloud, GCP, Professional Cloud Developer, PCD, certification, exam practice,
> practice questions, quiz, mock exam, study guide.

100% client-side. No backend, no accounts — progress is saved in your browser's `localStorage`.

---

## ✨ Features

- **7 study modes**
  - **Random Blitz** — endless shuffled questions with instant feedback
  - **Mock Exam** — timed simulation (90s/question, 70% pass mark), free navigation, score + review
  - **Question List** — walk the full bank in order
  - **By Topic** — drill a single service (GKE, Pub/Sub, IAM, Cloud Run…)
  - **By Exam Domain** — focus on one of the four exam sections (S1–S4)
  - **By Course Module** — match questions to the 36 course modules
  - **Study the Gaps** — only the topics the course covers lightly
- **Instant feedback** with the correct answer, full explanation, and the course modules that teach it
- **Study Guide** — what actually gets tested vs. what the course teaches, gaps, a module roadmap and a
  lecture-by-lecture table — with a **per-lecture / per-module completion checklist** and progress bar
- **Gamification** — XP, levels, win streaks, unlockable badges, and confetti 🎉
- **Local progress** — quiz history and guide checklist persist in `localStorage`

## 🧱 Tech stack

React 18 · Vite 5 · Tailwind CSS 3 · Framer Motion · canvas-confetti · marked · lucide-react.
Builds to fully static files — deployable anywhere.

## 📂 Repository layout

```
.
├── all_questions.json                 # Canonical question bank (741 questions, source of truth)
├── all_questions.backup_pre_enrich.json
├── README.md
└── cloud-quest/                        # The web app (deploy this folder)
    ├── public/
    │   ├── all_questions.json          # Copy the app fetches at runtime
    │   └── study_guide.md              # Study guide (rendered in-app)
    ├── src/                            # React components & libs
    ├── package.json
    └── vite.config.js
```

> The app reads `cloud-quest/public/all_questions.json`. The root `all_questions.json` is the
> canonical dataset; if you regenerate it, copy it into `cloud-quest/public/`.

## 🚀 Run locally

```bash
cd cloud-quest
npm install
npm run dev        # http://localhost:5173
```

## 📦 Build

```bash
cd cloud-quest
npm run build      # outputs static files to cloud-quest/dist
npm run preview    # preview the production build
```

## 🌐 Deploy

The app is static. On **Vercel** or **Netlify**, connect this repo and set the
**Root Directory** to `cloud-quest` (Vite is auto-detected; build = `npm run build`, output = `dist`).
For **GitHub Pages**, publish `cloud-quest/dist` (the Vite `base` is already `./`, so it works from a
subpath).

## 🗃️ Data schema

Each entry in `all_questions.json` includes:

| Field | Meaning |
|---|---|
| `question`, `options`, `correct_answer`, `correct_text` | The question and answers |
| `explanation` | Why the correct answer is right |
| `topics` | `primary`/`all` service tags + `exam_domain` (S1–S4) |
| `course_reference` | Matching course modules, best lectures, coverage level |

## 📝 Notes

Questions were rewritten to be legally distinct from their sources while preserving the concept being
tested; the study guide is an automated analysis cross-referencing the question bank against the course
curriculum. For **personal study use**.
