var uuid = require('uuid/v4');

module.exports = function (app, con) {
    app.post('/user/auth', function (req, res) {
        con.query(`SELECT * FROM users WHERE username like '${req.body.username}' and password like '${req.body.password}'`, function (err, result) {
            if (err)
                throw err;
            else {
                //If it is not available it is an unauthorized access
                if (result.length === 0) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.write(`{"status": "error", "message":"Unauthorized access"}`);
                    res.end();
                }
                else { //Else update the user associated with the API KEY
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.write(`{"status": "ok", 
                                  "x-api-key":"${result[0].apiKey}"}`);
                    res.end();
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
                    res.write(`{"status": "error", "message":"Unauthorized access"}`);
                    res.end();
                }
                else { //Else update the user associated with the API KEY
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.write(`{"status": "ok", 
                                  "user":{
                                    "username":"${result[0].username}",
                                    "password":"${result[0].password}",
                                    "email":"${result[0].email}",
                                    "uuid":"${result[0].uuid}"}}`);
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
                    res.write(`{"status": "error", "message":"Email already registered"}`);
                    res.end();
                } //End IF : if the email is already registered
                else {
                    var uid = uuid();// a unique id is generated
                    con.query(`INSERT INTO users (username, password, email, uuid, apiKey) VALUES ("${req.body.username}", "${req.body.password}", "${req.body.email}", "${uid}","${uid}")`, function (err, result) {
                        if (err)
                            throw err;
                        else {
                            res.writeHead(201, { 'Content-Type': 'application/json' });
                            res.write(`{"status": "ok", "message":"Created successfully", "uuid":"${uid}"}`);
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
                    res.write(`{"status": "error", "message":"Unauthorized access"}`);
                    res.end();
                }
                else { //Else update the user associated with the API KEY
                    con.query(`UPDATE users SET username ="${req.body.username}" AND password = "${req.body.password}" AND email = "${req.body.email}" WHERE apiKey like '${req.headers['x-api-key']}'`, function (err, result) {
                        if (err)
                            throw err;
                        else {
                            res.writeHead(201, { 'Content-Type': 'application/json' });//201
                            res.write(`{"status": "ok", "message":"Updated successfully"}`);
                            res.end();
                        }
                    });
                }
            }
        });
    });

}