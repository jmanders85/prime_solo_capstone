var express = require('express');
var path = require('path');
var passport = require('passport');

var router = express.Router();

router.get('/', function(request, response){
  response.sendFile(path.join(__dirname, '../public/views/index.html'));
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/loginSuccessful',
  failureRedirect: '/loginFailed'
}));

router.get('/loginSuccessful', function(request, response){
  response.json(request.user);
});

router.get('/loginFailed', function(request, response){
  response.json({"message": "login failed"});
});

router.get('/*', function(request, response){
  response.redirect('/');
});

module.exports = router;
