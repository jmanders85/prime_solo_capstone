var express = require('express');

var api = require('./routes/api');

var app = express();

app.use('/api', api);

app.set('port', (process.env.PORT || 3000));

var server = app.listen(app.get('port'), function() {
  var port = server.address().port;
  console.log("Listening on port", port);
});
