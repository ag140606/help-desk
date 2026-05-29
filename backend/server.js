//Import frameworks
const express = require('express');
const cors = require('cors');
//CORS (Cross-Origin Resource Sharing) is a security mechanism built into web browsers. 
//It allows a server to explicitly state which external websites (domains) are permitted to load or request 
//its data, ensuring that malicious sites cannot secretly steal a user's sensitive information. 
//Required since frontend and backend are on different ports. 
const { MongoClient } = require('mongodb');           //MongoDB connection

const app = express();                          //Create Express instance
app.use(cors());                                //Enable CORS
app.use(express.json());                        //JSON is parsed and ready to use

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
let tickets;

async function connectDB() {
  await client.connect();
  const db = client.db('help-desk');
  tickets = db.collection('tickets');
  console.log('Connected to MongoDB');
}

connectDB();

app.get('/tickets', async (req, res) => {
  try {
    const all = await tickets.find().toArray();
    res.json(all);
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.get('/tickets/:id', async (req, res) => {
  try {
    const ticket = await tickets.findOne({ id: req.params.id });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.post('/tickets', async (req, res) => {
  try {
    const { title, body, priority, user_email } = req.body;
    if (!title || !body || !priority || !user_email) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const count = await tickets.countDocuments();
    const newTicket = { id: 'HD-' + (count + 1001), title, body, priority, user_email };
    await tickets.insertOne(newTicket);
    res.status(201).json(newTicket);
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.listen(4000, () => console.log('Backend running on http://localhost:4000'));