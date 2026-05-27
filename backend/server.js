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