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
				books: books
			})
		}
	});
};
exports.insertData = function (req, res) {
	// Track every IP that has visited this site
	const collection = storage.mongo.collection('IPs');

	const ip = {
		address: 'req.connection.remoteAddress'
	};

	collection.insert(ip, (err) => {
		if (err) {
			throw err;
		}
		console.log('Data inserted');
	});

}
exports.getData = function (req, res) {
	const collection = storage.mongo.collection('IPs');
	collection.find({}).toArray(function (err, data) {
		// data
	});
}
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

// Not Found
exports.notfound = function (req, res) {
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
				books: books
			});
		}
	});
};