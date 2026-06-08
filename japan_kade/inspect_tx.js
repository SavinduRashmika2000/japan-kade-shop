const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'japan_kade_shop'
});

connection.query('SELECT * FROM stock_transactions WHERE stock_item_id = 2', (err, txs) => {
  if (err) {
    console.error('Error selecting transactions:', err);
    connection.end();
    return;
  }
  console.log('Transactions for item 2:', txs);

  connection.query('SELECT * FROM stock_movements WHERE stock_item_id = 2', (err2, mvmt) => {
    if (err2) {
      console.error('Error selecting movements:', err2);
    } else {
      console.log('Movements for item 2:', mvmt);
    }
    
    connection.query('SELECT * FROM job_items WHERE stock_item_id = 2', (err3, items) => {
      if (err3) {
        console.error('Error selecting job_items:', err3);
      } else {
        console.log('Job items for item 2:', items);
      }
      connection.end();
    });
  });
});
