# OmniStudy - Smart Study Planner & Materials Hub

All-in-one student workspace featuring:
- **Dashboard**: Track study activity, streaks, task completions, and upcoming exam deadlines.
- **Study Materials**: Rich Markdown notes categorized by subject and topic with tag filters.
- **PDF Library & Full-Text Search**: In-browser text extraction via `pdfjs-dist` with Gemini AI summaries, flashcard generation, and practice quizzes.
- **Smart Study Plan**: Personalized AI study schedules optimized for spaced repetition and exam dates.
- **Study Planner**: Interactive timeline of scheduled sessions with 1-click launch into the focus timer.
- **Task Management**: Prioritized study tasks with due dates and completion tracking.
- **Focus Study Timer & Pomodoro**: Synthesized ambient sounds (Rain/Brown Noise, Pink Noise) and bell chimes.
- **Progress Tracking & Study Streak**: Analytics, 7-day consistency calendar, and subject breakdown.
- **Multi-Turn Gemini Chatbot**: Conversational academic tutor with switchable personas and Gemini model options (`gemini-3.5-flash`, `gemini-3.1-flash-lite`, `gemini-3.1-pro-preview`).
- **Audio Transcription**: Microphone recording transcribed via `gemini-3.5-transcribe` into notes, tasks, or tutor questions.
- **Firebase Firestore & Authentication**: Real-time cloud persistence with security rules.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your `GEMINI_API_KEY`.

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```
