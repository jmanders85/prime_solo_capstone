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

router.get('/leasters/:id?', function(request, response){
  var results = [];
  var byLeagueId = '';
  if (request.params.id) {
    byLeagueId = ' and events.league_id = ' + request.params.id;
  }

  var betweenDates = '';

  if (request.query.startDate !== 'undefined') {
    betweenDates = ' AND events.date between cast(\'' + request.query.startDate + '\' as date) AND cast(\'' + request.query.endDate + '\' as date) ';
  }


  pg.connect(connectionString, function(err, client, done){
    if (err) throw err;

    client
      .query('SELECT users.name, count(hands.*) as count FROM hands JOIN users ON hands.declarer_id = users.id JOIN events on hands.event_id = events.id WHERE hands.leaster = true'+ byLeagueId + betweenDates +' GROUP BY users.name ORDER BY count DESC')
      .on('row', function(row){
        results.push(row);
      })
      .on('end', function(){
        done();
        return response.json(results);
      });
  });
});

router.get('/mosters/:id?', function(request, response){
  var results = [];
  var byLeagueId = '';
  if (request.params.id) {
    byLeagueId = ' AND events.league_id = ' + request.params.id;
  }

  var betweenDates = '';

  if (request.query.startDate !== 'undefined') {
    betweenDates = ' AND events.date between cast(\'' + request.query.startDate + '\' as date) AND cast(\'' + request.query.endDate + '\' as date) ';
  }

  pg.connect(connectionString, function(err, client, done){
    if (err) throw err;

    client
      .query('SELECT users.name, count(hands.*) as count FROM hands JOIN users ON hands.declarer_id = users.id JOIN events ON hands.event_id = events.id WHERE hands.moster = true'+ byLeagueId + betweenDates +' GROUP BY users.name ORDER BY count DESC')
      .on('row', function(row){
        results.push(row);
      })
      .on('end', function(){
        done();
        return response.json(results);
      });
  });
});

router.get('/winLoss/:id?', function(request, response){
  var results = [];
  var byLeagueId = '';
  if (request.params.id) {
    byLeagueId = ' AND events.league_id = ' + request.params.id;
  }

  var betweenDates = '';

  if (request.query.startDate !== 'undefined') {
    betweenDates = ' AND events.date between cast(\'' + request.query.startDate + '\' as date) AND cast(\'' + request.query.endDate + '\' as date) ';
  }

  pg.connect(connectionString, function(err, client, done){
    if (err) throw err;

    client
      .query('SELECT users.name, count(hands.won) as hands_won FROM hands JOIN users on hands.declarer_id = users.id JOIN events ON hands.event_id = events.id WHERE hands.leaster is null and hands.moster is null'+ byLeagueId + betweenDates +' GROUP BY users.name ORDER BY hands_won DESC')
      .on('row', function(row) {
        results.push({"player": row.name, "hands_picked": row.hands_won});
      })
      .on('end', function(){
        client
          .query('SELECT users.name, count(hands.won) as hands_won FROM hands JOIN users on hands.declarer_id = users.id JOIN events ON hands.event_id = events.id WHERE hands.leaster is null and hands.won is true' + byLeagueId + betweenDates +' GROUP BY users.name')
          .on('row', function(row){
            for (var i = 0; i < results.length; i++) {
              if (results[i].player === row.name) {
                results[i].hands_won = row.hands_won;
              }
            }
          })
          .on('end', function(){
            done();
            return response.json(results);
          });
      });
  });
});

router.get('/blitzers/:id?', function(request, response){
  var results = [];
  var byLeagueId = '';
  if (request.params.id) {
    byLeagueId = ' AND events.league_id = ' + request.params.id;
  }

  var betweenDates = '';

  if (request.query.startDate !== 'undefined') {
    betweenDates = ' AND events.date between cast(\'' + request.query.startDate + '\' as date) AND cast(\'' + request.query.endDate + '\' as date) ';
  }

  pg.connect(connectionString, function(err, client, done){
    if (err) throw err;

    client
      .query('SELECT users.name, count(*) as hands_blitzed FROM hands JOIN users ON hands.declarer_id = users.id JOIN events ON hands.event_id = events.id WHERE (black_queen_blitz is true or red_queen_blitz is true or black_jack_blitz is true or red_jack_blitz is true)' + byLeagueId + betweenDates + ' GROUP BY users.name ORDER BY hands_blitzed DESC')
      .on('row', function(row){
        results.push(row);
      })
      .on('end', function(){
        done();
        return response.json(results);
      });
  });
});

router.get('/handsPlayed/:id?', function(request, response){
  var results = [];
  var byLeagueId = '';
  if (request.params.id) {
    byLeagueId = ' AND events.league_id = ' + request.params.id;
  }

  var betweenDates = '';

  if (request.query.startDate !== 'undefined') {
    betweenDates = ' AND events.date between cast(\'' + request.query.startDate + '\' as date) AND cast(\'' + request.query.endDate + '\' as date) ';
  }

  pg.connect(connectionString, function(err, client, done){
    if (err) throw err;

    client
      .query('SELECT users.name, count(hands.*) as count FROM hands JOIN events_users on hands.event_id = events_users.event_id JOIN users on users.id = events_users.user_id JOIN events ON hands.event_id = events.id ' + byLeagueId + betweenDates + ' GROUP BY users.name ORDER BY count desc limit 5')
      .on('row', function(row){
        results.push(row);
      })
      .on('end', function(){
        done();
        response.json(results);
      });
  });
});

