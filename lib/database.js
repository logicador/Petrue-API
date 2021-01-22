const mysql = require('mysql2');
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    port: process.env.MYSQL_PORT,
    password: process.env.MYSQL_PASSWD,
    database: process.env.MYSQL_DATABASE,
    connectionLimit: 30,
    dateStrings: 'date'
});
const promisePool = pool.promise();
module.exports = promisePool;