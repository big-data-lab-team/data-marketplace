var mysql = require('mysql');
module.exports = mysql.createConnection({
    host:"localhost",
    port: '3306',
    user:"datacoin",//User grated access to the datacoin database
    password:"datacoin",//Password of the user granted access to the datacoin database
    database: "datacoin",
    multipleStatements: true});