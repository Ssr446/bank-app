const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database.js'); 

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this';

// --- Middleware ---
app.use(cors());
app.use(express.json());

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// --- Auth Routes ---

// --- MODIFIED /register ---
app.post('/register', (req, res) => {
  const { username, password, firstName, lastName, email } = req.body;
  if (!username || !password || !firstName || !lastName || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  
  const sql = 'INSERT INTO users (username, password, firstName, lastName, email) VALUES (?, ?, ?, ?, ?)';
  db.run(sql, [username, hashedPassword, firstName, lastName, email], function (err) {
    if (err) {
      if (err.message.includes("UNIQUE")) {
         return res.status(400).json({ message: "Username or email already exists" });
      }
      return res.status(500).json({ message: err.message });
    }
    res.status(201).json({ message: "User registered successfully", userId: this.lastID });
  });
});

// --- /login (No Change) ---
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ?';
  db.get(sql, [username], (err, user) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!user) return res.status(400).json({ message: "User not found" });
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: "Login successful", token });
  });
});


// --- Protected API Routes ---

// --- /api/dashboard (No Change) ---
app.get('/api/dashboard', authenticateToken, (req, res) => {
  const userId = req.user.id;
  let data = {
    username: req.user.username,
    accounts: [],
    recentTransactions: []
  };
  const accountSql = 'SELECT id, accountName, accountType, balance FROM accounts WHERE userId = ?';
  db.all(accountSql, [userId], (err, accounts) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!accounts || accounts.length === 0) {
      // It's possible to have no accounts if they delete them
      return res.json(data); // Send back empty data
    }
    data.accounts = accounts;
    const accountIds = accounts.map(a => a.id);
    const placeholders = Array(accountIds.length).fill('?').join(',');
    const txSql = `
      SELECT tx.*, a.accountName 
      FROM transactions tx
      JOIN accounts a ON tx.accountId = a.id
      WHERE tx.accountId IN (${placeholders}) 
      ORDER BY timestamp DESC 
      LIMIT 10
    `;
    db.all(txSql, accountIds, (err, transactions) => {
      if (err) return res.status(500).json({ message: err.message });
      data.recentTransactions = transactions;
      res.json(data);
    });
  });
});

// --- NEW: Profile Routes ---
app.get('/api/profile', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const sql = 'SELECT id, username, firstName, lastName, email FROM users WHERE id = ?';
  db.get(sql, [userId], (err, profile) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  });
});

app.put('/api/profile', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { firstName, lastName, email } = req.body;
  if (!firstName || !lastName || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const sql = 'UPDATE users SET firstName = ?, lastName = ?, email = ? WHERE id = ?';
  db.run(sql, [firstName, lastName, email, userId], function(err) {
    if (err) {
      if (err.message.includes("UNIQUE")) {
        return res.status(400).json({ message: "Email already in use" });
      }
      return res.status(500).json({ message: err.message });
    }
    res.json({ message: "Profile updated successfully" });
  });
});

app.put('/api/profile/password', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Both passwords are required" });
  }

  const sql = 'SELECT * FROM users WHERE id = ?';
  db.get(sql, [userId], (err, user) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check current password
    const isPasswordValid = bcrypt.compareSync(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid current password" });
    }

    // Hash and update new password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);
    const updateSql = 'UPDATE users SET password = ? WHERE id = ?';
    db.run(updateSql, [hashedPassword, userId], function(err) {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: "Password updated successfully" });
    });
  });
});


// --- NEW: Account Routes ---
app.post('/api/accounts', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { accountName, accountType } = req.body;
  if (!accountName || !accountType) {
    return res.status(400).json({ message: "Account name and type are required" });
  }
  
  // Give it a default starting balance
  const startBalance = accountType === 'Savings' ? 100.00 : 0.00;

  const sql = 'INSERT INTO accounts (userId, accountName, accountType, balance) VALUES (?, ?, ?, ?)';
  db.run(sql, [userId, accountName, accountType, startBalance], function(err) {
    if (err) return res.status(500).json({ message: err.message });
    res.status(201).json({ message: "Account created successfully", id: this.lastID });
  });
});

// --- NEW: Get Single Account Details (with ALL transactions) ---
app.get('/api/account/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const accountId = req.params.id;

  let data = {
    account: null,
    transactions: []
  };

  // 1. Get account details and verify ownership
  const accountSql = 'SELECT id, accountName, accountType, balance FROM accounts WHERE id = ? AND userId = ?';
  db.get(accountSql, [accountId, userId], (err, account) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!account) return res.status(404).json({ message: "Account not found or you do not own it." });

    data.account = account;

    // 2. Get ALL transactions for this account
    const txSql = `SELECT * FROM transactions WHERE accountId = ? ORDER BY timestamp DESC`;
    db.all(txSql, [accountId], (err, transactions) => {
      if (err) return res.status(500).json({ message: err.message });
      data.transactions = transactions;
      res.json(data);
    });
  });
});


