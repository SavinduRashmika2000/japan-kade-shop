const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'japan_kade_shop'
});

connection.query('SELECT COUNT(*) as null_count FROM stock_items WHERE reserved_quantity IS NULL', (err, results) => {
  if (err) {
    console.error('Error executing query:', err);
    connection.end();
    return;
  }
  console.log('Null reserved_quantity count:', results[0].null_count);
  connection.end();
});
