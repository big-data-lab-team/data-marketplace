module.exports = function (app, con) {
    app.post('/data', function (req, res) {
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
                    if (req.body.name !== undefined && req.body.name !== ''
                        && req.body.price !== undefined && req.body.price !== '' && req.body.tags.length > 0) {
                        //if no valid tags
                        if (req.body.tags.length === 0) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.write(`{"status": "400", "message":"Include at least one Tag"}`);
                            res.end();
                        }
                        else {
                            var query = `INSERT INTO data (name, price, owner_id, category_id) VALUES ('${req.body.name}',${Math.abs(req.body.price)},${result[0].id},${req.body.categoryid});`;
                            con.query(query, function (err, result) {
                                if (err) {
                                    res.writeHead(500, { 'Content-Type': 'application/json' });
                                    res.write(`{"status": "error", "message":"Internal Error"}`);
                                    res.end();
                                }
                                else {
                                    query = '';
                                    for (var i = 0; i < req.body.tags.length; i++) {//Build query
                                        //Only insert non empty tags
                                        if (req.body.tags[i].key !== undefined && req.body.tags[i].key !== ''
                                            && req.body.tags[i].value !== undefined && req.body.tags[i].value !== '') {
                                            query += `INSERT INTO tags (name, value, data_id) VALUES ("${req.body.tags[i].key}", "${req.body.tags[i].value}", ${result.insertId}); `;
                                        }
                                    }
                                    con.query(query, function (err, result) {
                                        if (err) {
                                            res.writeHead(500, { 'Content-Type': 'application/json' });
                                            res.write(`{"status": "error", "message":"Internal Error"}`);
                                            res.end();
                                        }
                                        else {
                                            res.writeHead(201, { 'Content-Type': 'application/json' });
                                            res.write(`{"status": "201", "message":"Created successfully"}`);
                                            res.end();
                                        }
                                    });
                                }
                            });
                        }

                    }
                    else {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.write(`{"status": "400", "message":"Malformed request. Verify your parameters"}`);
                        res.end();
                    }
                }
            }
        });
    });

    app.get('/data', function (req, res) {
        var query = 'SELECT `data`.id, `data`.name, `data`.price, `data`.added, `data`.category_id, `categories`.name as category_name, `users`.uuid AS ownerid FROM `users` inner join data on users.id = data.`owner_id` inner join categories on categories.id = data.`category_id`';
        if (req.headers['x-data-filters'] !== undefined) {
            var filters = JSON.parse(req.headers['x-data-filters']);
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
                query += ` AND data.id = ${filters['data-id']}`;
            }
            if (filters['data-min-price'] !== undefined) {
                query += ` AND price >= ${filters['data-min-price']}`;
            }
            if (filters['data-max-price'] !== undefined) {
                query += ` AND price <= ${filters['data-max-price']}`;
            }
            if (filters['data-categories'] !== undefined) {
                query += ` AND categories_id IN (${filters['data-categories'].toString()})`;
            }
        }
        con.query(query, function (err, result) {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.write(`{"status": "error", "message":"Internal Error"}`);
                res.end();
            }
            else {
                if (result.length > 0) {
                    getTags(result);
                }
                else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.write(`{"status": "200", "data":[]}`);
                    res.end();
                }
            }
        });

        function getTags(result) {
            var arr = [];
            for (let i = 0; i < result.length; i++) {
                con.query(`SELECT * FROM tags WHERE data_id=${result[i].id}`, function (err, tags) {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.write(`{"status": "error", "message":"Internal Error"}`);
                        res.end();
                    }
                    else {
                        addTags(result, tags, i, result.length);
                    }
                });

            }
            function addTags(result, tags, i, length) {
                arr.push(`{"id":${result[i].id},"name":"${result[i].name}","price":${result[i].price},"categoryid":${result[i].category_id},"categoryname":"${result[i].category_name}","ownerid":"${result[i].ownerid}", "added":"${result[i].added}", "tags":${JSON.stringify(tags)}}`);
                if (i === length - 1) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.write(`{"status": "200", "data":[${arr}]}`);
                    res.end();
                }
            }
        }

    });

    app.put('/data', function (req, res) {
        con.query(`SELECT * FROM users WHERE apiKey like '${req.headers['x-api-key']}'`, function (err, result) {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.write(`{"status": "error", "message":"Internal Error"}`);
                res.end();
            }
            else {
                //Verify if the API key exists
                if (result.length === 0) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.write(`{"status": "error", "message":"Unauthorized access"}`);//API Key used does not exists
                    res.end();
                }
                else {//If API exists verify if the requesting user is the actual owner of the data
                    con.query(`SELECT data.id, data.owner_id, users.uuid FROM data INNER JOIN users ON data.owner_id = users.id WHERE users.apiKey like '${req.headers['x-api-key']}' AND data.id = ${req.body.id}`, function (err, result) {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.write(`{"status": "error", "message":"Internal Error"}`);
                            res.end();
                        }
                        else {
                            //The data id submitted does not figure in the list of data ids belonging to the requesting user
                            if (result.length === 0) {
                                res.writeHead(403, { 'Content-Type': 'application/json' });
                                res.write(`{"status": "403", "message":"Forbidden access"}`);//Trying to modify non owned data
                                res.end();
                            }
                            else {
                                con.query(`UPDATE data SET name="${req.body.name}", price=${Math.abs(req.body.price)}, category_id=${req.body.categoryid} WHERE id=${req.body.id}`, function (err, result) {
                                    if (err) {
                                        console.log(err);
                                        res.writeHead(500, { 'Content-Type': 'application/json' });
                                        res.write(`{"status": "error", "message":"Internal Error"}`);
                                        res.end();
                                    }
                                    else {
                                        //Tags containing id field are to be updated
                                        //Tags missing id field are considered new tags and added as new one 
                                        con.query(`DELETE FROM tags WHERE data_id = ${req.body.id}`, function (err, results) {
                                            if (err) {
                                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                                res.write(`{"status": "error", "message":"Internal Error"}`);
                                                res.end();
                                            }
                                            else {
                                                if (req.body.tags.length > 0) { //if the request contains tags
                                                    //Build the Multi Query statement for updating tags
                                                    var query = ``;
                                                    for (var i = 0; i < req.body.tags.length; i++) {//Build query
                                                        if (req.body.tags[i].key !== "" && req.body.tags[i].value !== "") {
                                                            query += `INSERT INTO tags (name, value, data_id) VALUES ("${req.body.tags[i].key}", "${req.body.tags[i].value}", ${req.body.id}); `;
                                                        }

                                                    }
                                                    //Process the multi query to update
                                                    con.query(query, function (err, tags) {//Update tags related to Data item
                                                        if (err) {
                                                            {
                                                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                                                res.write(`{"status": "error", "message":"Internal Error"}`);
                                                                res.end();
                                                            }
                                                        }
                                                        else {
                                                            res.writeHead(201, { 'Content-Type': 'application/json' });
                                                            res.write(`{"status": "201", "message":"Updated successfully"}`);
                                                            res.end();
                                                        }
                                                    });
                                                }
                                                else if (req.body.tags.length === 0) {//Require at least one tag
                                                    res.writeHead(400, { 'Content-Type': 'application/json' });
                                                    res.write(`{"status": "400", "message":"Include at list one Tag"}`);
                                                    res.end();
                                                }
                                            }
                                        });

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
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.write(`{"status": "error", "message":"Internal Error"}`);
                res.end();
            }
            else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(`{"status": "200","categories":${JSON.stringify(result)}}`);
                res.end();
            }
        });
    });

    app.post('/data/categories', function (req, res) {
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
                    if (result[0].roles_id !== 3) {
                        res.writeHead(403, { 'Content-Type': 'application/json' });
                        res.write(`{"status": "403", "message":"Forbidden access"}`);
                        res.end();
                    }
                    else {
                        con.query(`INSERT INTO categories (name, description) VALUES ('${req.body.name}','${req.body.description}')`, function (err, result) {
                            if (err) {
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.write(`{"status": "error", "message":"Internal Error"}`);
                                res.end();
                            }
                            else {
                                res.writeHead(201, { 'Content-Type': 'application/json' });
                                res.write(`{"status": "201", "message":"Created successfully"}`);
                                res.end();
                            }
                        });
                    }
                }
            }
        });
    });

    app.put('/data/categories', function (req, res) {
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
                    if (result[0].roles_id !== 3) {
                        res.writeHead(403, { 'Content-Type': 'application/json' });
                        res.write(`{"status": "403", "message":"Forbidden access"}`);
                        res.end();
                    }
                    else {
                        con.query(`UPDATE categories SET name = '${req.body.name}', description = '${req.body.description}' WHERE id = ${req.body.id}`, function (err, result) {
                            if (err) {
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.write(`{"status": "error", "message":"Internal Error"}`);
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
            }
        });
    });
}