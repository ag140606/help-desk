//Import frameworks
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const {
  Ticket,
  validateTicket,
  buildTicketDocument,
} = require('./data/schema');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/help-desk')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/tickets', async (req, res) => {
  try {
    const all = await Ticket.find();
    res.json(all);
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.get('/tickets/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.post('/tickets', async (req, res) => {
  try {
    const validation = validateTicket(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
    }
    const newTicket = buildTicketDocument(req.body);
    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.delete('/tickets/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.status(200).json({ message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.listen(4000, () => console.log('Backend running on http://localhost:4000'));
