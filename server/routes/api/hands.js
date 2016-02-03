var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || require('./databaseurl.json').data;

router.get('/', function(request, response){
  var results = [];

  pg.connect(connectionString, function(err, client) {
    if (err) throw err;

    client
      .query('SELECT * FROM hands')
      .on('row', function(row) {
        // get rid of the null values!
        for (var key in row) {

          if (row[key] === null) {
            delete row[key];
          }

        }
        results.push(row);
      })
      .on('end', function() {
        client.end();
        return response.json(results);
      });
  });
});

router.get('/:eventId', function(request, response){
  var results = [];

  pg.connect(connectionString, function(err, client) {
    if (err) throw err;

    client
      .query('SELECT * FROM hands WHERE hands.event_id = $1', [request.params.eventId])
      .on('row', function(row) {
        // get rid of the null values!
        for (var key in row) {

          if (row[key] === null) {
            delete row[key];
          }

        }
        results.push(row);
      })
      .on('end', function() {
        client.end();
        return response.json(results);
      });
  });
});
module.exports = router;
