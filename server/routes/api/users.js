var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || require('./databaseurl.json').data;

router.get('/', function(request, response){
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

router.get('/:id', function(request, response) {
  var results = [];

  pg.connect(connectionString, function(err, client) {
    if (err) throw err;

    client
      .query('SELECT users.id, users.name FROM users WHERE id = $1', [request.params.id])
      .on('row', function(row) {
        results.push(row);
      })
      .on('end', function() {
        results[0].league_commissioner = [];
        results[0].events = [];
        results[0].league_participation = [];
      });

    client
      .query('SELECT leagues.id, leagues.name FROM leagues JOIN users ON users.id = leagues.commissioner_id WHERE users.id = $1', [request.params.id])
      .on('row', function(row){
        results[0].league_commissioner.push(row);
      });

    client
      .query('SELECT events.id, events.name, events_users.final_score FROM events JOIN events_users ON events.id = events_users.event_id WHERE events_users.user_id = $1', [request.params.id])
      .on('row', function(row) {
        results[0].events.push(row);
      });

    client
      .query('SELECT leagues.id, leagues.name FROM leagues JOIN events ON events.league_id = leagues.id JOIN events_users ON events_users.event_id = events.id WHERE events_users.user_id = $1', [request.params.id])
      .on('row', function(row) {
        results[0].league_participation.push(row);
      })
      .on('end', function() {
        client.end();
        return response.json(results);
      });
  });
});

module.exports = router;
