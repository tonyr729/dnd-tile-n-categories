const mysql = require('mysql2');
require('dotenv').config();

module.exports.stablishedConnection = () => {
  return new Promise((resolve, reject) => {
    const con = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_SCHEMA,
      multipleStatements: true,
    });
    con.connect((err) => {
      if (err) {
        reject(err);
      }
      resolve(con);
    });
  });
};

module.exports.closeDbConnection = (con) => {
  con.destroy();
};
