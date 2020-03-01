const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const mysql = require('mysql2/promise');

const dbConnectConfig = require('./configs/db');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Create db connections pool 
const dbPool  = mysql.createPool(dbConnectConfig);
// Set db pool globally
global.dbPool = dbPool;

// Include routes
app.use('/api', require('./routes/sensor'));

// Setup a default catch-all route that sends back a welcome message in JSON format.
app.get('*', (req, res) => res.status(200).send({
  message: 'Welcome to the beginning of nothingness.',
}));

const port = parseInt(process.env.PORT, 10) || 8000;
app.set('port', port);

const server = http.createServer(app);
server.listen(port);

module.exports = app;