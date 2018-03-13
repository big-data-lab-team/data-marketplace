var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var con = require('./controllers/mysql.js');
var app = express();

var userController = require('./controllers/user');
var dataController = require('./controllers/data');
var transactionsController = require('./controllers/transactions');

var port = process.env.PORT || 3000;

//app.use('/assets', express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/', function (req, res, next) {
  if(req.headers['x-api-key'] === undefined){
    if(req.url === '/user/auth'){
      next();
    }
    else{
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.write(`{"status": "error", "message":"Login required"}`);
      res.end();
    }
  }
  else{
    next();
  }
});

userController(app, con);
dataController(app, con);
transactionsController(app, con);

app.listen(port);