var express = require('express');
var app = express();

// Viewing engine
app.set('view engine', 'ejs');

var routes = require('./routes');
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// Routes
// Home Route
app.get('/', routes.home);

app.get('/star_wars_episode/:episode_number?', routes.movie_single);

app.get('*', routes.notfound);
const PORT = process.env.PORT || 8080;
app.listen(PORT, function () {
	console.log('App server running on localhost: ', PORT)
});