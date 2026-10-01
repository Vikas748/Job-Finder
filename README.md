# JobPing — Job Filtering & WhatsApp Alerts

A small MERN app that matches job postings to users, exports the matches to Excel,
and sends each new match to the user's WhatsApp (via Twilio). The same job is never sent to the same user twice.

---

## Project structure

```
internship assignment/
├── backend/                         Node.js + Express + MongoDB (MVC)
│   ├── server.js                    Entry point
│   ├── .env.example                 Copy to .env and fill in
│   ├── models/
│   │   ├── Job.js                   A job posting
│   │   ├── User.js                  A person + their preferences + WhatsApp number
│   │   └── NotificationLog.js       One row per (user, job) alert → duplicate guard
│   ├── controllers/
│   │   ├── jobController.js         List / add / delete / seed jobs, skills summary
│   │   ├── userController.js        Add / edit users, matches, test message, Excel
│   │   └── notificationController.js  Alerts for everyone, history, Twilio status
│   ├── routes/                      URL → controller mapping
│   ├── services/
│   │   ├── matcher.js               The matching rules + score
│   │   ├── alertService.js          match → skip duplicates → send → log
│   │   ├── notifier.js              Twilio WhatsApp (or terminal in demo mode)
│   │   └── excelExporter.js         Formatted .xlsx
│   └── data/sampleJobs.js           12 sample jobs
│
└── frontend/                        React + Vite
    └── src/
        ├── App.jsx                  Sidebar + current page
        ├── pages/                   Overview, Users, Matches, All jobs, Post a job, Alert history
        ├── components/              Sidebar, UserForm, SkillPicker, TagInput, JobCard, WhatsAppPreview, Toast
        └── services/                api.js (all fetch calls), alertSummary.js
```

---

## How to run

**Needs:** Node.js 18+ and MongoDB (local `mongod` or a free MongoDB Atlas URI).

```bash
# 1. Backend
cd backend
cp .env.example .env        # Windows: copy .env.example .env
npm install
npm run dev                 # http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Without Twilio keys the app runs in **demo mode**: every WhatsApp message is printed in the backend terminal instead.

---

## Test with your own WhatsApp number (Twilio sandbox)

1. Create a free account at https://www.twilio.com.
2. Console → **Messaging → Try it out → Send a WhatsApp message**. Note the sandbox number (+1 415 523 8886) and your join phrase (e.g. `join silver-tiger`).
3. From your phone, send that join phrase to the sandbox number on WhatsApp.
4. Put these in `backend/.env`:
   ```
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   TWILIO_SANDBOX_JOIN_CODE=join silver-tiger
   ```
5. Restart the backend. The sidebar now shows **WhatsApp is live**.

Every extra number (a friend, a second phone) must also send the join phrase once.
If a message fails with "hasn't joined the sandbox recently", send the join phrase again — the sandbox session expires after a while.

---

## Demo script (2 minutes)

1. **Overview → Load sample jobs.**
2. **Users → Add user.** Enter your name and number, click the skills you have
   (the board shows every skill companies are asking for and how many jobs want it),
   keep "Send current matches to WhatsApp right after saving" ticked → **Add user**. Messages arrive.
3. **Matches** → see each job's score, the skills you have, and the skills the job also wants. **Download Excel**.
4. **Post a job** that fits your skills → **Post job and alert matches**. A new WhatsApp arrives within seconds.
5. Click **Send new matches** again → "Nothing new to send" — that's the duplicate guard.
6. **Alert history → Clear history** lets you repeat the demo.

---

## How matching works (`backend/services/matcher.js`)

| Step | Rule |
|------|------|
| Must pass | **Work type** is one the user selected (skipped if none selected) |
| Must pass | **Location** contains one of the user's locations. "Remote" also accepts any Remote job (skipped if none given) |
| At least one | **Title** contains one of the user's titles, **or** the job asks for at least one of the user's **skills** |
| Bonus | **Preferred company** |

Score (0–100): title match 35, skills up to 50 (share of the job's skills the user has), preferred company 15.
Each match also lists `matchedSkills`, `missingSkills` and a readable `matchReason`.

---

## Duplicate prevention

`NotificationLog` stores one row per **user + job**, with a unique index on `{ userId, jobId }`.
Before sending, `alertService.js` checks for a row with status `sent` and skips the job if it exists.
Failed sends are kept as `failed` and retried next time.

---

## Excel export

`GET /api/users/:id/export` downloads `matching_jobs_<name>.xlsx`:

- **Matching Jobs** sheet: Company, Job Title, Location, Remote / On-site, Posted Date, Match Score, Matched Skills, Skills to Learn, Why It Matched, Job URL (clickable). Header is frozen and every column has a filter.
- **Preferences** sheet: the user's criteria, so the file explains itself.

---

## API

| Method | URL | What it does |
|--------|-----|--------------|
| GET | `/api/jobs` | All jobs |
| POST | `/api/jobs` | Add a job **and alert every matching user** |
| DELETE | `/api/jobs/:id` | Delete a job |
| POST | `/api/jobs/seed` | Load the 12 sample jobs |
| GET | `/api/jobs/skills` | Skills companies ask for (with counts), locations, companies |
| GET | `/api/users` | All users with their match count |
| POST | `/api/users` | Add a user (`sendNow: true` alerts them immediately) |
| PUT | `/api/users/:id` | Update a user |
| DELETE | `/api/users/:id` | Delete a user and their alert log |
| GET | `/api/users/:id/matches` | Matching jobs, best first |
| POST | `/api/users/:id/test` | Send a "hello" WhatsApp to check the number |
| POST | `/api/users/:id/alerts` | Send this user's new matches |
| GET | `/api/users/:id/export` | Download Excel |
| POST | `/api/notifications/send` | Send new matches to every user |
| GET | `/api/notifications/history?userId=` | Alert log |
| DELETE | `/api/notifications/history?userId=` | Clear the log (to repeat a demo) |
| GET | `/api/notifications/status` | Is Twilio connected + sandbox join details |

---

## Tech stack

Node.js, Express 5, MongoDB (Mongoose), Twilio WhatsApp API, exceljs, React 19 + Vite, lucide-react icons.
