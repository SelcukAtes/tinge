const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const mysql = require('mysql');
var mysqlDB = mysql.createConnection({
  host     : '*',
  user     : 'root',
  password : process.env.PASSWORD,
  database : process.env.DATABASE,
  socketPath: process.env.SOCKETPATH,
  connectTimeout: 60000
});
//test connection, will properly handle the route through app.get or some other route:
mysqlDB.connect();
//console.log('env', process.env.PASSWORD);
mysqlDB.query('SELECT * FROM users;', (err, rows, fields) => {
  console.log('rows', rows);
  if (err) throw err
  console.log('The user is: ', rows[0].username);
})

mysqlDB.end()

const Users = require('./controllers/Users');
const tokenService = require('./services/TokenService');
const authService = require('./services/AuthService');

// Create connection to Mongo DB via Mongoose
// mongoose.connect(process.env.DB_URI);
mongoose.connection.once('open', () => console.log('Hello from tinge-db!'));
mongoose.Promise = global.Promise;

// Configure Express Application Server
const app = express();
const PORT = process.env.PORT || 8080;

// Set up body-parser for processing form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Enable CORS to allow different hosts to connect to our server
app.use(cors());

// Middleware to parse tokens out of incoming request headers
app.use(tokenService.receiveToken);

// Dummy Route
app.get('/', (req, res) => {
  res.send('Hello Brit');
});

// Dummy Restricted Route
app.get('/restricted', authService.restrict(), (req, res) => {
  res.json({ tokenData: res.locals.tokenData });
});

// Signup Route
app.post('/signup', Users.createUser, tokenService.createToken, (req, res) => {
  res.json({ token: res.locals.token, palettes: res.locals.palettes });
});

//Login Route
app.post('/login', Users.login, tokenService.createToken, (req, res) => {
  res.json({ token: res.locals.token, palettes: res.locals.palettes });
});

//Generate Palette Route
app.post('/generatePalette', Users.generatePalette, (req, res) => {
  
});

//Save Palette Route
app.post('/savePalette', authService.restrict(), Users.savePalette, tokenService.createToken, (req, res) => {
  res.json( { token: res.locals.token, palettes: res.locals.palettes });
});

//Delete Palette Route
app.delete('/deletePalette/:palette_id', authService.restrict(), Users.deletePalette, tokenService.createToken, (req, res) => {
  res.json({token: res.locals.token, palettes: res.locals.palettes})
});

// Start server
app.listen(PORT, () => console.log('Server started on port', PORT));
