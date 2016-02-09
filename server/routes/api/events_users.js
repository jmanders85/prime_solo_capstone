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

router.get('/top5Scores', function(request, response) {
  var results = [];

  pg.connect(connectionString, function(err, client) {
    if (err) throw err;

    client
      .query('SELECT users.name, sum(final_score) from events_users JOIN users ON events_users.user_id = users.id group by users.name order by sum(final_score) DESC LIMIT 5')
      .on('row', function(row){
        results.push(row);
      })
      .on('end', function(){
        client.end();
        return response.json(results);
      });
  });
});

module.exports = router;
