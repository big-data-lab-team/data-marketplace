module.exports = function (app, con) {
    app.post('/data', function (req, res) {
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
                    con.query(`INSERT INTO data (name, price, owner_id, category_id) VALUES ('${req.body.name}',${req.body.price},${result[0].id},${req.body.categoryid})`, function (err, result) {
                        if (err)
                            throw err;
                        else {
                            var query = ``;
                            if (req.body.tags.length > 0) { //if the request contains tags
                                for (var i = 0; i < req.body.tags.length; i++) {//Build query
                                    query += `INSERT INTO tags (name, value, data_id) VALUES ("${req.body.tags[i].key}", "${req.body.tags[i].value}", ${result.insertId}); `;
                                }
                                con.query(query, function (err, result) {//Insert tags related to Data item
                                    if (err)
                                        throw err;
                                    else {
                                        res.writeHead(201, { 'Content-Type': 'application/json' });
                                        res.write(`{"status": "ok", 
                                                "message":"Created successfully"}`);
                                        res.end();
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    });

    app.get('/data', function (req, res) {
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
                    var query = 'SELECT `data`.id, `data`.name, `data`.price, `data`.category_id, `users`.uuid AS ownerid FROM `users` inner join data on users.id = data.`owner_id`';
                    if (req.headers['x-api-filters'] !== undefined) {
                        var filters = JSON.parse(req.headers['x-api-filters']);
                        if (filters['owner-uuid'] !== undefined) {
                            query += ` AND uuid like '${filters['owner-uuid']}'`;
                        }
                        if (filters['owner-country'] !== undefined) {
                            query += ` AND country like '${filters['owner-country']}'`;
                        }
                        if (filters['owner-city'] !== undefined) {
                            query += ` AND city like '${filters['owner-city']}'`;
                        }
                        if (filters['owner-province'] !== undefined) {
                            query += ` AND province like '${filters['owner-province']}'`;
                        }
                        if (filters['owner-min-age'] !== undefined) {
                            query += ` AND YEAR(CURRENT_TIMESTAMP) - users.yearOfBirth >= ${filters['owner-min-age']}`;
                        }
                        if (filters['owner-max-age'] !== undefined) {
                            query += ` AND YEAR(CURRENT_TIMESTAMP) - users.yearOfBirth <= ${filters['owner-max-age']}`;
                        }
                        if (filters['data-id'] !== undefined) {
                            query += ` AND id = ${filters['data-id']}`;
                        }
                        if (filters['data-min-price'] !== undefined) {
                            query += ` AND price >= ${filters['data-min-price']}`;
                        }
                        if (filters['data-max-price'] !== undefined) {
                            query += ` AND price <= ${filters['data-max-price']}`;
                        }
                        if (filters['categories'] !== undefined) {
                            query += ` AND categories_id IN (${filters['categories'].toString()})`;
                        }
                    }
                }
                con.query(query, function (err, result) {
                    if (err)
                        throw err;
                    else {
                        getTags(result);
                    }
                });

                function getTags(result) {
                    var arr = [];
                    for (let i = 0; i < result.length; i++) {
                        con.query(`SELECT * FROM tags WHERE data_id=${result[i].id}`, function (err, tags) {
                            if (err)
                                throw err;
                            else {
                                addTags(result, tags, i, result.length);
                            }
                        });
                    }
                    function addTags(result, tags, i, length) {
                        arr.push(`{"id":${result[i].id},"name":"${result[i].name}","price":${result[i].price},"categoryid":${result[i].category_id},"ownerid":"${result[i].ownerid}","tags":${JSON.stringify(tags)}}`);
                        if (i === length - 1) {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.write(`{"status": "ok", "data":[${arr}]}`);
                            res.end();
                        }
                    }
                }
            }
        });
    });

    app.put('/data', function (req, res) {
        con.query(`SELECT * FROM users WHERE apiKey like '${req.headers['x-api-key']}'`, function (err, result) {
            if (err)
                throw err;
            else {
                //Verify if the API key exists
                if (result.length === 0) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.write(`{"status": "error", "message":"Unauthorized access"}`);//API Key used does not exists
                    res.end();
                }
                else {//If API exists verify if the requesting user is the actual owner of the data
                    con.query(`SELECT data.id, data.owner_id, users.uuid FROM data INNER JOIN users ON data.owner_id = users.id WHERE users.uuid like '${req.headers['x-api-key']}' AND data.id = ${req.body.id}`, function (err, result) {
                        if (err)
                            throw err;
                        else {
                            //The data id submitted does not figure in the list of data ids belonging to the requesting user
                            if (result.length === 0 || result[0]['uuid'] !== req.body.ownerid) {
                                res.writeHead(403, { 'Content-Type': 'application/json' });
                                res.write(`{"status": "error", "message":"Forbidden access"}`);//Trying to modify non owned data
                                res.end();
                            }
                            else {
                                con.query(`UPDATE data SET name="${req.body.name}", price=${req.body.price}, owner_id=${result[0].id}, category_id=${req.body.categoryid} WHERE id=${req.body.id}`, function (err, result) {
                                    if (err)
                                        throw err;
                                    else {
                                        //Tags containing id field are to be updated
                                        //Tags missing id field are considered new tags and added as new one 
                                        if (req.body.tags.length > 0) { //if the request contains tags
                                            //Build the Multi Query statement for updating tags
                                            var query = ``;
                                            for (var i = 0; i < req.body.tags.length; i++) {//Build query
                                                if (req.body.tags[i].id === undefined) {
                                                    query += `INSERT INTO tags (name, value, data_id) VALUES ("${req.body.tags[i].name}", "${req.body.tags[i].value}", ${req.body.id}); `;
                                                }
                                                else {
                                                    query += `REPLACE INTO tags (id, name, value, data_id) VALUES (${req.body.tags[i].id}, "${req.body.tags[i].name}", "${req.body.tags[i].value}", ${req.body.id}); `;
                                                }
                                            }
                                            //Process the multi query to update
                                            con.query(query, function (err, tags) {//Update tags related to Data item
                                                if (err){
                                                    throw err;
                                                }
                                                else{
                                                    res.writeHead(201, { 'Content-Type': 'application/json' });
                                                    res.write(`{"status": "ok", "message":"Updated successfully"}`);
                                                    res.end();
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    });

    app.get('/data/categories', function (req, res) {
        con.query(`SELECT * FROM categories`, function (err, result) {
            if (err)
                throw err;
            else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(`{"status": "ok", 
                            "categories":${JSON.stringify(result)}}`);
                res.end();
            }
        });
    });

    app.post('/data/categories', function (req, res) {
        //to discuss how to add categories and whom
    });

    app.put('/data/categories', function (req, res) {
        //to discuss how to add categories and whom
    });
}