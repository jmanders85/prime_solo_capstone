var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || require('./databaseurl.json').data;

router.get('/', function(request, response){
  var results = [];

  pg.connect(connectionString, function(err, client) {
    if (err) throw err;

    client
      .query('SELECT * FROM events')
      .on('row', function(row) {
        results.push(row);
      })
      .on('end', function() {
        client.end();
        return response.json(results);
      });
  });
});

// detail currently includes event with the league name, list of players organized by score and number of hands
router.get('/:id', function(request, response){
  var results = [];

  pg.connect(connectionString, function(err, client) {
    if (err) throw err;

    client
      .query('SELECT events.id, events.name, events.date, leagues.name as league_name FROM events JOIN leagues ON leagues.id = events.league_id WHERE events.id = $1', [request.params.id])
      .on('row', function(row) {
        results.push(row);
      })
      .on('end', function() {
        results[0].players = [];
      });

    client
      .query('SELECT COUNT(*) FROM hands WHERE hands.event_id = $1', [request.params.id])
      .on('row', function(row) {
        results[0].hands = row.count;
      });

    client
      .query('SELECT users.id, users.name, events_users.final_score FROM events JOIN events_users ON events.id = events_users.event_id JOIN users ON events_users.user_id = users.id WHERE events.id = $1 ORDER BY events_users.final_score DESC', [request.params.id])
      .on('row', function(row) {
        results[0].players.push(row);
      })
      .on('end', function () {
        client.end();
        return response.json(results);
      });
  });
});

module.exports = router;
