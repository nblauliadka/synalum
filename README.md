<div align="center">
  <h1>🎓 SYNALUM — Synergy Alumni & Mahasiswa</h1>
  <p><b>Platform kolaborasi karier kampus</b> yang menghubungkan <b>Alumni</b>, <b>Mahasiswa</b>, dan <b>Dosen</b> Universitas Syiah Kuala melalui tiga pilar utama: <i>Magang</i>, <i>Mentorship</i>, dan <i>Riset</i>.</p>

  [![Interactive Preview](https://img.shields.io/badge/Interactive_Preview-Click_Here-0A6C75?style=for-the-badge&logo=netlify&logoColor=white)](https://synalumpreview.netlify.app/)
  [![React](https://img.shields.io/badge/React-%2320232A.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](#)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
  [![Express.js](https://img.shields.io/badge/Express.js-%23000000.svg?style=for-the-badge&logo=express&logoColor=white)](#)
  [![SQLite](https://img.shields.io/badge/SQLite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)](#)
</div>

<br>
## ✨ What is CariQuest?

CariQuest adalah aplikasi *mobile cross-platform* berbasis Flutter yang dirancang khusus untuk ekosistem mahasiswa **Universitas Syiah Kuala (USK)**. Aplikasi ini memecahkan masalah distribusi talenta kampus dengan menyediakan *marketplace* jasa yang mempertemukan pencari bantuan tugas/proyek dengan mahasiswa ahli di bidangnya.

| Role | Core Features |
|---|---|
| 🛠️ **Expert** | Mengelola profil portofolio, melakukan *bidding* pada proyek (Quest), menerima pekerjaan, dan melacak saldo pendapatan di Wallet. |
| 🔍 **Seeker** | Membuat postingan pekerjaan (Quest), mereview pelamar, memantau *lifecycle* proyek (Pending → Working → Review → Finished), dan memberikan rating. |
| 🛡️ **Admin** | Memantau seluruh transaksi, melakukan verifikasi pengguna, dan memediasi sengketa (*dispute*) antar mahasiswa. |

---

## 🏗 Demo Mock MVP Architecture

Untuk keperluan *showcase* portofolio yang cepat dan bebas hambatan, versi CariQuest ini dibangun sebagai **100% Offline Local Mock MVP**:

- **☁️ Zero Cloud Configuration**: Seluruh dependensi Firebase (Auth, Firestore, Storage) telah dihapus total. Tidak ada *API keys*, tidak ada *CORS errors*.
- **📦 In-Memory Data Engine**: Menggunakan sistem `MockData` terisolasi yang mensimulasikan *database real-time*, *latency*, dan *state persistence* selama aplikasi berjalan.
- **⚡️ Plug & Play**: Aplikasi siap dijalankan secara instan tanpa perlu *setup server*.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Flutter 3.x (Dart 3.3+) |
| **State Management** | Riverpod 2.x (`StateNotifier` + `StreamProvider`) |
| **Routing** | `go_router` 13.x (Declarative App Routing) |
| **Storage Layer** | `shared_preferences` (Sesi login lokal) |
| **UI & Animations** | Material 3, `flutter_animate`, `lottie` |

---

## 🔑 Demo Accounts (Instan Login)

Sistem sudah diisi dengan data akun terverifikasi. Gunakan kredensial di bawah ini untuk mencoba berbagai *role* (semua menggunakan password yang sama):

| Role | Email Login | Password |
|---|---|---|
| **🎓 Expert** | `expert@demo.com` | `demo123` |
| **🔍 Seeker** | `seeker@demo.com` | `demo123` |
| **🛡️ Admin** | `admin@demo.com` | `demo123` |

> *Pro Tip: Layar login sudah dilengkapi tombol "Demo Login" untuk auto-fill.*

---

## 📁 Project Structure (Feature-First)

```text
cariquest/
├── lib/
│   ├── core/         ← Tema, Konstanta, dan MockData Engine
│   ├── features/     ← Modul independen (Auth, Quest, Expert, Seeker, Wallet)
│   ├── shared/       ← Model global dan Widget UI yang dapat digunakan ulang
│   └── main.dart     ← Entry point aplikasi tanpa inisialisasi Firebase
└── pubspec.yaml
```

---

## 🚀 Quick Start — Local Development

Karena menggunakan sistem *Mock Data*, aplikasi ini sangat ringan dan dioptimalkan untuk berjalan langsung di *browser* laptop Anda.

**1. Clone Repository**
```bash
git clone [https://github.com/nblauliadka/cariquest.git](https://github.com/nblauliadka/cariquest.git)
cd cariquest
```

**2. Install Dependencies**
```bash
flutter pub get
```

**3. Run the App (Web Mode Recommended)**
```bash
flutter run -d chrome
```

---
<div align="center">
  <i>Developed by Nabil Aulia Dika & Ibnul Jawzy</i>
</div>
