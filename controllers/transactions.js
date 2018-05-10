module.exports = function (app, con) {
    app.get('/transactions', function (req, res) {
        con.query(`SELECT * FROM users WHERE apiKey like '${req.headers['x-api-key']}'`, function (err, result) {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.write(`{"status": "500", "message":"Internal Error"}`);
                res.end();
            }
            else {
                //If it is not available it is an unauthorized access
                if (result.length === 0) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.write(`{"status": "error", "message":"Unauthorized access"}`);
                    res.end();
                }
                else {
                    var query = `SELECT transactions.id, transactions.requester_uuid , users.uuid AS receiver_uuid, transactions.status, transactions.timestamp, data.id as data_id, data.name, data.price, categories.name AS category_name FROM transactions INNER JOIN data on data.id = transactions.data_id INNER JOIN categories ON data.category_id = categories.id INNER JOIN users on data.owner_id = users.id`;
                    if (req.headers['x-tx-filters'] !== undefined) {
                        var filters = JSON.parse(req.headers['x-tx-filters']);
                        if (filters['tx_id'] !== undefined) {
                            query += ` AND transactions.id = ${filters['tx_id']}`; //Filter by id
                        }
                        if (filters['requester_uuid'] !== undefined) {
                            query += ` AND transactions.requester_uuid = "${filters['requester_uuid']}"`; //Filter by requester
                        }
                        if (filters['receiver_uuid'] !== undefined) {
                            query += ` AND users.uuid = "${filters['receiver_uuid']}"`; //Filter by receiver
                        }
                        if (filters['status'] !== undefined) {
                            query += ` AND transactions.status = "${filters['status']}"`; //Filter by status
                        }
                        if (filters['data_id'] !== undefined) {
                            query += ` AND transactions.data_id = ${filters['data_id']}`; //Filter by data ID
                        }
                    }
                    con.query(query, function (err, result) {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.write(`{"status": "500", "message":"Internal Error"}`);
                            res.end();
                        }
                        else {
                            var arr = [];
                            for (let i = 0; i < result.length; i++) {
                                arr.push(`{"id":${result[i].id}, "requester_uuid":"${result[i].requester_uuid}", "receiver_uuid":"${result[i].receiver_uuid}", "status":"${result[i].status}","timestamp":"${result[i].timestamp}","data":{"id":${result[i].id},"name":"${result[i].name}","price":${result[i].price},"category_name":"${result[i].category_name}"}}`);
                            }
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.write(`{"status": "200", "transactions":[${arr}]}`);
                            res.end();
                        }
                    });
                }
            }
        });
    });

    app.post('/transactions', function (req, res) {
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
                    if(req.body.data_id !== undefined && req.body.data_id !== ''){
                    var requester_uuid = result[0].uuid;
                    con.query(`SELECT * FROM data WHERE id = ${req.body.data_id} AND owner_id <> ${result[0].id}`, function (err, result) {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.write(`{"status": "error", "message":"Internal Error"}`);
                            res.end();
                        }
                        else {
                            if (result.length > 0) {
                                con.query(`INSERT INTO transactions (requester_uuid, status,  data_id) VALUES ('${requester_uuid}','pending', ${req.body.data_id})`, function (err, result) {
                                    if (err) {
                                        res.writeHead(500, { 'Content-Type': 'application/json' });
                                        res.write(`{"status": "500", "message":"Internal Error"}`);
                                        res.end();
                                    }
                                    else {
                                        res.writeHead(201, { 'Content-Type': 'application/json' });
                                        res.write(`{"status": "201", "message":"Request Sent"}`);
                                        res.end();
                                    }
                                });
                            }
                            else {
                                res.writeHead(422, { 'Content-Type': 'application/json' });//Unprocessable entity
                                res.write(`{"status": "422", "message":"Request cannot be completed!"}`);
                                res.end();
                            }
                        }
                    });
                    }
                    else{
                        res.writeHead(400, { 'Content-Type': 'application/json' });//Unprocessable entity
                        res.write(`{"status": "400", "message":"Request error!."}`);
                        res.end();
                    }
                }
            }
        });
    });
    //This can be removed
    app.get('/transactions/status', function (req, res) {
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
                    res.write(`{"status": "error", "message":"Unauthorized access"}`);
                    res.end();
                }
                else {
                    con.query(`SELECT status FROM transactions WHERE id = ${req.headers['x-tx-id']}`, function (err, result) {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.write(`{"status": "error", "message":"Internal Error"}`);
                            res.end();
                        }
                        else {
                            res.writeHead(201, { 'Content-Type': 'application/json' });
                            res.write(`{"status": "${result[0].status}"}`);
                            res.end();
                        }
                    });
                }
            }
        });
    });

    app.put('/transactions/status', function (req, res) {
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
                    res.write(`{"status": "error", "message":"Unauthorized access"}`);
                    res.end();
                }
                else {//Else 2
                    var useruuid = result[0].uuid;
                    con.query(`SELECT * FROM transactions WHERE id = ${req.body.id}`, function (err, result) {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.write(`{"status": "error", "message":"Internal Error"}`);
                            res.end();
                        }
                        else {
                            //If the user is the transaction requester he can only update to data validated
                            //If the user is the owner he can update to Accepted, Rejected, Sample Uploaded
                            //If the user is the service he can update to funds on hold, Data transferred
                            //If the user is the manager he can update to completed
                            if (result.length > 0) {
                                con.query(`SELECT transactions.id, transactions.requester_uuid, transactions.status, transactions.timestamp, transactions.data_id, users.uuid AS owner_uuid, roles.id AS roles_id, roles.allowed FROM transactions inner join data on transactions.data_id = data.id inner join users on data.owner_id = users.id inner join roles on users.roles_id = roles.id WHERE transactions.id = ${req.body.id}`, function (err, result) {
                                    if (err) {
                                        res.writeHead(500, { 'Content-Type': 'application/json' });
                                        res.write(`{"status": "error", "message":"Internal Error"}`);
                                        res.end();
                                    }
                                    else {
                                        var allowed = JSON.parse(result[0].allowed);
                                        if (allowed[result[0].status] !== undefined) {//The user is allowed to transit from the current status to the next one
                                            /**
                                             * Special case 1: Where the owner is updating the status
                                             */
                                            //User should be the owner to accept or reject and status should be Pending
                                            if (result[0].status.toLowerCase() === "pending" && result[0].owner_uuid === useruuid && (req.body.status.toLowerCase() === "accepted" || req.body.status.toLowerCase() === "rejected")) {
                                                con.query(`UPDATE transactions SET status = "${req.body.status.toLowerCase()}" WHERE id = ${req.body.id}`, function (err, result) {
                                                    if (err) {
                                                        
                                                        res.writeHead(500, { 'Content-Type': 'application/json' });
                                                        res.write(`{"status": "error", "message":"Internal Error"}`);
                                                        res.end();
                                                    }
                                                    else {
                                                        res.writeHead(201, { 'Content-Type': 'application/json' });
                                                        res.write(`{"status": "200", "message":"Status updated to ${req.body.status}"}`);
                                                        res.end();
                                                    }
                                                });
                                            }
                                            /**
                                             * Special case 2: Where the requester is trying to update Sample uploaded to Data validated
                                             * Only requester user can do such a transition
                                             */
                                            else if (result[0].status.toLowerCase() === "sample uploaded" && result[0].requester_uuid === useruuid) {
                                                con.query(`UPDATE transactions SET status = "${allowed[result[0].status]}" WHERE id = ${req.body.id}`, function (err, result) {
                                                    if (err) {
                                                        res.writeHead(500, { 'Content-Type': 'application/json' });
                                                        res.write(`{"status": "error", "message":"Internal Error"}`);
                                                        res.end();
                                                    }
                                                    else {
                                                        res.writeHead(200, { 'Content-Type': 'application/json' });
                                                        console.log(result[0]);
                                                        res.write(`{"status": "200", "message":"Status updated to ${req.body.status}"}`);
                                                        res.end();
                                                    }
                                                });
                                            }
                                            else if (req.body.status.toLowerCase() === allowed[result[0].status]) {
                                                con.query(`UPDATE transactions SET status = "${allowed[result[0].status]}" WHERE id = ${req.body.id}`, function (err, result) {
                                                    if (err) {
                                                        res.writeHead(500, { 'Content-Type': 'application/json' });
                                                        res.write(`{"status": "error", "message":"Internal Error"}`);
                                                        res.end();
                                                    }
                                                    else {
                                                        res.writeHead(200, { 'Content-Type': 'application/json' });
                                                        res.write(`{"status": "200", "message":"Status updated to to ${allowed[result[0].status]}"}`);
                                                        res.end();
                                                    }
                                                });
                                            }
                                            else {
                                                res.writeHead(403, { 'Content-Type': 'application/json' });
                                                res.write(`{"status": "403", "message":"Forbidden transition"}`);
                                                res.end();
                                            }
                                        }//End if transition allowed
                                        else {
                                            res.writeHead(404, { 'Content-Type': 'application/json' });
                                            res.write(`{"status": "404", "message":"Undefined transition"}`);
                                            res.end();
                                        }//End else transition now allowed
                                    }
                                });
                            }
                            else {
                                res.writeHead(404, { 'Content-Type': 'application/json' });
                                res.write(`{"status": "404", "message":"Wrong transaction"}`);
                                res.end();
                            }
                        }
                    });//End second con.query
                }//End ELSE 2 (search else 2)
            }//End if ELSE of the First outer con.query
        });//End of first outer con.query
    });//End of app.put transactions
}