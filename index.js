const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const mysql = require("mariadb");
const path = require("path");

const dbConnectConfig = require("./configs/db");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const cors = require("cors");
app.use(cors());
app.use(function(req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader("Access-Control-Allow-Headers", "origin, content-type, accept");

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

// Create db connections pool
const dbPool = mysql.createPool(dbConnectConfig);
// Set db pool globally
global.dbPool = dbPool;

// Include routes
app.use("/api", require("./routes/sensor"));

// Include static files
app.use(express.static(path.join(__dirname, "client/nodemcu-front/build")));

// Setup a default catch-all route that sends back a welcome message in JSON format.
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "client/nodemcu-front/build", "index.html"))
);

const port = parseInt(process.env.PORT, 10) || 8000;
app.set("port", port);

const server = http.createServer(app);
server.listen(port);

module.exports = app;
