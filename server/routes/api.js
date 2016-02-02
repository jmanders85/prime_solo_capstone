var express = require('express');
var router = express.Router();

var users = require('./api/users');
var leagues = require('./api/leagues');
var events = require('./api/events');
var events_users = require('./api/events_users');
var hands = require('./api/hands');

router.use('/users', users);
router.use('/leagues', leagues);
router.use('/events', events);
router.use('/events_users', events_users);
router.use('/hands', hands);

module.exports = router;
