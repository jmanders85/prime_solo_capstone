var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || require('./databaseurl.json').data;

router.get('/', function(request, response){
  var results = [];

  pg.connect(connectionString, function(err, client) {
    if (err) throw err;

    client
      .query('SELECT events.id, events.date, events.name, leagues.name AS league FROM events JOIN leagues ON events.league_id = leagues.id')
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

router.post('/', function(request, response){
  if(request.user) {
    var newEventName = request.body.name;
    var newEventDate = request.body.date;
    var newEventLeagueID = request.body.league_id;
    var newEventPlayers = request.body.players;
    var newEventID = 1;
    var eventsUsersQuery = 'INSERT INTO events_users (event_id, user_id, position_at_table) VALUES ';


    pg.connect(connectionString, function(err, client) {
      if (err) throw err;

      // client
      //   .query('INSERT INTO events (name, date, league_id) VALUES ($1, $2, $3)', [newEventName, newEventDate, newEventLeagueID]);

      client
        .query('SELECT * FROM events ORDER BY id DESC LIMIT 1')
        .on('row', function(row) {
          newEventID = row.id;
        })
        .on('end', function() {
          for (var i = 0; i < newEventPlayers.length; i++) {
            if (i !== newEventPlayers.length-1) {
              eventsUsersQuery += '('+newEventID+', '+ newEventPlayers[i] +', '+ (i+1) +'), ';
            } else {
              eventsUsersQuery += '('+newEventID+', '+ newEventPlayers[i] +', '+ (i+1) +')';
            }
          }
          client
            .query(eventsUsersQuery)
            .on('end', function() {
              client.end();
              return response.sendStatus(200);
            });
        });


    });
  } else {
    return response.sendStatus(401);
  }
});

module.exports = router;
