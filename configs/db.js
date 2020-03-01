require('dotenv').config();

const { DB_HOST, DB_NAME, DB_USER, DB_PW } = process.env;

module.exports = {
  connectionLimit : 100,
  host            : DB_HOST,
  user            : DB_USER,
  password        : DB_PW,
  database        : DB_NAME,
}