var express = require('express');
var session = require('express-session');
var passport = require('passport');
var pg = require('pg');
var bodyParser = require('body-parser');


var api = require('./routes/api');
var index = require('./routes/index');

var connectionString = process.env.DATABASE_URL || require('./routes/api/databaseurl.json').data;
var localStrategy = require('passport-local').Strategy;

var app = express();

app.use(session({
  secret: process.env.SessionSecret || require('./secret.json').data,
  resave: true,
  saveUninitialized: false,
  cookie: {maxAge: null, secure: false}
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  pg.connect(connectionString, function(err, client) {
    if (err) throw err;

    var user = {};
    client
      .query('SELECT * FROM admins WHERE id = $1', [id])
      .on('row', function(row) {
        user = row;
      })
      .on('end', function() {
        client.end();
        done(null, user);
      });
  });
});

passport.use('local', new localStrategy({
  passReqToCallback: true,
  usernameField: 'username'
}, function(request, username, password, done) {

  pg.connect(connectionString, function(err, client) {
    if (err) throw err;

    var user = {};
    client
      .query('SELECT * FROM admins WHERE username = $1', [username])
      .on('row', function(row) {
        user = row;
      })
      .on('end', function() {
        if(user && user.password === password) {
          done(null, user);
        } else {
          done(null, false, {message: 'Error logging in'});
        }
        client.end();
      });
  });
}));

app.use(express.static('server/public'));

app.use(bodyParser.json());

app.use('/api', api);
app.use('/', index);

app.set('port', (process.env.PORT || 3000));

var server = app.listen(app.get('port'), function() {
  var port = server.address().port;
  console.log("Listening on port", port);
});
