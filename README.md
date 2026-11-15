# EduUp

**Learn CS faster: curated playlists, AI-reviewed practice, and a streak that keeps you going.**

EduUp is a full-stack learning platform for Computer Science students. Instead of searching YouTube for hours, a student picks a subject and topic, gets curated playlists, and then practises with AI-generated questions. MCQs are graded instantly, and coding answers get a detailed AI review.

**Live demo:** https://ridhijain24-eduup.ridhi-dev.workers.dev
**Demo video:** _add your YouTube link here_

> The backend runs on a free hosting plan and sleeps when idle, so the very first request after a while can take up to a minute.

<!-- Add 3-4 screenshots in docs/screenshots/ and link them here, for example:
![Dashboard](docs/screenshots/dashboard.png)
-->

---

## Features

**Learn**
- Topic explorer with 10 subjects (DSA, DBMS, System Design, OOP, OS, Networks, Web Dev, ML, Aptitude, Computer Architecture) and around 73 sub-topics
- Live playlist search through the YouTube Data API, so any topic works without manual curation

**Practise**
- About 6,000 AI-generated questions, grouped into assignment sets of 20 per sub-topic
- MCQs are graded instantly, with AI-generated explanations that are cached after the first request
- Coding questions are reviewed by an LLM: score, strengths, improvements, time complexity and a suggested approach, in any programming language

**Stay consistent**
- Real streak tracking, weekly activity chart, recent AI feedback and unlockable badges
- A different dashboard for new learners (empty states) and returning learners
- Study timer with custom session length and hydration reminders
- Break-time mini games (Word Scramble, Quick Quiz, Memory Match) with best scores

**Stay updated**
- "What's happening in tech" feed built from public RSS feeds and Hacker News, refreshed every 30 minutes, with category filters and a full `/news` page

**Product basics**
- JWT authentication, protected routes, responsive UI, Privacy / Terms / Cookies pages

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, TanStack Start / Router, TanStack Query, Tailwind CSS, shadcn/ui (Radix), Vite |
| Backend | Node.js, Express |
| Database | PostgreSQL on Neon, Prisma ORM |
| Auth | JWT, bcrypt password hashing |
| AI | Google Gemini API (question generation, code review, explanations) |
| External APIs | YouTube Data API v3, RSS feeds, Hacker News API |
| Hosting | Cloudflare Workers (frontend), Render (backend), Neon (database) |

## Architecture

```
Browser ──▶ Cloudflare Worker (React / TanStack Start)
               │  REST + JWT
               ▼
           Express API on Render ──▶ Neon PostgreSQL (Prisma)
               │
               ├──▶ Gemini API        (code review, explanations)
               ├──▶ YouTube Data API  (playlist search, cached 1 hour)
               └──▶ RSS / Hacker News (tech news, cached 30 min)
```

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/signup`, `/api/auth/login` | Create account / log in |
| GET | `/api/auth/me` | Current user |
| GET | `/api/playlists/search?query=` | Live YouTube playlist search |
| GET | `/api/questions/sets` | Assignment sets for a sub-topic |
| GET | `/api/questions` | Questions of a set (answers are not exposed) |
| POST | `/api/questions/submit` | Submit an answer (MCQ grading / AI code review) |
| GET | `/api/questions/:id/explanation` | AI explanation, cached after first call |
| GET | `/api/questions/results` | Results summary for an assignment set |
| GET | `/api/progress/summary` | Streaks, stats, weekly activity, badges |
| GET | `/api/news` | Aggregated tech news |
| GET | `/api/health` | Health check |

---

## Getting started

**Prerequisites:** Node.js 20+, a Neon (or any PostgreSQL) database, a Gemini API key and a YouTube Data API key.

```bash
git clone https://github.com/RidhiJain24/EduUp.git
cd EduUp
```

**Backend**

```bash
cd server
npm install
cp .env.example .env     # fill in the values below
npx prisma db push
npm run dev              # http://localhost:5000
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Long random string for signing tokens |
| `GEMINI_API_KEY` | Google AI Studio key |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key |
| `FRONTEND_URL` | Allowed frontend origin(s), comma separated (production) |

**Frontend** (from the project root)

```bash
npm install              # dependency versions are pinned to match bun.lock
cp .env.example .env     # set VITE_API_URL if the API is not on localhost:5000
npm run dev              # http://localhost:8080
```

**Load the question bank**

```bash
cd server
npm run db:import:questions   # restores the questions committed in prisma/seed-data
npm run generate:all          # optional: generate fresh questions with Gemini
```

## Project structure

```
EduUp/
├── src/                  # React app (routes, components, API client)
│   └── routes/           # landing, auth, dashboard, assignments, news, legal pages
└── server/
    ├── routes/           # auth, playlists, questions, progress, news
    ├── controllers/      # request handlers
    ├── middleware/       # JWT auth
    ├── prisma/           # schema and question seed data
    └── scripts/          # question generation, database export / import
```

## Design decisions

- **Live playlist search instead of a hand-made list.** Any topic works and nothing goes stale. Results are cached to stay inside API quotas.
- **Questions are generated with a script, not typed by hand.** The generation script is reusable for any new subject, and the resulting question bank is exported to JSON, so it can be restored without calling the AI again.
- **AI explanations are generated lazily and cached.** The first wrong answer triggers the model call, every later student gets the saved text.
- **MCQs are graded on the server.** Correct answers are never sent to the browser before submission.
- **Graceful degradation.** If the AI service is rate limited, the submission is still saved and the student sees a friendly message instead of an error.

## Limitations and roadmap

- The AI code review reads the code and does not execute it, so it is feedback, not automated testing
- Some badges (focus-time, course completion, comeback) are not tracked yet because study-timer sessions are not stored on the server
- Badge artwork and a few UI details are still being polished
- Planned: a curated internships / opportunities feed, code execution sandbox, leaderboards

## Author

Built by **Ridhi Jain** ([@RidhiJain24](https://github.com/RidhiJain24)).
