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
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods",  "POST, GET, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Credentials",  false);
  res.setHeader("Access-Control-Max-Age", '86400'); // 24 hours
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, x-api-key, x-data-filters");
      
  if (req.method === 'OPTIONS') {
      var headers = {};
      // IE8 does not allow domains to be specified, just the *
      // headers["Access-Control-Allow-Origin"] = req.headers.origin;
      headers["Access-Control-Allow-Origin"] = "*";
      headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
      headers["Access-Control-Allow-Credentials"] = false;
      headers["Access-Control-Max-Age"] = '86400'; // 24 hours
      headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, x-api-key, x-data-filters";
      res.writeHead(200, headers);
      res.end();  
  }
  else {
    if (req.headers['x-api-key'] === undefined) {
      if (req.url === '/user/auth' || req.url === '/user/auth/' || req.url === '/data' || req.url === '/data/' || req.url === '/user/validate'
        || ((req.url === '/data/categories' || req.url === '/data/categories/') && req.method === 'GET')) {
        next();
      }
      else if ((req.url === '/user' || req.url === '/user/')) {// && req.method === 'POST'
        next();
      }
      else {
        console.log(req.body);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.write(`{"status": "401", "message":"Auth required"}`);
        res.end();
      }
    }
    else {
      con.query(`SELECT * FROM users WHERE apiKey like '${req.headers['x-api-key']}'`, function (err, result) {
        if (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.write(`{"status": "400", "message":"Bad request"}`);
          res.end();
        }
        else {
          if (result.length === 0) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.write(`{"status": "401", "message":"Unauthorized access"}`);
            res.end();
          }
          else {
            if (result[0].validated === 0) {
              res.writeHead(403, { 'Content-Type': 'application/json' });
              res.write(`{"status": "403", "message":"Forbidden access! Validation required"}`);
              res.end();
            }
            else {
              next();
            }
          }
        }
      });
    }
  }
});

userController(app, con);
dataController(app, con);
transactionsController(app, con);

app.listen(port, function () {
  console.log('Datacoin app running, Listening on port: ' + port);
});