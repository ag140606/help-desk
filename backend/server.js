//Import frameworks
const express = require('express');
const cors = require('cors'); 
//CORS (Cross-Origin Resource Sharing) is a security mechanism built into web browsers. 
//It allows a server to explicitly state which external websites (domains) are permitted to load or request 
//its data, ensuring that malicious sites cannot secretly steal a user's sensitive information. 
//Required since frontend and backend are on different ports. 
const fs = require('fs');       //For file handling

const app = express();              //Create Express instance
app.use(cors());                    //Enable CORS
app.use(express.json());            //JSON is parsed and ready to use

const { tickets } = JSON.parse(fs.readFileSync('../_data/db.json', 'utf-8'));

app.get('/tickets', (req, res) => { 
    res.json(tickets); 
});

app.listen(4000, () => console.log('Backend running on http://localhost:4000'));

app.get('/tickets/:id', (req, res) => {
  const ticket = tickets.find(t => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket);
});

//For adding new tickets
const path = require('path');
const dbPath = path.join(__dirname, '../_data/db.json');


//Try-catch
app.post('/tickets', (req, res) => {
  try {
    const { title, body, priority, user_email } = req.body;
    //Check entered fields
    if (!title || !body || !priority || !user_email) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const newTicket = {
      id: 'HD-' + (tickets.length + 1001), title, body, priority, user_email
    }
    tickets.push(newTicket);
    // Writing back to db.json
    fs.writeFileSync(dbPath, JSON.stringify({ tickets }, null, 2));
    res.status(201).json(newTicket);          //Check this line
  } catch (error) {
      res.status(500).json({ error });
  }
  

  
});