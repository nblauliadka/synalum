<div align="center">
  <h1>🎓 SYNALUM — Synergy Alumni & Mahasiswa</h1>
  <p><b>Platform kolaborasi karier kampus</b> yang menghubungkan <b>Alumni</b>, <b>Mahasiswa</b>, dan <b>Dosen</b> Universitas Syiah Kuala melalui tiga pilar utama: <i>Magang</i>, <i>Mentorship</i>, dan <i>Riset</i>.</p>

  [![Interactive Preview](https://img.shields.io/badge/Interactive_Preview-Click_Here-0A6C75?style=for-the-badge&logo=netlify&logoColor=white)](https://synalumpreview.netlify.app/)
  [![React](https://img.shields.io/badge/React_19-%2320232A.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](#)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
  [![Express.js](https://img.shields.io/badge/Express.js-%23000000.svg?style=for-the-badge&logo=express&logoColor=white)](#)
  [![SQLite](https://img.shields.io/badge/SQLite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)](#)
</div>

<br>

## ✨ What is Synalum?

Synalum adalah aplikasi *full-stack web* yang dirancang khusus untuk memecahkan masalah *disconnect* antara lulusan dan mahasiswa aktif di **Universitas Syiah Kuala (USK)**. Aplikasi ini menyediakan *platform* kolaborasi profesional yang terintegrasi langsung dengan ekosistem kampus.

| Role | Core Features | 
| ----- | ----- | 
| 🎓 **Alumni** | Berkontribusi ke almamater dengan memposting lowongan magang/mentorship, mereview pendaftar, dan mengelola *mentees*. | 
| 📚 **Mahasiswa** | Menjelajahi dan melamar lowongan (*apply*), melacak status aplikasi, dan membangun profil portofolio karir sejak dini. | 
| 👩‍🏫 **Dosen** | Memposting lowongan proyek riset atau asisten lab resmi, serta mengelola mahasiswa pendaftar untuk kebutuhan akademik. | 

---

## 🛠 Tech Stack

| Layer | Technology | 
| ----- | ----- | 
| **Frontend** | React 19 + Vite 8 | 
| **Styling** | Tailwind CSS v4 + Custom Design Tokens | 
| **Backend** | Express 5 (Node.js) | 
| **Database** | **SQLite via `better-sqlite3`** (file-based, zero credentials) | 
| **Auth** | JWT (jsonwebtoken) + bcryptjs | 
| **HTTP** | Axios (frontend) | 
| **Dev** | concurrently, nodemon | 

> ✅ **No cloud setup required.** The database is a local `synalum.db` file created automatically on first run.

---

## 📁 Project Structure

```text
synalum-main/
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
