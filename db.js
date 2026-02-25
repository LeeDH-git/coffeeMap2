// db/index.js
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

// db 파일 위치 (프로젝트 루트/db/coffee.sqlite3)
const dbDir = __dirname;
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const dbPath = path.join(dbDir, "coffee.sqlite3");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

// 최초 1회 테이블 보장
db.exec(`
CREATE TABLE IF NOT EXISTS cafes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  address TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',     -- JSON string
  signature TEXT NOT NULL DEFAULT '추천 메뉴 미등록',
  rating REAL NOT NULL DEFAULT 4.0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cafes_district ON cafes(district);
CREATE INDEX IF NOT EXISTS idx_cafes_name ON cafes(name);
`);

module.exports = db;