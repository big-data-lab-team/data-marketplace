module.exports = function(app, con){
    app.get('/transactions', function(req, res) {
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
                else {
                    var query = `SELECT transactions.id, transactions.requester_uuid , users.uuid AS receiver_uuid, transactions.status, transactions.timestamp, data.id as data_id, data.name, data.price, categories.name AS category_name FROM transactions INNER JOIN data on data.id = transactions.data_id INNER JOIN categories ON data.category_id = categories.id INNER JOIN users on data.owner_id = users.id`;
                    if(req.headers['x-tx-filters'] !== undefined){
                        var filters = JSON.parse(req.headers['x-tx-filters']);
                        if(filters['tx_id'] !== undefined){
                            query+= ` AND transactions.id = ${filters['tx_id']}`; //Filter by id
                        }
                        if(filters['requester_uuid'] !== undefined){
                            query+= ` AND transactions.requester_uuid = ${filters['requester_uuid']}`; //Filter by requester
                        }
                        if(filters['receiver_uuid'] !== undefined){
                            query+= ` AND users.uuid = ${filters['receiver_uuid']}`; //Filter by receiver
                        }
                        if(filters['status'] !== undefined){
                            query+= ` AND transactions.status = ${filters['status']}`; //Filter by status
                        }
                        if(filters['data_id'] !== undefined){
                            query+= ` AND transactions.data_id = ${filters['data_id']}`; //Filter by data ID
                        }
                    }
                    con.query(query, function(err, result){
                        if(err)
                            throw err;
                        else{
                            var arr = [];
                            for (let i = 0; i < result.length; i++) {
                                arr.push(`{"id":${result[i].id}, "requester_uuid":"${result[i].requester_uuid}", "receiver_uuid":"${result[i].receiver_uuid}", "status":"${result[i].status}","timestamp":${result[i].timestamp},"data":{"id":${result[i].id},"name":"${result[i].name}","price":${result[i].price},"category_name":"${result[i].category_name}"}}`);             
                            }
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.write(`{"status": "ok", "transactions":"[${arr}]"}`);
                            res.end();
                        }
                    });
                }
            }
        });
    });

    app.post('/transactions', function(req, res) {
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
                else { 
                    con.query(`INSERT INTO transactions (requester_uuid, status, timestamp, data_id) VALUES ('${result[0].uuid}','pending',UNIX_TIMESTAMP(NOW()),${req.body.data_id})`, function(err, result){
                        if(err)
                            throw err;
                        else{
                            res.writeHead(201, { 'Content-Type': 'application/json' });
                            res.write(`{"status": "ok", "message":"Request Sent"}`);
                            res.end();
                        }
                    });
                }
            }
        });
    });
    //This can be removed
    app.get('/transactions/status', function(req, res) {
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
                else { 
                    con.query(`SELECT status FROM transactions WHERE id = ${req.headers['x-tx-id']}`, function(err, result){
                        if(err)
                            throw err;
                        else{
                            res.writeHead(201, { 'Content-Type': 'application/json' });
                            res.write(`{"status": "${result[0].status}"}`);
                            res.end();
                        }
                    });
                }
            }
        });
    });

    app.put('/transactions/status', function(req, res) {
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
                else { 
                    con.query(`UPDATE transactions SET status = "${req.body.status}" WHERE id = ${req.body.id} AND "${req.body.status}"`, function(err, result){
                        if(err)
                            throw err;
                        else{
                            res.writeHead(201, { 'Content-Type': 'application/json' });
                            res.write(`{"status": "${result[0].status}"}`);
                            res.end();
                        }
                    });
                }
            }
        });
    });
}