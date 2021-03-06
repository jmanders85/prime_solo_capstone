var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || require('./databaseurl.json').data;

router.get('/', function(request, response){
  var results = [];

  pg.connect(connectionString, function(err, client) {
    if (err) throw err;

    client
      .query('SELECT * FROM events_users')
      .on('row', function(row) {
        results.push(row);
      })
      .on('end', function() {
        client.end();
        return response.json(results);
      });
  });
});

router.get('/topScores/:id?', function(request, response) {
  var results = [];
  var byLeagueId = '';

  if (request.params.id) {
    byLeagueId = 'WHERE events.league_id = ' + request.params.id;
  }
  var betweenDates = '';

  if (request.query.startDate !== 'undefined') {
    if (request.params.id) {
      betweenDates = ' AND events.date between cast(\'' + request.query.startDate + '\' as date) AND cast(\'' + request.query.endDate + '\' as date) ';
    } else {
      betweenDates = ' WHERE events.date between cast(\'' + request.query.startDate + '\' as date) AND cast(\'' + request.query.endDate + '\' as date) ';
    }
  }

  pg.connect(connectionString, function(err, client) {
    if (err) throw err;

    client
      .query('SELECT users.name, sum(final_score) FROM events_users JOIN users ON events_users.user_id = users.id JOIN events on events_users.event_id = events.id '+ byLeagueId + betweenDates +'group by users.name order by sum(final_score) DESC')
      .on('row', function(row){
        results.push(row);
      })
      .on('end', function(){
        client.end();
        return response.json(results);
      });
  });
});

router.get('/:id', function(request, response){
  var results = [];

  pg.connect(connectionString, function(err, client) {
    if (err) throw err;

    client
      .query('SELECT events_users.*, users.name FROM events_users JOIN users on events_users.user_id = users.id WHERE event_id = $1', [request.params.id])
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