router.get('/positionStats/:id?', function(request, response){
  var results = [];
  var byLeagueId = '';
  if (request.params.id) {
    byLeagueId = ' AND events.league_id = ' + request.params.id;
  }

  var betweenDates = '';

  if (request.query.startDate !== 'undefined') {
    betweenDates = ' AND events.date between cast(\'' + request.query.startDate + '\' as date) AND cast(\'' + request.query.endDate + '\' as date) ';
  }

  pg.connect(connectionString, function(err, client, done){
    if(err) throw err;

    client
      .query('SELECT count_table.player_count, events_users.position_at_table as declarers_position,  row_number() over (partition by hands.event_id) as hand_number, row_number() over (partition by hands.event_id) % player_count as dealer_position, hands.event_id, events.league_id, hands.declarer_id, hands.won, hands.leaster, hands.moster, hands.id FROM hands JOIN events_users ON hands.declarer_id = events_users.user_id AND hands.event_id = events_users.event_id JOIN (SELECT count(*) as player_count, event_id FROM events_users GROUP BY event_id order by event_id) as count_table on hands.event_id = count_table.event_id JOIN events ON events_users.event_id = events.id' + byLeagueId + betweenDates)
      .on('row', function(row){
        if (!(row.leaster || row.moster)) results.push(row);
      })
      .on('end', function() {
        done();
        response.json(results);
      });

  });
});

router.post('/', function(request, response){

  var eventUpdating = request.body[0].narrativizedHand.eventId;
  var finalScores = request.body[request.body.length - 1].scores;

  var finalScoresQueries = [];

  for (var j = 0; j < finalScores.length; j++) {
    finalScoresQueries.push({
      query: 'UPDATE events_users SET final_score = $1 WHERE event_id = ' + eventUpdating + ' AND position_at_table = ' + (j + 1),
      argArray: [finalScores[j]]
    });
  }

  var handsQueryString = 'INSERT INTO hands (event_id, declarer_id, partner_id, won, schneider, schwarz, leaster, leaster_trick, moster, moster_trick, black_queen_blitz, red_queen_blitz, black_jack_blitz, red_jack_blitz, crack, crack_id, black_queen_blitz_crack, red_queen_blitz_crack, black_jack_blitz_crack, red_jack_blitz_crack, recrack) VALUES ';

  function ifUndefinedThenNull(i) {
    return i === undefined ? 'NULL' : i;
  }

  for (var i = 0; i < request.body.length; i++) {
    handsQueryString +=
      '('+ ifUndefinedThenNull(request.body[i].narrativizedHand.eventId) +
      ', '+ ifUndefinedThenNull(request.body[i].narrativizedHand.declarerID) +
      ', '+ ifUndefinedThenNull(request.body[i].narrativizedHand.partnerID) +
      ', '+ ifUndefinedThenNull(request.body[i].narrativizedHand.won) +
      ', '+ ifUndefinedThenNull(request.body[i].narrativizedHand.schneider) +
      ', '+ ifUndefinedThenNull(request.body[i].narrativizedHand.schwarz) +
      ', '+ ifUndefinedThenNull(request.body[i].leaster) +
      ', '+ ifUndefinedThenNull(request.body[i].leasterTrick) +
      ', '+ ifUndefinedThenNull(request.body[i].moster) +
      ', '+ ifUndefinedThenNull(request.body[i].mosterTrick) +
      ', '+ ifUndefinedThenNull(request.body[i].bqb) +
      ', '+ ifUndefinedThenNull(request.body[i].rqb) +
      ', '+ ifUndefinedThenNull(request.body[i].bjb) +
      ', '+ ifUndefinedThenNull(request.body[i].rjb) +
      ', '+ ifUndefinedThenNull(request.body[i].crack) +
      ', '+ ifUndefinedThenNull(request.body[i].crackingPlayerId) +
      ', '+ ifUndefinedThenNull(request.body[i].bqbc) +
      ', '+ ifUndefinedThenNull(request.body[i].rqbc) +
      ', '+ ifUndefinedThenNull(request.body[i].bjbc) +
      ', '+ ifUndefinedThenNull(request.body[i].rjbc) +
      ', '+ ifUndefinedThenNull(request.body[i].recrack) +')';
    if (i !== request.body.length - 1) handsQueryString += ', ';
  }

  pg.connect(connectionString, function(err, client) {
    if (err) throw err;

    for (var k = 0; k < finalScoresQueries.length; k++) {
      client.query(finalScoresQueries[k].query, finalScoresQueries[k].argArray);
    }

    client
      .query(handsQueryString)
      .on('end', function(){
        client.end();
        return response.sendStatus(200);
      });
  });
});

router.get('/:eventId', function(request, response){
  var results = [];

  pg.connect(connectionString, function(err, client) {
    if (err) throw err;

    client
      .query('SELECT hands.*, declarer.name as declarer_name, partner.name as partner_name, crack.name as cracking_player_name FROM hands JOIN users as declarer on declarer_id = declarer.id LEFT OUTER JOIN users as partner on partner_id = partner.id LEFT OUTER JOIN users as crack on crack_id = crack.id WHERE hands.event_id = $1 order by hands.id', [request.params.eventId])
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
