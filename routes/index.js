var moviesJSON = require('../movies.json')
var storage = require('../storage');
var default_tab_title = "Books store"

// *************************************************************************************************
// Required parameters to call viewers that use head.ejs, header.ejs
//
// title : contains the browser tab name used in the head.ejs
// movies : array with the movies[x].title is used in the header.ejs to display the navigation menu
// 
// 
// 
// *************************************************************************************************


// Home page
exports.home = function (req, res) {
	var user = req.user;
	var movies = moviesJSON.movies;
	var books = [];
	var collection = storage.mongo.collection('books');
	// Find some documents
	collection.find({}).toArray(function (err, data) {
		if (err) {
			console.log("Cannot get data");
		} else {
			console.log("Found the following records");
			books = data;
			res.render('home', {
				title: default_tab_title,
				movies: movies,
				books: books,
				user: user
			})
		}
	});
};

// Profile
exports.profile = function (req, res) {
	var user = req.user;
	console.log('user: ', user);
	res.render('profile', {
		title: 'Profile',
		user: user[0]
	})
};

// Movie single
exports.book_single = function (req, res) {
	var id = req.params.id;
	var movies = moviesJSON.movies;
	var books = [];
	var collection = storage.mongo.collection('books');
	// Find some documents
	collection.find({}).toArray(function (err, data) {
		if (err) {
			console.log("Cannot get data");
		} else {
			console.log("Found the following records");
			books = data;
			if (id >= 1 && id <= 9) {
				var book = books[id - 1];
				var name = book.name;
				var author = book.author;

				res.render('book_single', {
					title: name,
					books: books,
					book: book,
					author: author
				})
			} else {
				res.render('notfound', {
					title: default_tab_title,
					books: books
				});
			}
		}
	});

};

// Sign in
exports.sign_in = function (req, res) {
	res.render('sign_in', {
		title: 'Sign in'
	})
};

// Not Found
exports.notfound = function (req, res) {
	var user = req.user;
	var movies = moviesJSON.movies;
	var books = [];
	var collection = storage.mongo.collection('books');
	// Find some documents
	collection.find({}).toArray(function (err, data) {
		if (err) {
			console.log("Cannot get data");
		} else {
			console.log("Found the following records");
			books = data;
			res.render('notfound', {
				title: default_tab_title,
				books: books,
				user: user
			});
		}
	});
};