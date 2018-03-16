var uuid = require('uuid/v4');
var apikey = require("apikeygen").apikey;
var md5 = require('md5');

module.exports = function (app, con) {
    app.post('/user/auth', function (req, res) {
        con.query(`SELECT * FROM users WHERE username like '${req.body.username}' and password like '${md5(req.body.password)}'`, function (err, result) {
            if (err)
                throw err;
            else {
                //If it is not available it is an unauthorized access
                if (result.length === 0) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.write(`{"status": "401", "message":"Unauthorized access"}`);
                    res.end();
                }
                else { //Else update the user associated with the API KEY
                    var apiKey = apikey(30);
                    con.query(`UPDATE users SET apiKey = '${apiKey}' WHERE id = ${result[0].id}`,function(err, result){
                        if(err)
                            throw err;
                        else{
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.write(`{"status": "200", "x-api-key":"${apiKey}"}`);
                            res.end();
                        }
                    });
                }
            }
        });
    });

    app.get('/user', function (req, res) {
        con.query(`SELECT * FROM users WHERE apiKey like '${req.headers['x-api-key']}'`, function (err, result) {
            if (err)
                throw err;
            else {
                //If it is not available it is an unauthorized access
                if (result.length === 0) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.write(`{"status": "401", "message":"Unauthorized access"}`);
                    res.end();
                }
                else { //Else update the user associated with the API KEY
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.write(`{"status": "200", 
                                  "user":{
                                    "username":"${result[0].username}",
                                    "email":"${result[0].email}",
                                    "uuid":"${result[0].uuid}",
                                    "country":"${result[0].country}",
                                    "city":"${result[0].city}",
                                    "province":"${result[0].province}",
                                    "birth":${result[0].yearOfBirth}}}`);
                    res.end();
                }
            }
        });
    });

    app.post('/user', function (req, res) {//requires
        con.query(`SELECT * FROM users WHERE email like '${req.body.email}'`, function (err, result) {
            if (err)
                throw err;
            else {
                if (result.length > 0) {
                    res.writeHead(409, { 'Content-Type': 'application/json' }); // 409 Conflict
                    res.write(`{"status": "409", "message":"Email already registered"}`);
                    res.end();
                } //End IF : if the email is already registered
                else {
                    var uid = uuid();// a unique id is generated
                    con.query(`INSERT INTO users (username, password, email, uuid, apiKey) VALUES ("${req.body.username}", "${md5(req.body.password)}", "${req.body.email}", "${uid}","${apikey(30)}")`, function (err, result) {
                        if (err)
                            throw err;
                        else {
                            res.writeHead(201, { 'Content-Type': 'application/json' });
                            res.write(`{"status": "201", "message":"Created successfully"`);
                            res.end();
                        }
                    });
                } // Else the user is added
            }
        });
    });

    app.put('/user', function (req, res) {
        //Check if API key is available in the database
        con.query(`SELECT * FROM users WHERE apiKey like '${req.headers['x-api-key']}'`, function (err, result) {
            if (err)
                throw err;
            else {
                //If it is not available it is an unauthorized access
                if (result.length === 0) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.write(`{"status": "401", "message":"Unauthorized access"}`);
                    res.end();
                }
                else { //Else update the user associated with the API KEY
                    con.query(`UPDATE users SET username ="${req.body.username}" AND password = "${req.body.password}" AND email = "${req.body.email}" AND country = "${req.body.country}" AND city = "${req.body.city}" AND province = "${req.body.province}" AND yearOfBirth = ${req.body.yearOfBirth} WHERE apiKey like '${req.headers['x-api-key']}'`, function (err, result) {
                        if (err)
                            throw err;
                        else {
                            res.writeHead(201, { 'Content-Type': 'application/json' });//201
                            res.write(`{"status": "200", "message":"Updated successfully"}`);
                            res.end();
                        }
                    });
                }
            }
        });
    });

}