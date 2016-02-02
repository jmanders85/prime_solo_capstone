var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL;



router.get('/users', function(request, response){
  var results = [];

  pg.connect(connectionString, function(err, client) {
    if (err) throw err;

    client
      .query('SELECT * FROM users')
      .on('row', function(row) {
        results.push(row);
      })
      .on('end', function() {
        client.end();
        return response.json(results);
      });
  });
});

router.get('/hands', function(request, response){
  var results = [];

  pg.connect(connectionString, function(err, client) {
    if (err) throw err;

    client
      .query('SELECT * FROM hands')
      .on('row', function(row) {
        results.push(row);
      })
      .on('end', function() {
        client.end();
        return response.json(results);
      });
  });
});


module.exports = router;
