var mysql = require('mysql');
module.exports = mysql.createConnection({
    host:"localhost",
    port: '3306',
    user:"datacoin",
    password:"datacoin",
    database: "datacoin",
    multipleStatements: true});
