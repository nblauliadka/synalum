import Database from 'better-sqlite3'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, 'synalum.db')

// Open (or create) the SQLite database file
export const db = new Database(DB_PATH)

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ─── Auto-initialize schema on first run ─────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    email     TEXT    NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role      TEXT    NOT NULL CHECK(role IN ('mahasiswa','alumni','dosen','admin')),
    created_at TEXT   NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS alumni_profiles (
    user_id   INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    angkatan  INTEGER,
    fakultas  TEXT,
    linkedin_url TEXT,
    status_verifikasi TEXT NOT NULL DEFAULT 'pending'
      CHECK(status_verifikasi IN ('pending','verified','rejected'))
  );

  CREATE TABLE IF NOT EXISTS student_profiles (
    user_id   INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    nim       TEXT UNIQUE,
    fakultas  TEXT,
    prodi     TEXT,
    semester  INTEGER CHECK(semester IS NULL OR semester >= 1),
    ipk       REAL    CHECK(ipk IS NULL OR (ipk >= 0 AND ipk <= 4.00)),
    minat_karir TEXT
  );

  CREATE TABLE IF NOT EXISTS verifications (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    otp_code    TEXT,
    document_url TEXT,
    status      TEXT NOT NULL DEFAULT 'pending'
      CHECK(status IN ('pending','pending_moderator','approved','rejected')),
    layer_level INTEGER NOT NULL CHECK(layer_level IN (1,2,3)),
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS opportunities (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    created_by_user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title               TEXT NOT NULL,
    description         TEXT,
    badge_source        TEXT NOT NULL DEFAULT 'EKSTERNAL'
      CHECK(badge_source IN ('RESMI_USK','EKSTERNAL','ALUMNI_POST')),
    faculty             TEXT,
    category            TEXT,
    location            TEXT,
    is_active           INTEGER NOT NULL DEFAULT 1,
    created_at          TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS applications (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id    INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    student_user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status            TEXT NOT NULL DEFAULT 'pending'
      CHECK(status IN ('pending','reviewed','accepted','rejected','withdrawn','submitted')),
    cover_letter      TEXT,
    created_at        TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(opportunity_id, student_user_id)
  );
`)

// ─── Helper: check DB health ──────────────────────────────────────────────────
export function checkDbConnection() {
  // Returns current datetime from SQLite as a health signal
  const row = db.prepare("SELECT datetime('now') as now").get()
  return row
}
