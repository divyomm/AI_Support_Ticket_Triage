import { useState, useEffect } from 'react';
import './index.css';

const API_BASE = 'http://localhost:3000';

function App() {
  const [ticketMessage, setTicketMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Fetch history on load
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/tickets`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch ticket history:', error);
    }
  };

  const submitTicket = async (e) => {
    e.preventDefault();
    if (!ticketMessage.trim()) return;

    setLoading(true);
    setCurrentResult(null);

    try {
      const res = await fetch(`${API_BASE}/tickets/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: ticketMessage })
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentResult(data);
        setTicketMessage('');
        fetchHistory();
      } else {
        alert('Failed to analyze ticket.');
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert('Network error. Is backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>AI Support Ticket Triage</h1>
      
      <form onSubmit={submitTicket}>
        <textarea 
          rows="5"
          placeholder="Describe your issue here... (e.g., 'I want a refund' or 'My account is hacked')"
          value={ticketMessage}
          onChange={(e) => setTicketMessage(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !ticketMessage.trim()}>
          {loading ? 'Analyzing...' : 'Submit Ticket'}
        </button>
      </form>

      {currentResult && (
        <div className="result-panel">
          <h2>Analysis Result</h2>
          <div className="result-item"><strong>Category:</strong> {currentResult.category}</div>
          <div className="result-item">
            <strong>Priority:</strong> 
            <span className={`badge ${currentResult.priority.toLowerCase()}`}>
              {currentResult.priority}
            </span>
          </div>
          <div className="result-item"><strong>Urgent:</strong> {currentResult.urgency ? '🚨 Yes' : 'No'}</div>
          <div className="result-item"><strong>Keywords:</strong> {currentResult.keywords.join(', ') || 'None'}</div>
          <div className="result-item"><strong>Confidence Score:</strong> {(currentResult.confidence * 100).toFixed(0)}%</div>
          
          <div className="result-item signals-box">
            <strong>Engine Signals:</strong>
            <ul>
              {currentResult.signals && currentResult.signals.map((signal, idx) => (
                <li key={idx}>{signal}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="history-section">
        <h2>Recent Tickets</h2>
        {history.length === 0 ? (
          <p>No tickets analyzed yet.</p>
        ) : (
          history.map(ticket => (
            <div key={ticket.id} className="ticket-card">
              <div className="ticket-header">
                <span className={`badge ${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
                <span><strong>{ticket.category}</strong> {ticket.urgency ? '🚨' : ''}</span>
              </div>
              <p className="ticket-message">"{ticket.message}"</p>
              
              <div className="ticket-meta">
                <small>Conf: {(ticket.confidence_score * 100).toFixed(0)}% | Keywords: {ticket.keywords.join(', ')}</small>
                {ticket.signals && ticket.signals.length > 0 && (
                  <div className="signals-meta">
                    <small><strong>Signals:</strong> {ticket.signals.join(' | ')}</small>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
