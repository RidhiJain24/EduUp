# EduUp

EduUp is a learning platform built for CSE (Computer Science) students. 
Instead of spending time searching YouTube for good content, students 
search a topic (e.g. Data Structures, DBMS, System Design) and get 
curated playlists from top educators — pick one, watch the videos, 
then solve AI-checked practice questions with instant feedback and 
improvement tips.

## Features

- 🔍 **Topic-based search** — find curated YouTube playlists by subject 
  and sub-topic, instead of searching YouTube manually
- 🤖 **AI-powered assignment review** — submit answers and get instant, 
  detailed feedback and explanations
- 📊 **Progress tracking** — dashboard showing streaks, courses in 
  progress, and weekly study activity
- 🏆 **Badges & achievements** — unlock badge/shield-style rewards for 
  milestones and consistency
- ⏱️ **Study timer** — Pomodoro-style sessions with water break reminders
- 🎮 **Break-time games** — quick educational games to refresh between 
  study sessions
- 📰 **Study news** — stay updated on tech news, internships, and 
  career opportunities

## Tech Stack

**Frontend:** React, TypeScript, TanStack Router, Vite  
**Backend:** Node.js, Express  
**Database:** PostgreSQL (Neon) with Prisma ORM  
**Auth:** JWT-based authentication with bcrypt password hashing

## Database Backup & Restore

EduUp includes scripts to snapshot database state and safely seed or restore question banks:

### Export Full Database & Question Seeds
```bash
npm run db:export
```
- Queries all Prisma tables (`User`, `Subject`, `Subtopic`, `Playlist`, `Question`, `Submission`, `UserBadge`).
- Dumps each table to `server/backups/<timestamp>/<table_name>.json` with row counts and file sizes. Backups are automatically ignored by git to protect student data.
- Exports the canonical `Question` bank (retaining original IDs, assignments, and explanations) to `server/prisma/seed-data/questions.json` for version control.

### Import / Restore Question Bank
```bash
npm run db:import:questions
```
- Reads `server/prisma/seed-data/questions.json`.
- Restores the questions in batches of 500 using `createMany` with `skipDuplicates: true`.
- Idempotent and safe to run multiple times without duplicating or overwriting existing question IDs.

## Status

🚧 In active development — currently built: landing page, auth (signup/
login), student dashboard, and backend auth API. Topic search, AI 
review, and badge logic in progress.