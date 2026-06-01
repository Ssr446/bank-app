const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// --- CHANGE ---
// Use an environment variable for the path, or default to './bank.db' for local development
const DB_PATH = process.env.DB_PATH || './bank.db';
// --- END CHANGE ---

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    // Add more detailed logging
    console.error(`Error connecting to database at ${DB_PATH}:`, err.message);
  } else {
    console.log(`Connected to the bank.db SQLite database at ${DB_PATH}`);
  }
});

db.serialize(() => {
  // --- USERS TABLE ---
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      firstName TEXT,
      lastName TEXT,
      email TEXT UNIQUE
    )
  `, (err) => {
    if (err) console.error("Error creating users table", err);
  });

  // --- ACCOUNTS TABLE ---
  db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      accountName TEXT NOT NULL,
      accountType TEXT NOT NULL, 
      balance REAL NOT NULL DEFAULT 0.00,
      FOREIGN KEY (userId) REFERENCES users (id)
    )
  `, (err) => {
     if (err) console.error("Error creating accounts table", err);
  });

  // --- TRANSACTIONS TABLE ---
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      accountId INTEGER,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (accountId) REFERENCES accounts (id)
    )
  `, (err) => {
    if (err) console.error("Error creating transactions table", err);
  });
  
  // --- APPOINTMENTS TABLE ---
  db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      service TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Scheduled',
      FOREIGN KEY (userId) REFERENCES users (id)
    )
  `, (err) => {
    if (err) console.error("Error creating appointments table", err);
  });

  // --- TRIGGER ---
  db.run(`
    CREATE TRIGGER IF NOT EXISTS create_user_accounts
    AFTER INSERT ON users
    BEGIN
      INSERT INTO accounts (userId, accountName, accountType, balance)
      VALUES 
        (NEW.id, 'Primary Checking', 'Checking', 1000.00);
    END;
  `, (err) => {
    if (err) console.error("Error creating trigger", err);
  });
});

module.exports = db;