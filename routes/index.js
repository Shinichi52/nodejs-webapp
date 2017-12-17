var storage = require('../storage');
var default_tab_title = "Books store"
var fs = require('fs');
var dialog = require('dialog');
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
exports.insertBook = function (req, res) {
	var user = req.user;
	var posterImage = req.files[0];
	var coverImage = req.files[1];
	var newPoster = posterImage && posterImage.path ? fs.readFileSync(posterImage.path) : '';
	var encPoster = newPoster.toString('base64');
	var poster = Buffer(encPoster, 'base64');
	var newCover = coverImage && coverImage.path ? fs.readFileSync(coverImage.path) : '';
	var encCover = newCover.toString('base64');
	var cover = Buffer(encCover, 'base64');
	var id = new Date().getTime();
	var newBook = {
		id: id,
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
		storage.len = storage.len + 1;
		storage.pageCount = Math.ceil(storage.len / 6);
		res.render('book_single', {
			title: newBook.name,
			book: newBook,
			author: newBook.author,
			poster: poster.toString('base64'),
			cover: cover.toString('base64'),
			user: user
		})
	});
}

function compare2Document(doc1, doc2) { // doc1 = new, doc2 = cur
	if (doc1.name === doc2.name
		&& doc1.author === doc2.author && doc1.description === doc2.description
		&& (!doc1.poster || doc1.poster.toString('base64') === doc2.poster)
		&& (!doc1.cover || doc1.cover.toString('base64') === doc2.cove)) {
		return true;
	}
	return false;
}

exports.updateBook = function (req, res) {
	var user = req.user;
	var id = parseInt(req.params.id);
	var poster = null;
	var cover = null;
	var posterImage = req.files[0];
	if (posterImage) {
		var newPoster = posterImage && posterImage.path ? fs.readFileSync(posterImage.path) : '';
		var encPoster = newPoster.toString('base64');
		poster = Buffer(encPoster, 'base64');
	}
	var coverImage = req.files[1];
	if (coverImage) {
		var newCover = coverImage && coverImage.path ? fs.readFileSync(coverImage.path) : '';
		var encCover = newCover.toString('base64');
		cover = Buffer(encCover, 'base64');
	}
	var newBook = {
		id: id,
		name: req.body.bookName,
		author: req.body.bookAuthor,
		description: req.body.bookDescription,
		poster: poster,
		cover: cover
	};
	var curBook = {
		id: id,
		name: req.body.curBookName,
		author: req.body.curBookAuthor,
		description: req.body.curBookDescription,
		poster: req.body.curPoster,
		cover: req.body.curCover
	}
	var check = compare2Document(newBook, curBook);
	if (check) {
		dialog.info('Nothing change!', 'Notification', () => {
			res.redirect('/edit_book/' + id);
		});
	} else {
		if (!poster) poster = Buffer(req.body.curPoster, 'base64');
		if (!cover) cover = Buffer(req.body.curCover, 'base64');
		var newBook2 = {
			id: id,
			name: req.body.bookName,
			author: req.body.bookAuthor,
			description: req.body.bookDescription,
			poster: poster,
			cover: cover
		}
		const collection = storage.mongo.collection('books');
		collection.update({ id: id }, newBook2, function (err, result) {
			if (err) {
				console.log('Cannot update book ', err);
			};
			console.log('updated', newBook.id);
			res.render('book_single', {
				title: newBook.name,
				book: newBook,
				author: newBook.author,
				poster: poster.toString('base64'),
				cover: cover.toString('base64'),
				user: user
			})
		});
	}
}

exports.delete_book = function (req, res) {
	var user = req.user;
	var id = parseInt(req.params.id);
	var collection = storage.mongo.collection('books');
	collection.remove({ id: id }, function (err, suscess) {
		if (err) {
			console.log("Cannot delete book", id);
		} else {
			storage.len = storage.len - 1;
			storage.pageCount = Math.ceil(storage.len / 6);
			res.redirect('/');
		}
	});
}

// Home page
exports.home = function (req, res) {
	const pageCount = storage.pageCount;
	var user = req.user;
	var page = parseInt(req.params.page) || 1;
	if (page > 0 && page <= pageCount) {
		const skip = (page - 1) * PAGE_ELEMENT;
		const count = PAGE_ELEMENT;
		var collection = storage.mongo.collection('books');
		collection.find({}).limit(count).skip(skip).toArray(function (err, data) {
			if (err) {
				console.log("Cannot get data");
			} else {
				var books = data;
				res.render('home', {
					title: default_tab_title,
					books: books,
					user: user,
					page: page,
					pageCount: parseInt(pageCount)
				})
			}
		});
	} else {
		res.render('notfound', {
			title: default_tab_title,
			user: user
		});
	}
};

// Profile
exports.profile = function (req, res) {
	var user = req.user;
	res.render('profile', {
		title: 'Profile',
		user: user[0]
	})
};

// Add book
exports.add_book = function (req, res) {
	var user = req.user;
	res.render('add_book', {
		title: 'Add book',
		user: user[0],
		editMode: false
	})
};

// Edit book
exports.edit_book = function (req, res) {
	var user = req.user;
	var id = parseInt(req.params.id);
	var collection = storage.mongo.collection('books');
	collection.find({ id: id }).toArray(function (err, data) {
		if (err) {
			console.log("Cannot get data");
		} else {
			if (data.length > 0) {
				var book = data[0];
				res.render('edit_book', {
					title: 'Edit book',
					user: user[0],
					book: book,
					editMode: true
				})
			} else {
				res.render('notfound', {
					title: default_tab_title,
					user: user
				});
			}
		}
	});
};

// Book single
exports.book_single = function (req, res) {
	var user = req.user;
	var id = parseInt(req.params.id);
	var collection = storage.mongo.collection('books');
	var maxLen = storage.len;
	console.log('maxLen', maxLen)
	collection.find({ id: id }).toArray(function (err, data) {
		if (err) {
			console.log("Cannot get data");
		} else {
			if (data.length > 0) {
				var book = data[0];
				var name = book.name;
				var author = book.author;
				var poster = book.poster;
				var cover = book.cover;
				res.render('book_single', {
					title: name,
					book: book,
					author: author,
					poster: poster.toString('base64'),
					cover: cover.toString('base64'),
					user: user
				})
			} else {
				res.render('notfound', {
					title: default_tab_title,
					user: user
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
	res.render('notfound', {
		title: default_tab_title,
		user: user
	});
};