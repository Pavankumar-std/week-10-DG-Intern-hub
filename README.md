# JobHub – Job & Internship Portal (Week 10)

A beginner-friendly, production-style React application with a Node/Express API.
Three roles – **Candidate**, **Recruiter**, **Admin** – each with their own dashboard.

---

## 1. What you need first
- **Node.js 18 or newer** (download from https://nodejs.org – check with `node -v`)
- A code editor (VS Code)
- No database to install! The backend saves data in `backend/data/db.json`.

## 2. How to run (two terminals)

**Terminal 1 – backend**
```bash
cd backend
npm install
npm start
```
You should see: `✅ API running at http://localhost:5000`

**Terminal 2 – frontend**
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** in your browser.

### Demo accounts (created automatically)
| Role | Email | Password |
|------|-------|----------|
| Candidate | candidate@demo.com | Candidate@123 |
| Recruiter | recruiter@demo.com | Recruiter@123 |
| Admin | admin@demo.com | Admin@123 |

To reset all data: `cd backend && npm run reseed`

---

## 3. Folder structure
```
job-portal/
├── backend/
│   ├── controllers/   <- the logic for each feature (auth, jobs, applications...)
│   ├── routes/        <- list of API URLs
│   ├── middleware/    <- login check + role check
│   ├── data/          <- db.json (auto-created)
│   ├── db.js          <- tiny JSON-file database
│   ├── seed.js        <- demo data
│   └── server.js      <- starts the server
├── frontend/
│   └── src/
│       ├── components/  <- reusable pieces (Navbar, JobCard, Modal ...)
│       ├── pages/       <- one file per screen
│       ├── context/     <- global state (AuthContext, AppContext)
│       ├── hooks/       <- useAuth, useApp, useDebounce
│       ├── services/    <- api.js (ALL backend calls)
│       └── utils/       <- validation rules + helpers
├── screenshots/       <- put your 10+ screenshots here
└── README.md
```

## 4. Task checklist – where to find each feature
| Task | Feature | File(s) |
|------|---------|---------|
| 1 | Architecture, reusable components | `frontend/src/components/*` |
| 2 | Auth state, protected routes, roles, persistent login | `context/AuthContext.jsx`, `components/ProtectedRoute.jsx`, `App.jsx` |
| 3 | Centralised API + error handling | `services/api.js` |
| 4 | Search & filters + debounce | `pages/Jobs.jsx`, `components/JobFilter.jsx`, `hooks/useDebounce.js` |
| 5 | Server-side pagination & sorting | `backend/controllers/jobController.js`, `components/Pagination.jsx` |
| 6 | Form validation (React Hook Form) | `utils/validation.js`, `pages/Register.jsx`, `pages/JobDetails.jsx` |
| 7 | Candidate dashboard | `pages/CandidateDashboard.jsx` |
| 8 | Recruiter dashboard | `pages/RecruiterDashboard.jsx` |
| 9 | Admin dashboard + charts (Recharts) | `pages/AdminDashboard.jsx` |
| 10 | Toasts + notification panel (read/unread) | `context/AppContext.jsx`, `components/ToastContainer.jsx`, `components/Navbar.jsx` |
| 11 | Loading, error, empty states | `components/Loader.jsx`, `components/StateViews.jsx` |
| 12 | Responsive UI + **dark mode** (saved after refresh) | `index.css`, `AppContext.jsx` |
| 13 | Performance optimisation | see section 6 |
| 14 | Testing | see section 7 |
| Advanced | **Option 1 – job recommendation with match %** | `jobController.getRecommended`, Candidate → *Recommended Jobs* |

## 5. API documentation
Base URL: `http://localhost:5000/api`. Protected routes need the header `Authorization: Bearer <token>`.

### Auth
| Method | URL | Who | Description |
|---|---|---|---|
| POST | `/auth/register` | public | body: `name, email, password, phone, role` (candidate/recruiter) |
| POST | `/auth/login` | public | body: `email, password` → `{ token, user }` |
| GET | `/auth/me` | logged in | current user |

### Jobs
| Method | URL | Who | Description |
|---|---|---|---|
| GET | `/jobs` | public | query: `q, location, company, skills, experience, type, workMode, minSalary, sort, page, limit` |
| GET | `/jobs/:id` | public | single job |
| GET | `/jobs/recommended` | candidate | jobs with `matchScore` |
| GET | `/jobs/mine` | recruiter | my jobs + applicant count |
| POST | `/jobs` | recruiter | create job |
| PUT | `/jobs/:id` | recruiter (owner) | update job |
| DELETE | `/jobs/:id` | recruiter (owner) / admin | delete job |

`sort` values: `newest`, `oldest`, `salaryLow`, `salaryHigh`, `relevant`.

### Applications
| Method | URL | Who | Description |
|---|---|---|---|
| POST | `/applications` | candidate | body: `jobId, resume, coverLetter, skills, education, experience` |
| GET | `/applications/mine` | candidate | my applications |
| GET | `/applications/job/:jobId?q=` | recruiter (owner) | applicants of a job |
| PUT | `/applications/:id/status` | recruiter (owner) | body: `status` – Applied / Under Review / Shortlisted / Interview / Selected / Rejected |

### Users, notifications, stats
| Method | URL | Who | Description |
|---|---|---|---|
| GET / PUT | `/users/profile` | logged in | get / update profile |
| GET | `/users/saved` | candidate | saved jobs |
| POST | `/users/saved/:jobId` | candidate | save / unsave toggle |
| GET | `/users?role=` | admin | list users |
| PUT | `/users/:id/disable` | admin | disable / enable a user |
| GET | `/notifications` | logged in | my notifications |
| PUT | `/notifications/:id/read`, `/notifications/read-all` | logged in | mark as read |
| GET | `/stats` | logged in | dashboard numbers for your role (admin also gets chart data) |

## 6. Performance optimisations (use this in your report – Task 13)
1. **`React.memo` on `JobCard`** – a card is only redrawn if its own job data changes, not when the page re-renders.
2. **`useCallback`** (`Jobs.jsx`) – keeps handler functions identical between renders, so `React.memo` actually works.
3. **`useMemo`** – builds the API query (`Jobs.jsx`) and the context values (`AuthContext`, `AppContext`) only when needed.
4. **Debounced search** (`useDebounce`) – the API is called 500 ms after typing stops, not on every key press.
5. **Lazy loading / code splitting** (`App.jsx`) – dashboards are downloaded only when opened, making the first load faster.
6. **Server-side pagination** – only 6 jobs are sent per request instead of the whole list.

## 7. Testing table (Task 14)
Run each test by hand, then change **Actual Result** and **Status** to what you really saw.

| Test Case | Expected Result | Actual Result | Status |
|---|---|---|---|
| Registration (valid data) | Account created, redirected to dashboard | | |
| Registration (weak password) | "Password must contain at least 8 characters" | | |
| Registration (passwords differ) | "Passwords do not match" | | |
| Login | User logged in | | |
| Invalid login | Error message shown | | |
| Logout | Back to login page, session cleared | | |
| Refresh after login | Still logged in | | |
| Candidate opens `/admin` | Redirected to candidate dashboard | | |
| Recruiter access | Recruiter dashboard opens | | |
| Admin access | Admin dashboard + charts open | | |
| Job search (type "react") | Matching jobs only, API called once after pause | | |
| Job filtering (Internship + Remote) | Only matching jobs | | |
| Sorting (Salary High → Low) | Highest salary first | | |
| Pagination | Page 2 shows next jobs | | |
| Job application | "Application submitted successfully" toast | | |
| Apply twice for same job | "You have already applied" message | | |
| Invalid application form | Red messages, nothing sent | | |
| Recruiter creates job | Job appears in My Jobs and on home page | | |
| Application status update | Candidate gets a notification | | |
| API failure (stop backend) | "Unable to load jobs." + Try Again button | | |
| Dark mode + refresh | Theme stays the same | | |

## 8. Submission checklist (what is still YOUR job)
- [ ] Take **10+ screenshots** → put them in `screenshots/` (login, register, jobs, filters, job details, application form, 3 dashboards, notifications/dark mode)
- [ ] Fill in the testing table above
- [ ] Write the 8–12 page report (suggested headings are in the task sheet) and the 8–12 slide PPT
- [ ] Record the 3–7 minute demo video
- [ ] Push to GitHub and share a LinkedIn post mentioning **DG Interns Hub**

## 9. Notes / simple upgrades
- **Database:** to meet the "MongoDB / MySQL" requirement, replace `backend/db.js` + controllers' `data.xxx` calls with Mongoose or Sequelize models. All API URLs would stay the same, so the React app needs **no changes**.
- **Resume:** candidates paste a resume *link* (Google Drive etc.). File upload would need the `multer` package.
- **Secrets:** copy `backend/.env.example` to `backend/.env` and change `JWT_SECRET` before deploying.
- Notifications refresh every 15 seconds (simple polling). Socket.IO would make them instant.