// --- Transaction Routes (No Change) ---
app.post('/api/deposit', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { toAccountId, amount } = req.body;
  if (amount <= 0) return res.status(400).json({ message: "Deposit amount must be positive" });
  const findAccountSql = 'SELECT * FROM accounts WHERE id = ? AND userId = ?';
  db.get(findAccountSql, [toAccountId, userId], (err, account) => {
    if (err || !account) return res.status(404).json({ message: "Account not found or you do not own it." });
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      db.run('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, account.id]);
      db.run('INSERT INTO transactions (accountId, type, amount, description) VALUES (?, ?, ?, ?)', [account.id, 'CREDIT', amount, `Deposit`]);
      db.run('COMMIT', (err) => {
        if (err) { db.run('ROLLBACK'); return res.status(500).json({ message: 'Deposit failed', error: err.message }); }
        res.json({ message: 'Deposit successful' });
      });
    });
  });
});

app.post('/api/withdraw', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { fromAccountId, amount } = req.body;
  if (amount <= 0) return res.status(400).json({ message: "Withdrawal amount must be positive" });
  const findAccountSql = 'SELECT * FROM accounts WHERE id = ? AND userId = ?';
  db.get(findAccountSql, [fromAccountId, userId], (err, account) => {
    if (err || !account) return res.status(404).json({ message: "Account not found or you do not own it." });
    if (account.balance < amount) return res.status(400).json({ message: "Insufficient funds" });
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      db.run('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, account.id]);
      db.run('INSERT INTO transactions (accountId, type, amount, description) VALUES (?, ?, ?, ?)', [account.id, 'DEBIT', amount, `Withdrawal`]);
      db.run('COMMIT', (err) => {
        if (err) { db.run('ROLLBACK'); return res.status(500).json({ message: 'Withdrawal failed', error: err.message }); }
        res.json({ message: 'Withdrawal successful' });
      });
    });
  });
});

app.post('/api/transfer', authenticateToken, (req, res) => {
  const senderUserId = req.user.id;
  const { fromAccountId, recipientUsername, amount } = req.body;
  if (amount <= 0) return res.status(400).json({ message: "Transfer amount must be positive" });
  const findSenderSql = 'SELECT * FROM accounts WHERE id = ? AND userId = ?';
  db.get(findSenderSql, [fromAccountId, senderUserId], (err, senderAccount) => {
    if (err || !senderAccount) return res.status(404).json({ message: "Sender account not found or you do not own it." });
    if (senderAccount.balance < amount) return res.status(400).json({ message: "Insufficient funds" });
    const findRecipientSql = `SELECT a.* FROM accounts a JOIN users u ON a.userId = u.id WHERE u.username = ? LIMIT 1`;
    db.get(findRecipientSql, [recipientUsername], (err, recipientAccount) => {
      if (err || !recipientAccount) return res.status(404).json({ message: "Recipient user not found" });
      if (senderAccount.id === recipientAccount.id) return res.status(400).json({ message: "Cannot send money to yourself" });
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        db.run('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, senderAccount.id]);
        db.run('INSERT INTO transactions (accountId, type, amount, description) VALUES (?, ?, ?, ?)', [senderAccount.id, 'DEBIT', amount, `To: ${recipientUsername}`]);
        db.run('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, recipientAccount.id]);
        db.run('INSERT INTO transactions (accountId, type, amount, description) VALUES (?, ?, ?, ?)', [recipientAccount.id, 'CREDIT', amount, `From: ${req.user.username}`]);
        db.run('COMMIT', (err) => {
          if (err) { db.run('ROLLBACK'); return res.status(500).json({ message: 'Transaction failed', error: err.message }); }
          res.json({ message: 'Transfer successful' });
        });
      });
    });
  });
});


// --- Appointment Routes ---
app.get('/api/appointments', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const sql = 'SELECT id, service, date, time, status FROM appointments WHERE userId = ? ORDER BY date DESC, time DESC';
  db.all(sql, [userId], (err, appointments) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(appointments);
  });
});

app.post('/api/appointments', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { service, date, time } = req.body;
  if (!service || !date || !time) {
    return res.status(400).json({ message: "Service, date, and time are required." });
  }
  const sql = 'INSERT INTO appointments (userId, service, date, time) VALUES (?, ?, ?, ?)';
  db.run(sql, [userId, service, date, time], function (err) {
    if (err) return res.status(500).json({ message: err.message });
    res.status(201).json({ message: 'Appointment scheduled successfully', id: this.lastID });
  });
});

// --- NEW: Delete Appointment ---
app.delete('/api/appointments/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const appointmentId = req.params.id;
  // Verify user owns this appointment before deleting
  const sql = 'DELETE FROM appointments WHERE id = ? AND userId = ?';
  db.run(sql, [appointmentId, userId], function(err) {
    if (err) return res.status(500).json({ message: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ message: "Appointment not found or you do not own it" });
    }
    res.json({ message: "Appointment cancelled successfully" });
  });
});


// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});