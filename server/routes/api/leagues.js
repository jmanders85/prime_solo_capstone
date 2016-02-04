var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || require('./databaseurl.json').data;

router.get('/', function(request, response){
  var results = [];

  pg.connect(connectionString, function(err, client) {
    if (err) throw err;

    client
      .query('SELECT leagues.id, leagues.name, users.name as commissioner FROM leagues JOIN users on leagues.commissioner_id = users.id')
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

router.post('/', function(request, response){
  if(request.user) {
    var newLeague = request.body.name;

    pg.connect(connectionString, function(err, client) {
      if (err) throw err;

      client
        .query('INSERT INTO leagues (name, commissioner_id) VALUES ($1, 1)', [newLeague])
        .on('end', function(){
          client.end();
          return response.sendStatus(200);
        });
    });
  } else {
    return response.sendStatus(401);
  }
});

module.exports = router;
