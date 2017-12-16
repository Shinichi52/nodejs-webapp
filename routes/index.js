var moviesJSON = require('../movies.json')
var storage = require('../storage');
var default_tab_title = "Books store"
var fs = require('fs');
const PAGE_ELEMENT = 6;

// *************************************************************************************************
// Required parameters to call viewers that use head.ejs, header.ejs
//
// title : contains the browser tab name used in the head.ejs
// movies : array with the movies[x].title is used in the header.ejs to display the navigation menu
// 
// 
// 
// *************************************************************************************************

// Insert data
exports.insertData = function (req, res) {
	var user = req.user;
	console.log('files: ', req.files);
	var posterImage = req.files[0];
	var coverImage = req.files[1];
	var newPoster = fs.readFileSync(posterImage.path);
	var encPoster = newPoster.toString('base64');
	var poster = Buffer(encPoster, 'base64');
	var newCover = fs.readFileSync(coverImage.path);
	var encCover = newCover.toString('base64');
	var cover = Buffer(encCover, 'base64');
	var newBook = {
		id: req.body.bookId,
		name: req.body.bookName,
		author: req.body.bookAuthor,
		description: req.body.bookDescription,
		poster: poster,
		cover: cover
	};
	const collection = storage.mongo.collection('books');
	collection.insert(newBook, function (err, result) {
		if (err) {
			console.log('Cannot insert book ', err);
		};
		console.log('inserted', newBook.id);
		storage.len += 1;
		storage.pageCount = Math.ceil(storage.len / 6);
		res.render('book_single', {
			title: newBook.name,
			books: [],
			book: newBook,
			author: newBook.author,
			poster: poster.toString('base64'),
			cover: cover.toString('base64'),
			user: user,
			exception: false
		})
	});
}

// Get data
exports.getData = function (table) {
	const collection = storage.mongo.collection(table);
	collection.find({}).toArray(function (err, data) {
		if (err) {
			console.log('get data err from ', table);
		} else {
			return data;
		}
	});
}

// Home page
exports.home = function (req, res) {
	const pageCount = storage.pageCount;
	var user = req.user;
	var page = parseInt(req.params.page) || 1;
	console.log('page: ', page);
	var books = [];
	if (page > 0 && page <= pageCount) {
		const skip = (page - 1) * PAGE_ELEMENT;
		const count = PAGE_ELEMENT;
		var collection = storage.mongo.collection('books');
		// Find some documents
		collection.find({}).limit(count).skip(skip).toArray(function (err, data) {
			if (err) {
				console.log("Cannot get data");
			} else {
				books = data;
				res.render('home', {
					title: default_tab_title,
					books: books,
					user: user,
					page: page,
					pageCount: pageCount,
					exception: true
				})
			}
		});
	} else {
		res.render('notfound', {
			title: default_tab_title,
			books: books,
			user: user,
			exception: true
		});
	}
};

// Profile
exports.profile = function (req, res) {
	var user = req.user;
	res.render('profile', {
		title: 'Profile',
		user: user[0],
		exception: true
	})
};

// Add book
exports.add_book = function (req, res) {
	var user = req.user;
	res.render('add_book', {
		title: 'Add book',
		user: user[0],
		exception: true
	})
};

// Movie single
exports.book_single = function (req, res) {
	var user = req.user;
	var id = req.params.id;
	console.log('id:  ', id);
	var movies = moviesJSON.movies;
	var books = [];
	var collection = storage.mongo.collection('books');
	var maxLen = storage.len;
	// Find some documents
	collection.find({}).toArray(function (err, data) {
		if (err) {
			console.log("Cannot get data");
		} else {
			books = data;
			if (id >= 1 && id <= maxLen) {
				var book = books[id - 1];
				var name = book.name;
				var author = book.author;
				var poster = book.poster;
				var cover = book.cover;

				res.render('book_single', {
					title: name,
					books: books,
					book: book,
					author: author,
					poster: poster.toString('base64'),
					cover: cover.toString('base64'),
					user: user,
					exception: false
				})
			} else {
				res.render('notfound', {
					title: default_tab_title,
					books: books,
					user: user,
					exception: true
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
			books = data;
			res.render('notfound', {
				title: default_tab_title,
				books: books,
				user: user,
				exception: true
			});
		}
	});
};