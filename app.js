var express = require('express');
const mongodb = require('mongodb');
const nconf = require('nconf');
const storage = require('./storage')
nconf.argv().env().file('keys.json');

const user = nconf.get('mongoUser');
const pass = nconf.get('mongoPass');
const host = nconf.get('mongoHost');
const port = nconf.get('mongoPort');

const createServer = () => {
	var app = express();

	// Viewing engine
	app.set('view engine', 'ejs');

	var routes = require('./routes');
	var path = require('path');
	app.use(express.static(path.join(__dirname, 'public')));

	// Routes
	// Home Route
	app.get('/', routes.home);

	app.get('/book_id/:id?', routes.book_single);

	app.get('*', routes.notfound);
	const PORT = process.env.PORT || 8080;
	app.listen(PORT, function () {
		console.log('App server running on localhost: ', PORT)
	});
}

// [START client]
let uri = `mongodb://${user}:${pass}@${host}:${port}`;
if (nconf.get('mongoDatabase')) {
	uri = `${uri}/${nconf.get('mongoDatabase')}`;
}
console.log('connecting to:', uri);
try {
	mongodb.MongoClient.connect(uri, (err, db) => {
		if (err) {
			console.log('can not connect to database with error: ', err);
		} else {
			console.log('connected to database');
		}

		storage.mongo = db;
		createServer();
	});
} catch (error) {
	console.log('error: ', error);
	createServer();
}