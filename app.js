var express = require('express');
var multer = require('multer')
var bodyParser = require('body-parser')
const mongodb = require('mongodb');
var passport = require('passport');
const passportConfig = require('./config/passport');
const cookieSession = require('cookie-session');
const keys = require('./config/auth');
const nconf = require('nconf');
const storage = require('./storage')
nconf.argv().env().file('keys.json');

var upload = multer({ dest: 'insert_book/' });

const user = nconf.get('mongoUser');
const pass = nconf.get('mongoPass');
const host = nconf.get('mongoHost');
const port = nconf.get('mongoPort');

const authCheck = (req, res, next) => {
	if (!req.user) {
		console.log('not sign in')
		res.redirect('/sign_in');
	} else {
		console.log('have been sign in')
		next();
	}
};

const createServer = () => {
	var app = express();

	// parse application/x-www-form-urlencoded
	app.use(bodyParser.urlencoded({ extended: false }))

	// parse application/json
	app.use(bodyParser.json())

	// Viewing engine
	app.set('view engine', 'ejs');

	var routes = require('./routes');
	var path = require('path');
	app.use(express.static(path.join(__dirname, 'public')));

	// set up session cookies
	app.use(cookieSession({
		maxAge: 24 * 60 * 60 * 1000,
		keys: [keys.session.cookieKey]
	}));

	// initialize passport
	app.use(passport.initialize());
	app.use(passport.session());

	// Routes
	// Home Route
	app.get('/', routes.home);
	app.get('/page/:page?', routes.home);

	app.get('/success', passport.authenticate('google'), (req, res) => {
		res.redirect('/');
	});

	app.get('/book_id/:id?', routes.book_single);

	app.get('/sign_in', routes.sign_in);

	app.get('/sign_out', (req, res) => {
		req.logOut();
		res.redirect('/');
	});

	app.get('/profile', authCheck, routes.profile);

	app.get('/add_book', authCheck, routes.add_book);

	app.get('/edit_book/:id?', authCheck, routes.edit_book);

	app.post('/insert_book', upload.array('bookImages', 2), routes.insertBook);

	app.post('/update_book/:id?', upload.array('bookImages', 2), routes.updateBook);


	app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

	app.get('/favicon.ico', routes.notfound);

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
		var books;
		db.collection('books').find({}).toArray(function (error, data) {
			if (error) {
				console.log('get books err', error);
			} else {
				const len = data.length || 0;
				storage.mongo = db;
				storage.len = len;
				storage.pageCount = Math.ceil(len / 6);
				console.log('length', Math.ceil(len / 6));
				createServer();
			}
		})
	});
} catch (error) {
	console.log('error: ', error);
	createServer();
}