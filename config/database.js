const env = require('dotenv')
const mysql = require('mysql2')
const keys = require('./keys')

env.config()

const connection = mysql.createConnection(keys.mysql)

connection.connect((err) => {
  if(err) throw err;
  console.log('Conneted to Database!')
})

module.exports = {
  connection
}