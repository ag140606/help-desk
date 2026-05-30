//Import frameworks
const express = require('express');
const cors = require('cors');
//CORS (Cross-Origin Resource Sharing) is a security mechanism built into web browsers. 
//It allows a server to explicitly state which external websites (domains) are permitted to load or request 
//its data, ensuring that malicious sites cannot secretly steal a user's sensitive information. 
//Required since frontend and backend are on different ports. 
const { MongoClient, ObjectId } = require('mongodb');           //MongoDB connection
const { dbConfig, validateTicket, buildTicketDocument } = require('./data/schema');

const app = express();                          //Create Express instance
app.use(cors());                                //Enable CORS
app.use(express.json());                        //JSON is parsed and ready to use

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
let tickets;

async function connectDB() {
  await client.connect();
  const db = client.db(dbConfig.name);
  tickets = db.collection(dbConfig.collections.tickets);
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
    const ticket = await tickets.findOne({ _id: new ObjectId(req.params.id) });
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
    const result = await tickets.insertOne(newTicket);
    res.status(201).json({ _id: result.insertedId, ...newTicket });
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.delete('/tickets/:id', async (req, res) => {
  try {
    const result = await tickets.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.status(200).json({ message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.listen(4000, () => console.log('Backend running on http://localhost:4000'));
