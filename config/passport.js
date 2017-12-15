// load all the things we need
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// load data
var storage = require('../storage');

// load the auth variables
var configAuth = require('./auth');

// load up the user model

// used to serialize the user for the session
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function (id, done) {
    const users = storage.mongo.collection('user');
    users.find({ 'id': id }).toArray(function (err, user) {
        if (err) {
        } else {
            done(null, user);
        }
    });
});

// =========================================================================
// GOOGLE ==================================================================
// =========================================================================
passport.use(
    new GoogleStrategy({
        // options for google strategy
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL,
    }, (accessToken, refreshToken, profile, done) => {
        console.log('passport callback function fired');
        const users = storage.mongo.collection('user');
        users.find({ 'id': profile.id }).toArray(function (err, result) {
            if (err) {
                console.log('login error')
                return done(err);
            } else {
                if (result.length > 0) {
                    console.log('have been login', result)
                    return done(null, result[0]);
                } else {
                    console.log('first login')
                    var newUser = {};

                    // set all of the relevant information
                    newUser.id = profile.id;
                    newUser.token = accessToken;
                    newUser.name = profile.displayName;
                    newUser.email = profile.emails[0].value;
                    newUser.thumbnail = profile._json.image.url

                    users.insert(newUser, (err) => {
                        if (err) {
                            throw err;
                        }
                        console.log('Data inserted');
                        done(null, newUser);
                    });
                }
            }
        });
    })
);