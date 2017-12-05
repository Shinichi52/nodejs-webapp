var moviesJSON = require('../movies.json')
var default_tab_title = "Star Wars Movies"

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
exports.home = function(req, res) {
	var movies = moviesJSON.movies;

	res.render('home',{
		title  : default_tab_title,
		movies : movies
	})
};

// Movie single
exports.movie_single = function(req, res){
	var episode_number = req.params.episode_number;
	var movies = moviesJSON.movies;
	
	if (episode_number >= 1 && episode_number <= 6) {
		var movie = movies[episode_number - 1];
		var title = movie.title;
		var main_characters = movie.main_characters;

		res.render('movie_single', {
			title  : title,
			movies : movies,
			movie : movie,
			main_characters : main_characters
		})
	} else {
		res.render('notfound',{
			title  : default_tab_title,
			movies : movies
		});
	}

};

// Not Found
exports.notfound = function(req, res) {
	var movies = moviesJSON.movies;
	res.render('notfound',{
			title  : default_tab_title,
			movies : movies
		});
};