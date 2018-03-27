var uuid = require('uuid/v4');
var apikey = require("apikeygen").apikey;
var md5 = require('md5');
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    auth: {
        type: "OAuth2",
        user: "datamarket2018@gmail.com", // Your gmail address.
        clientId: "320851868397-figedb8e72d70bjbjegktg75ipeaa0rb.apps.googleusercontent.com",
        clientSecret: "Tb3VJCWnFMZ6BpnzT39pExgB",
        refreshToken: "1/J1pPiiCDmBrs78AxlUrDzEQ_z8ItxGX9FyIy-3YsPws"
    }
});

module.exports = function (app, con) {
    app.post('/user/auth', function (req, res) {
        if (req.body.username !== undefined && req.body.password !== undefined) {
            con.query(`SELECT * FROM users WHERE username like '${req.body.username}' and password like '${md5(req.body.password)}'`, function (err, result) {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.write(`{"status": "error", "message":"Internal Error"}`);
                    res.end();
                }
                else {
                    //If it is not available it is an unauthorized access
                    if (result.length === 0) {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.write(`{"status": "401", "message":"Unauthorized access"}`);
                        res.end();
                    }
                    else {
                        if (result[0].validated === 0) {
                            res.writeHead(422, { 'Content-Type': 'application/json' });
                            res.write(`{"status": "422", "message":"Validation required"}`);
                            res.end();
                        }
                        else {
                            var apiKey = apikey(30);
                            con.query(`UPDATE users SET apiKey = '${apiKey}' WHERE id = ${result[0].id}`, function (err, result) {
                                if (err) {
                                    res.writeHead(500, { 'Content-Type': 'application/json' });
                                    res.write(`{"status": "error", "message":"Internal Error"}`);
                                    res.end();
                                }
                                else {
                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.write(`{"status": "200", "x-api-key":"${apiKey}"}`);
                                    res.end();
                                }
                            });
                        }
                    }
                }
            });
        }
        else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.write(`{"status": "400", "message":"Malformed request"}`);
            res.end();
        }
    });

    app.get('/user/logout', function (req, res) {
        if (req.headers['x-api-key'] !== undefined) {
            con.query(`SELECT * FROM users WHERE apiKey like ${req.headers['x-api-key']}'`, function (err, result) {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.write(`{"status": "error", "message":"Internal Error"}`);
                    res.end();
                }
                else {
                    //If it is not available it is an unauthorized access
                    if (result.length === 0) {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.write(`{"status": "401", "message":"Unauthorized access"}`);
                        res.end();
                    }
                    else {
                        var apiKey = apikey(30);
                        con.query(`UPDATE users SET apiKey = '${apiKey}' WHERE id = ${result[0].id}`, function (err, result) {
                            if (err) {
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.write(`{"status": "error", "message":"Internal Error"}`);
                                res.end();
                            }
                            else {
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.write(`{"status": "200", "message":"Logged out successfully"}`);
                                res.end();
                            }
                        });
                    }
                }
            });
        }
        else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.write(`{"status": "400", "message":"Malformed request"}`);
            res.end();
        }
    });

    app.post('/user/validate', function (req, res) {
        if (req.body.validationKey !== undefined && req.body.validationKey !== ''
            && req.body.email !== undefined && req.body.email !== '') {
            con.query(`SELECT * FROM users WHERE apiKey like '${req.body.validationKey}' and email like '${req.body.email}'`, function (err, result) {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.write(`{"status": "error", "message":"Internal Error"}`);
                    res.end();
                }
                else {
                    //If it is not available it is an unauthorized access
                    if (result.length === 0) {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.write(`{"status": "401", "message":"Unauthorized access"}`);
                        res.end();
                    }
                    else {
                        //Else update the user associated with the API KEY
                        var apiKey = apikey(30);
                        con.query(`UPDATE users SET apiKey = '${apiKey}', validated = 1 WHERE id = ${result[0].id}`, function (err, result) {
                            if (err) {
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.write(`{"status": "error", "message":"Internal Error"}`);
                                res.end();
                            }
                            else {
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.write(`{"status": "200", "message":"Account validated successfully. Now you can login using your username and password"}`);
                                res.end();
                            }
                        });
                    }
                }
            });
        }
        else if (req.body.username !== undefined && req.body.username !== ''
            && req.body.password !== undefined && req.body.password !== '') {
            con.query(`SELECT * FROM users WHERE username like '${req.body.username}' and password like '${md5(req.body.password)}'`, function (err, result) {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.write(`{"status": "error", "message":"Internal Error"}`);
                    res.end();
                }
                else {
                    //If it is not available it is an unauthorized access
                    if (result.length === 0) {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.write(`{"status": "401", "message":"Unauthorized access"}`);
                        res.end();
                    }
                    else {
                        //Else update the user associated with the API KEY
                        var apiKey = apikey(30);
                        var toEmail = `"${result[0].email}"`;
                        con.query(`UPDATE users SET apiKey = '${apiKey}', validated = 1 WHERE id = ${result[0].id}`, function (err, result) {
                            if (err) {
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.write(`{"status": "error", "message":"Internal Error"}`);
                                res.end();
                            }
                            else {
                                //Send an email confirmation include the link
                                var mailOptions = {
                                    from: "Data Market <datamarket2018@gmail.com>",
                                    to: toEmail,
                                    subject: "Activate your account",
                                    generateTextFromHTML: true,
                                    html: `<h3>Welcome to The Data Market:</h3>
                                    Activation Key: ${apiKey}<br/>
                                    Please visit this link and paste your activation key: http://datacoin.iptvclient.com/activate.html`
                                };
                                transporter.sendMail(mailOptions, function (error, response) {
                                    if (error) {
                                        res.writeHead(500, { 'Content-Type': 'application/json' });
                                        res.write(`{"status": "500", "message":"Internal Error"}`);
                                        res.end();
                                    }
                                    else {
                                        res.writeHead(200, { 'Content-Type': 'application/json' });
                                        res.write(`{"status": "200", "message":"New validation email sent, check your inbox"}`);
                                        res.end();
                                    }
                                    transporter.close();
                                });
                            }
                        });
                    }
                }
            });
        }
        else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.write(`{"status": "400", "message":"Required parameters missing"}`);
            res.end();
        }
    });

    app.get('/user/validate', function (req, res) {
        con.query(`SELECT * FROM users WHERE email like '${req.headers['x-user-email']}'`, function (err, result) {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.write(`{"status": "error", "message":"Internal Error"}`);
                res.end();
            }
            else {
                //If it is not available it is an unauthorized access
                if (result.length === 0) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.write(`{"status": "401", "message":"Unauthorized access. Email does not exist"}`);
                    res.end();
                }
                else {
                    //Else update the user associated with the API KEY
                    var apiKey = apikey(30);
                    var toEmail = `"${result[0].email}"`;
                    con.query(`UPDATE users SET apiKey = '${apiKey}' WHERE id = ${result[0].id}`, function (err, result) {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.write(`{"status": "error", "message":"Internal Error"}`);
                            res.end();
                        }
                        else {
                            //Send an email confirmation include the link
                            var mailOptions = {
                                from: "Data Market <datamarket2018@gmail.com>",
                                to: toEmail,
                                subject: "Activate your account",
                                generateTextFromHTML: true,
                                html: `<h3>Welcome back to The Data Market:</h3>
                                Activation Key:<br/> ${apiKey}<br/>
                                Please visit this link and paste your activation key: <a href="http://localhost/activate.html"></a>`
                            };

                            transporter.sendMail(mailOptions, function (error, response) {
                                if (error) {
                                    res.writeHead(500, { 'Content-Type': 'application/json' });
                                    res.write(`{"status": "error", "message":"Internal Error"}`);
                                    res.end();
                                }
                                else {
                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.write(`{"status": "200", "message":"New Activation email sent"}`);
                                    res.end();
                                }
                                //transporter.close();
                            });

                        }
                    });
                }
            }
        });
    });

    app.get('/user', function (req, res) {
        con.query(`SELECT * FROM users WHERE apiKey like '${req.headers['x-api-key']}'`, function (err, result) {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.write(`{"status": "error", "message":"Internal Error"}`);
                res.end();
            }
            else {
                //If it is not available it is an unauthorized access
                if (result.length === 0) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.write(`{"status": "401", "message":"Unauthorized access"}`);
                    res.end();
                }
                else {
                    if (result[0].validated === 0) {
                        res.writeHead(422, { 'Content-Type': 'application/json' });
                        res.write(`{"status": "422", "message":"Validation required"}`);
                        res.end();
                    }
                    else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.write(`{"status": "200","user":{
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
            }
        });
    });

    app.post('/user', function (req, res) {//requires
        if ((req.body.username !== undefined && req.body.username !== "")
            && (req.body.password !== undefined && req.body.password !== "")
            && (req.body.email !== undefined && req.body.email !== "")
            && (req.body.country !== undefined && req.body.country !== "")
            && (req.body.province !== undefined && req.body.province !== "")
            && (req.body.city !== undefined && req.body.city !== "")
            && (req.body.yearOfBirth !== undefined && req.body.yearOfBirth !== "")) {
            con.query(`SELECT * FROM users WHERE email like '${req.body.email}' OR username like '${req.body.username}'`, function (err, result) {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.write(`{"status": "error", "message":"Internal Error"}`);
                    res.end();
                }
                else {
                    if (result.length > 0) {
                        res.writeHead(409, { 'Content-Type': 'application/json' }); // 409 Conflict
                        res.write(`{"status": "409", "message":"Username or Email already registered"}`);
                        res.end();
                    } //End IF : if the email is already registered
                    else {
                        var uid = uuid();// a unique id is generated
                        var apiKey = apikey(30);
                        var toEmail = `"${result[0].email}"`;
                        con.query(`INSERT INTO users (username, password, email, uuid, apiKey, country, city, province, yearOfBirth) VALUES ("${req.body.username}", "${md5(req.body.password)}", "${req.body.email}", "${uid}","${apiKey}", "${req.body.country}", "${req.body.city}", "${req.body.province}", ${req.body.yearOfBirth})`, function (err, result) {
                            if (err) {
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.write(`{"status": "error", "message":"Internal Error"}`);
                                res.end();
                            }
                            else {
                                //Send an email confirmation include the link
                                var mailOptions = {
                                    from: "Data Market <datamarket2018@gmail.com>",
                                    to: toEmail,
                                    subject: "Activate your account",
                                    generateTextFromHTML: true,
                                    html: `<h3>Welcome to The Data Market:</h3>
                                    Activation Key: ${apiKey}<br/>
                                    Please visit this link and paste your activation key: <a href="http://localhost/activate.html"></a>`
                                };
                                transporter.sendMail(mailOptions, function (error, response) {
                                    if (error) {
                                        console.log(error);
                                    }
                                    transporter.close();
                                });


                                res.writeHead(201, { 'Content-Type': 'application/json' });
                                res.write(`{"status": "201", "message":"Created successfully"}`);
                                res.end();
                            }
                        });


                    } // Else the user is added
                }
            });
        }
        else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.write(`{"status": "400", "message":"Required parameters are missing"}`);
            res.end();
        }
    });

    app.put('/user', function (req, res) {
        if ((req.body.username !== undefined && req.body.username !== "")
            && (req.body.password !== undefined && req.body.password !== "")
            && (req.body.email !== undefined && req.body.email !== "")
            && (req.body.country !== undefined && req.body.country !== "")
            && (req.body.province !== undefined && req.body.province !== "")
            && (req.body.city !== undefined && req.body.city !== "")
            && (req.body.yearOfBirth !== undefined && req.body.yearOfBirth !== "")) {
            //Check if API key is available in the database
            con.query(`SELECT * FROM users WHERE apiKey like '${req.headers['x-api-key']}'`, function (err, result) {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.write(`{"status": "error", "message":"Internal Error"}`);
                    res.end();
                }
                else {
                    //If it is not available it is an unauthorized access
                    if (result.length === 0) {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.write(`{"status": "401", "message":"Unauthorized access"}`);
                        res.end();
                    }
                    else { //Else update the user associated with the API KEY
                        con.query(`UPDATE users SET username ="${req.body.username}", password = "${md5(req.body.password)}", email = "${req.body.email}", country = "${req.body.country}" , city = "${req.body.city}" , province = "${req.body.province}", yearOfBirth = ${req.body.yearOfBirth} WHERE apiKey like '${req.headers['x-api-key']}'`, function (err, result) {
                            if (err) {
                                res.writeHead(409, { 'Content-Type': 'application/json' });
                                res.write(`{"status": "error", "message":"Cannot be completed"}`);
                                res.end();
                            }
                            else {
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.write(`{"status": "200", "message":"Updated successfully"}`);
                                res.end();
                            }
                        });
                    }
                }
            });
        } else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.write(`{"status": "400", "message":"Required parameters are missing. Make sure to enter your password"}`);
            res.end();
        }
    });

}