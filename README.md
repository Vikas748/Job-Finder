# Job Filter & Alert System — MERN Stack

Full-stack job filtering and WhatsApp notification system.
Built with **MongoDB + Express + React + Node.js** in a clean **MVC architecture**.

---

## Project Structure

```
internship assignment/
├── backend/                              ← Node.js + Express API (MVC)
│   ├── server.js                         ← Entry point
│   ├── package.json
│   ├── .env.example                      ← Credentials template
│   │
│   ├── models/                           ← M — Mongoose schemas
│   │   ├── Job.js
│   │   ├── UserProfile.js
│   │   └── NotificationLog.js
│   │
│   ├── controllers/                      ← C — Request handlers
│   │   ├── jobController.js
│   │   ├── profileController.js
│   │   └── notificationController.js
│   │
│   ├── routes/                           ← URL → controller mapping
│   │   ├── jobRoutes.js
│   │   ├── profileRoutes.js
│   │   └── notificationRoutes.js
│   │
│   ├── services/                         ← Shared business logic
│   │   ├── matcher.js                    ← Job matching engine
│   │   ├── notifier.js                   ← Twilio WhatsApp sender
│   │   └── excelExporter.js              ← Excel file generator
│   │
│   └── data/
│       ├── sampleJobs.js                 ← 12 sample job postings
│       └── exports/                      ← Generated Excel files
│
└── frontend/                             ← React + Vite (MVC view layer)
    ├── src/
    │   ├── main.jsx                      ← React entry point
    │   ├── App.jsx                       ← Root component + routing
    │   ├── index.css                     ← Global design system
    │   │
    │   ├── pages/                        ← One component per page
    │   │   ├── Dashboard.jsx
    │   │   ├── Profile.jsx
    │   │   ├── AllJobs.jsx
    │   │   ├── MatchingJobs.jsx
    │   │   ├── AlertHistory.jsx
    │   │   └── AddJob.jsx
    │   │
    │   ├── components/                   ← Reusable UI components
    │   │   ├── Sidebar.jsx
    │   │   ├── JobCard.jsx
    │   │   ├── TagInput.jsx
    │   │   └── Toast.jsx
    │   │
    │   └── services/
    │       └── api.js                    ← All fetch calls in one place
    └── package.json
```

---

## How to Run

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) or a MongoDB Atlas connection string

### 1. Configure environment variables

```bash
cd backend
copy .env.example .env
```

Edit `backend/.env`:

```
MONGO_URI=mongodb://localhost:27017/jobfilter
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
PORT=5000
```

### 2. Start the backend

```bash
cd backend
npm install
npm run dev        # uses nodemon for auto-reload
```

API runs at `http://localhost:5000`

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Demo Walkthrough (5 Steps)

1. Open `http://localhost:5173`
2. Go to **Preferences** — set job titles, locations, keywords, and your WhatsApp number
3. Go to **Dashboard** — click **"Load Sample Jobs"** (seeds 12 realistic Indian tech jobs)
4. Go to **Matching Jobs** — see matched jobs with match reasons
5. Dashboard → **"Send Alerts for New Matches"** — sends WhatsApp or prints to console

---

## How Job Matching Works

`backend/services/matcher.js` applies 5 simple string-based rules:

| Rule | Description |
|------|-------------|
| Title match | Job title contains one of your desired titles |
| Location match | Job location contains one of your preferred locations |
| Work type | Job's work type is in your accepted list |
| Keyword match | Any keyword found in job's skills, title, or description |
| Company match | (Bonus) Company is in your preferred companies list |

A job matches if **at least one rule** is satisfied.
Each matched job includes a `matchReason` string like:
> `"Title: backend engineer | Keywords: node.js, api"`

---

## WhatsApp Notification Setup

Uses the **Twilio WhatsApp Sandbox** (free):

1. Sign up at https://www.twilio.com (free account)
2. Go to **Messaging → Try it Out → Send a WhatsApp Message**
3. Send the join code from your WhatsApp to activate the sandbox
4. Copy **Account SID** and **Auth Token** from the Console dashboard
5. Paste into `backend/.env`

Message sent to user:
```
New Job Match!

Company: Razorpay
Role: Senior Backend Engineer
Location: Bangalore, India
Work Type: Hybrid
Why it matched: Title: backend engineer | Keywords: node.js, api
Apply: https://razorpay.com/jobs/...
```

> No Twilio account? The system still works — messages print to the Node.js terminal.

---

## Duplicate Prevention

Before sending a notification, the system checks the `notification_log` collection:

```js
const alreadyNotified = await NotificationLog.findOne({ jobId: job._id });
if (alreadyNotified) { skip; }
```

Once a job triggers an alert it is permanently logged, ensuring users are never notified twice.

---

## Excel Export

Click **"Export to Excel"** on the Dashboard or call `GET /api/notifications/export`.

The downloaded `matching_jobs.xlsx` contains:

| Company | Job Title | Location | Work Type | Posted Date | Job URL | Why Matched |
|---------|-----------|----------|-----------|-------------|---------|-------------|

---

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/jobs` | List all jobs |
| POST | `/api/jobs` | Add a new job |
| POST | `/api/jobs/seed` | Load 12 sample jobs |
| GET | `/api/jobs/matching` | Jobs matching user profile |
| GET | `/api/profile` | Get user preferences |
| POST | `/api/profile` | Save user preferences |
| POST | `/api/notifications/send` | Send alerts for new matches |
| GET | `/api/notifications/history` | View alert history |
| GET | `/api/notifications/export` | Download Excel file |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Backend framework | Express.js |
| Database | MongoDB (via Mongoose) |
| Notifications | Twilio WhatsApp API |
| Excel export | exceljs |
| Frontend | React + Vite |
| HTTP client | Fetch API (built-in) |
