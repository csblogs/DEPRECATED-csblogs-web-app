var passport = require('passport');
var blogger = require('./models/blogger').Blogger;
var GitHubStrategy = require('passport-github').Strategy;
var WordpressStrategy = require('passport-wordpress').Strategy;
var StackExchangeStrategy = require('passport-stackexchange').Strategy;

function normalizeUser(profile, callback) {
	console.log("PROFILE:  %j\n\n", profile);
	
	var identifier = '';
	switch(profile.provider) { 
		case 'github':
			identifier = profile.id;
			break;
		case 'Wordpress':
			identifier = profile._json.ID;
			break;
	}
	
	// Find user in database
    blogger.findOne({userProvider: profile.provider, userId: identifier}, function(error, userInDB) {
        if (error) {
	        console.error("Error occured finding user in DB: %j", error);
            internalError(res, error);
			callback(null);
        }
        else if (!userInDB) {
            //Blogger not registered.
			console.log("NO USER IN DB");
			callback(profile);
        }
        else {
	        console.log("USER IN DB: %j\n\n", userInDB);
            callback(userInDB);
        }
    });
}

//Github
passport.use(new GitHubStrategy({
        clientID: "fc9c9385c837b9eb420b",
        clientSecret: "2d8dec98f7cdc5259f6b3ee0bafb7c7fc42a94b1",
        //We're gonna change these secrets @ launch. Not a security issue having theme here atm.
        callbackURL: "http://csblogs.com/auth/github/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        console.log("Github User logged in: " + profile.id);
		normalizeUser(profile, function(normalizedUser) {
			console.log("Normalized User: %j", normalizedUser);
			if(normalizedUser != null) {
				done(null, normalizedUser);
			}
			else {
				//Error
				done(normalizedUser);
			}
		});
    }
));

//Wordpress
passport.use(new WordpressStrategy({
        clientID: "39952",
        clientSecret: "pIdHytvmIIxCTFnl6zfAf1kAZctj3QqeVNGsRZbGlV3ip8HBe17bKnlHqwS3Vy4u",
        callbackURL: "http://csblogs.com/auth/wordpress/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        console.log("WordPress User logged in: " + profile.id);
		normalizeUser(profile, function(normalizedUser) {
			console.log("Normalized User: %j", normalizedUser);
			if(normalizedUser != null) {
				done(null, normalizedUser);
			}
			else {
				//Error
				done(normalizedUser);
			}
		});
    }
));

//Stack Exchange
passport.use(new StackExchangeStrategy({
        clientID: "4485",
        clientSecret: "SkkfxnIq2oUb0V1DnjRkyQ((",
        callbackURL: "http://csblogs.com/auth/stack-exchange/callback",
        key: "B)qtqv9BuljF8MvlPjxbLw(("
    },
    function(accessToken, refreshToken, profile, done) {
        console.log("Stack Exchange User logged in: " + profile.id);
		normalizeUser(profile, function(normalizedUser) {
			console.log("Normalized User: %j", normalizedUser);
			if(normalizedUser != null) {
				done(null, normalizedUser);
			}
			else {
				//Error
				done(normalizedUser);
			}
		});
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

exports.Passport = passport;

exports.ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
		console.log("User logged in")
        return next();
    } else {
        console.log("Not logged in")
        res.redirect('/login');
    }
}

exports.serveOAuthRoutes = function(app) {
    //Github routes
    app.get('/auth/github', passport.authenticate('github'));

    app.get('/auth/github/callback',
        passport.authenticate('github', {
            successRedirect: '/profile',
            failureRedirect: '/login',
            failureFlash: true
        }));

    //Wordpress routes
    app.get('/auth/wordpress', passport.authenticate('wordpress'));

    app.get('/auth/wordpress/callback',
        passport.authenticate('wordpress', {
            successRedirect: '/profile',
            failureRedirect: '/login',
            failureFlash: true
        }));

    //Stack Exchange routes
    app.get('/auth/stack-exchange', passport.authenticate('stackexchange'));

    app.get('/auth/stack-exchange/callback',
        passport.authenticate('stackexchange', {
            successRedirect: '/profile',
            failureRedirect: '/login',
            failureFlash: true
        }));
}
