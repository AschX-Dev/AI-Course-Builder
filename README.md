# AI Course Builder

Full-stack app to generate, edit, and export AI-powered courses.

## Tech Stack

- Frontend: Next.js (Pages Router), TailwindCSS, TipTap
- Backend: Node.js, Express, JWT Auth, Mongoose
- Database: MongoDB (Atlas or local)
- AI: Google Gemini via `@google/generative-ai`

## Monorepo Structure

- `backend/` Express API
  - Routes: `/auth`, `/course`, `/export`
  - Middleware: JWT auth
  - Services: `src/services/ai.js` (Gemini + fallback)
  - Models: `User`, `Course` (with embedded `Chapter`)
- `frontend/` Next.js app
  - Pages: `/login`, `/dashboard`, `/course/[id]`
  - Components: `RichEditor` (TipTap)

## Features

- Sign up / Login (bcrypt + JWT)
- Generate course outline with AI
- Edit course title/description and chapter details
- Generate chapter content with AI
- List, update, delete courses
- Export course as JSON or PDF

## Prerequisites

- Node.js 18+
- MongoDB (Atlas or local)
- Gemini API key (Google AI Studio)

## Environment Variables

Create `backend/.env` (see `backend/.env.example`):

```
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<ENCODED_PASS>@<cluster>.mongodb.net/ai_course_builder?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=supersecretchangeme
GEMINI_API_KEY=your_gemini_api_key
```

Create `frontend/.env.local` (see `frontend/.env.local.example`):

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Tip: URL-encode special characters in your MongoDB password.

## Install & Run (Dev)

In two terminals:

Terminal A (backend):

```
cd backend
npm install
npm run start
```

Should log: `MongoDB connected` and `Server running on http://localhost:4000`.

Terminal B (frontend):

```
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Basic Flow

1. Open `/login`, toggle to Sign up, create an account.
2. Go to `/dashboard`, enter Title + Topic → Generate.
3. Click a course → Editor. Edit text, generate chapter content, Save.
4. Export JSON/PDF from the editor.

## API Overview

- `POST /auth/signup`
- `POST /auth/login`
- `POST /course/generate`
- `GET /course` (list)
- `GET /course/:id`
- `PUT /course/:id`
- `DELETE /course/:id`
- `POST /course/:id/chapter/:chapterId/generate`
- `POST /export/:id` (JSON)
- `POST /export/:id/pdf` (PDF)

Auth: Send `Authorization: Bearer <token>` on protected routes.

## Troubleshooting

- 401 responses: token missing/expired → re-login.
- MongoDB connect errors: whitelist IP in Atlas, verify `MONGODB_URI`.
- Gemini placeholders: ensure `GEMINI_API_KEY` is set; check studio quota.
- Next.js SSR editor errors: TipTap is dynamically imported and `immediatelyRender=false`.

## License

MIT
