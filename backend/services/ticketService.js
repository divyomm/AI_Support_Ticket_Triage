const db = require('../db');
const { analyzeTicket } = require('../analyzer');

class TicketService {
  async processTicket(message) {
    if (!message || typeof message !== 'string' || message.trim() === '') {
      throw new Error('Message is required and must be a non-empty string.');
    }

    // 1. Analyze the text payload
    const analysisResult = analyzeTicket(message);
    const { category, priority, urgency, keywords, signals, confidence } = analysisResult;
    
    // Convert arrays back to string for sqlite
    const keywordsStr = keywords.join(', ');
    const signalsStr = JSON.stringify(signals);

    // 2. Persist in database
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO tickets (message, category, priority, urgency, keywords, signals, confidence_score) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const params = [message, category, priority, urgency, keywordsStr, signalsStr, confidence];

      db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            message,
            category,
            priority,
            urgency,
            keywords,
            signals,
            confidence
          });
        }
      });
    });
  }

  async getAllTickets() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM tickets ORDER BY created_at DESC`;
      db.all(sql, [], (err, rows) => {
        if (err) {
          return reject(err);
        }
        
        // Parse parsed fields back to appropriate format
        const formattedRows = rows.map(row => {
          let parsedSignals = [];
          try {
            parsedSignals = row.signals ? JSON.parse(row.signals) : [];
          } catch (e) {
            parsedSignals = [];
          }

          return {
            ...row,
            urgency: row.urgency === 1,
            keywords: row.keywords ? row.keywords.split(',').map(k => k.trim()) : [],
            signals: parsedSignals
          };
        });
        
        resolve(formattedRows);
      });
    });
  }
}

module.exports = new TicketService();
