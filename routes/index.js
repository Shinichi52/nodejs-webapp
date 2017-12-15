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
exports.insertData = function (obj) {
	var cover = obj.bookCover;
	var poster = obj.bookPoster;
	fs.readFile(cover, 'binary', function (err, original_data) {
		// fs.writeFile('image_orig.png', original_data, 'binary', function(err) {});
		var base64Image = new Buffer(original_data, 'binary').toString('base64');
		console.log("base64 str:");
		console.log(base64Image);
		console.log(base64Image.length);

		// var decodedImage = new Buffer(base64Image, 'base64').toString('binary');
		// console.log("decodedImage:");
		// console.log(decodedImage);
		// fs.writeFile('image_decoded.png', decodedImage, 'binary', function(err) {});
	});
	// Track every IP that has visited this site
	// const collection = storage.mongo.collection('IPs');

	// const ip = {
	// 	address: 'req.connection.remoteAddress'
	// };

	// collection.insert(ip, (err) => {
	// 	if (err) {
	// 		throw err;
	// 	}
	// 	console.log('Data inserted');
	// });

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
					exception: false
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
	// Find some documents
	collection.find({}).toArray(function (err, data) {
		if (err) {
			console.log("Cannot get data");
		} else {
			books = data;
			if (id >= 1 && id <= 9) {
				var book = books[id - 1];
				var name = book.name;
				var author = book.author;

				res.render('book_single', {
					title: name,
					books: books,
					book: book,
					author: author,
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