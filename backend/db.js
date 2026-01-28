const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'appointments.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      telegram_nick TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      short_request TEXT,
      detailed_request TEXT,
      status TEXT DEFAULT 'pending',
      email TEXT
    )
  `);
});

module.exports = db;
