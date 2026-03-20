const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
const dbPath = path.resolve(__dirname, 'tickets.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create tickets table with signals column
    db.run(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT,
        category TEXT,
        priority TEXT,
        urgency BOOLEAN,
        keywords TEXT,
        signals TEXT,
        confidence_score REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add signals column if missing (for existing db upgrade)
    db.run(`ALTER TABLE tickets ADD COLUMN signals TEXT`, (err) => {
      // Ignore if column already exists
    });
  }
});

module.exports = db;
