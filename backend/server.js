const express = require('express');
const cors = require('cors');
const ticketController = require('./controllers/ticketController');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Main logical endpoints handled by the controller
app.post('/tickets/analyze', ticketController.analyzeTicket);
app.get('/tickets', ticketController.getTickets);

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
