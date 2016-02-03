var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || require('./databaseurl.json').data;

router.get('/', function(request, response){
  var results = [];

  pg.connect(connectionString, function(err, client) {
    if (err) throw err;

    client
      .query('SELECT * FROM leagues')
      .on('row', function(row) {
        results.push(row);
      })
      .on('end', function() {
        client.end();
        return response.json(results);
      });
  });
});

// Currently displays the content of the specified league's row with a join on commissioner as well as a list of their events
router.get('/:id', function(request, response){
var results = [];

  pg.connect(connectionString, function(err, client) {
    if (err) throw err;

    client
      .query('SELECT leagues.id, leagues.name, users.name AS commissioner FROM leagues JOIN users ON leagues.commissioner_id = users.id WHERE leagues.id = $1', [request.params.id])
      .on('row', function(row) {
        results.push(row);
      })
      .on('end', function() {
        results[0].events = [];
      });

    client
      .query('SELECT events.id, events.name, events.date FROM events JOIN leagues on events.league_id = leagues.id WHERE events.league_id = $1', [request.params.id])
      .on('row', function(row) {
        results[0].events.push(row);
      })
      .on('end', function(){
        client.end();
        return response.json(results);
      });
  });
});

module.exports = router;
