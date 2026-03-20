const ticketService = require('../services/ticketService');

class TicketController {
  
  async analyzeTicket(req, res) {
    try {
      const { message } = req.body;
      const result = await ticketService.processTicket(message);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error in analyzeTicket:', error.message);
      if (error.message.includes('Message is required')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Database or server error occurred' });
      }
    }
  }

  async getTickets(req, res) {
    try {
      const tickets = await ticketService.getAllTickets();
      res.status(200).json(tickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      res.status(500).json({ error: 'Database or server error occurred' });
    }
  }

}

module.exports = new TicketController();
