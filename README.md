# 🎓 SYNALUM — Synergy Alumni & Mahasiswa

> **Platform kolaborasi karier kampus** yang menghubungkan **Alumni**, **Mahasiswa**, dan **Dosen** Universitas Syiah Kuala melalui tiga pilar utama: Magang, Mentorship, dan Riset.

---

## ✨ What is Synalum?

Synalum is a full-stack web application built as a **PKM (Program Kreativitas Mahasiswa)** portfolio project. It solves the **disconnect between university graduates and current students** by providing:

| Role        | What they can do |
|-------------|-----------------|
| 🎓 **Alumni** | Post internship / mentorship opportunities, review applicants, manage mentees |
| 📚 **Mahasiswa** | Browse & apply to opportunities, track applications, build a career profile |
| 👩‍🏫 **Dosen** | Post official USK-stamped research/internship listings, manage student applicants |

---

## 🛠 Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 19 + Vite 8 |
| Styling  | Tailwind CSS v4 + Custom Design Tokens |
| Backend  | Express 5 (Node.js) |
| Database | **SQLite via `better-sqlite3`** (file-based, zero credentials) |
| Auth     | JWT (jsonwebtoken) + bcryptjs |
| HTTP     | Axios (frontend) |
| Dev      | concurrently, nodemon |

> ✅ **No cloud setup required.** The database is a local `synalum.db` file created automatically on first run.

---

## 📁 Project Structure

```
synalum-pkm-main/
├── package.json          ← Root — one-click dev runner (concurrently)
├── README.md
│
├── synalum-api/          ← Express REST API (port 5000)
│   ├── server.js
│   ├── db.js             ← SQLite connection + auto schema init
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   └── synalum.db        ← Auto-created on first run (git-ignored)
│
└── synalum-client/       ← React/Vite frontend (port 5173)
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── context/
    │   └── utils/api.js  ← Axios, proxied via Vite → no CORS
    └── vite.config.js    ← /api proxy → localhost:5000
```

---

## 🚀 Quick Start — One Command

### Prerequisites

- **Node.js ≥ 18** — [Download](https://nodejs.org)
- **npm ≥ 9** (comes with Node.js)

### 1. Install all dependencies

```bash
# From the root directory:
npm run install:all
```

This installs dependencies for both `synalum-api` and `synalum-client`.

### 2. Run both servers simultaneously

```bash
npm run dev
```

This single command starts:
- 🔵 **API** → `http://localhost:5000` (Express + SQLite)
- 🟣 **Client** → `http://localhost:5173` (React/Vite)

The SQLite database (`synalum.db`) is **auto-created** with all tables on first run — no migration step needed.

### 3. Open the app

Navigate to **[http://localhost:5173](http://localhost:5173)**

---

## 🧑‍💻 Running Individually

```bash
# API only
npm run dev:api

# Client only
npm run dev:client
```

Or from within each subfolder:

```bash
# Terminal 1
cd synalum-api && npm run dev

# Terminal 2
cd synalum-client && npm run dev
```

---

## 🔌 API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/api/auth/register` | Register a new user | — |
| `POST` | `/api/auth/login` | Login (returns JWT) | — |
| `POST` | `/api/verify/request-otp` | Request OTP (simulated) | JWT |
| `POST` | `/api/verify/submit-docs` | Submit LinkedIn/doc URL | JWT |
| `GET`  | `/api/opportunities/all` | List active opportunities | JWT |
| `POST` | `/api/opportunities/create` | Create opportunity | JWT (alumni/dosen/admin) |
| `POST` | `/api/applications/apply` | Apply to opportunity | JWT (mahasiswa) |
| `GET`  | `/api/applications/:id/applicants` | List applicants | JWT (owner) |
| `PUT`  | `/api/applications/:id/status` | Accept/reject applicant | JWT (owner) |
| `GET`  | `/api/health` | Server + DB health check | — |

---

## 🎨 Design System

The client uses a custom Tailwind v4 design system with:
- **Primary:** `#0a6c75` (deep teal)
- **Accent:**  `#f2994a` (warm orange)
- **Font:**    Inter (Google Fonts)
- Glass-morphism cards, gradient text, micro-animations, smooth hover transitions

---

## 🏗 Architecture Notes

- **JWT Auth:** Tokens are stored in `localStorage` and attached to all API requests via an Axios interceptor.
- **Alumni Verification:** 3-layer flow (OTP email simulation → document/LinkedIn URL → peer confirmation). For the MVP, OTP is returned in the response for testing.
- **Role-Based Routing:** Protected routes in React guard dashboard access by role (`mahasiswa`, `alumni`, `dosen`, `admin`).
- **No migrations needed:** `db.js` runs `CREATE TABLE IF NOT EXISTS` at server startup automatically.

---

## 📝 Environment Variables (optional)

The API works with zero configuration. To customize, create `synalum-api/.env`:

```env
PORT=5000
JWT_SECRET=your_secret_here
```

A default JWT secret is used if none is provided (fine for local dev, change for any shared env).

---

## 👥 Team

Built as a **PKM-KC (Program Kreativitas Mahasiswa — Karsa Cipta)** project at **Universitas Syiah Kuala (USK)**, Aceh, Indonesia.

---

*Last updated: April 2026*
