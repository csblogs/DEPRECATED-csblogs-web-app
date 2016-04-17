"use strict";

var passport = require('passport');
var Blogger = require('./models/blogger').Blogger;
var Blog = require('./models/blog').Blog;
var GitHubStrategy = require('passport-github2').Strategy;
var WordpressStrategy = require('passport-wordpress').Strategy;
var StackExchangeStrategy = require('passport-stackexchange').Strategy;
var URI = require('URIjs'); 

function normalizeUser(profile, callback) {
	var identifier = '';
	switch(profile.provider) { 
		case 'github':
			identifier = profile.id;
			break;
		case 'Wordpress':
			identifier = profile._json.ID;
			break;
		case 'stackexchange':
			identifier = profile.user_id;
			break;
	}
	
	// Find user in database
    Blogger.findOne({userProvider: profile.provider, userId: identifier}, function(error, userInDB) {
        if (error) {
	        console.error("[ERROR] Error occured finding user in DB: %j", error);
			callback(null);
        }
        else if (!userInDB) {
            //Blogger not registered.
			callback(profile);
        }
        else {
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
        console.log("[INFO] Github User logged in: %s", profile.id);
		normalizeUser(profile, function(normalizedUser) {
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
        console.log("[INFO] WordPress User logged in: %s", profile.id);
		normalizeUser(profile, function(normalizedUser) {
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
        console.log("[INFO] Stack Exchange User logged in: %s", profile.id);
		normalizeUser(profile, function(normalizedUser) {
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
		console.log("[INFO] User (id: %s) is already logged in", req.user.id);
        return next();
    } else {
        // Not logged in
        res.redirect('/login');
    }
};

exports.getBloggerFieldsFromAuthenticatedUser = function (passportjsUser) {
    var userAsBlogger = null;
    switch(passportjsUser.provider) {
    	case 'github':
            var avatarUrl = new URI(passportjsUser._json.avatar_url).removeSearch("v"); //Remove version from Github, this means the most recent pic is always used.
             				
            userAsBlogger = new Blogger({
    			avatarUrl: 		avatarUrl,		
                emailAddress: 	passportjsUser._json.email,
                blogWebsiteUrl: passportjsUser._json.blog,
                githubProfile: 	passportjsUser._json.login,
                bio: 			passportjsUser._json.bio,
                vanityUrl: 		passportjsUser.username.replace(/\s+/g, '-').toLowerCase()
            });
            
            //Check displayName for first/last name combinations
            if (passportjsUser.displayName != null)
            {
	            if (passportjsUser.displayName.contains(' '))
	            {
		            var name = passportjsUser.displayName.split(' ');
		            userAsBlogger.firstName = name[0];
		            userAsBlogger.lastName = name[name.length - 1];
	            }
	            else
	            {
		            userAsBlogger.firstName = passportjsUser.displayName;
	            }
            }
            
    		break;
    	case 'Wordpress':
            userAsBlogger = new Blogger({
    			avatarUrl: 		passportjsUser._json.avatar_URL,
                emailAddress: 	passportjsUser._json.email,
                feedUrl:        "http://" + passportjsUser.displayName + ".wordpress.com/feed",
                blogWebsiteUrl: "http://" + passportjsUser.displayName + ".wordpress.com",
                vanityUrl: 		passportjsUser._json.display_name.replace(/\s+/g, '-').toLowerCase()
            });
    		break;
    	case 'stackexchange':
            userAsBlogger = new Blogger({
    			avatarUrl: 		passportjsUser.profile_image,
                vanityUrl: 		passportjsUser.display_name,
    			websiteUrl: 	passportjsUser.website_url
            });
    		break;
    }
    return userAsBlogger; 
};

exports.isRegistered = function (passportjsUser) {
    //If a user has userProvider and userId attributes instead of id and provider attributes
    //then they have been registered (these variables are only set once registered)
    return (passportjsUser.userProvider && passportjsUser.userId);
};

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
};

exports.deleteUser = function(passportJSUser) {
    Blogger.findOne({userId: passportJSUser.userId, userProvider: passportJSUser.userProvider}).remove().exec();
    Blog.find({userId: passportJSUser.userId, userProvider: passportJSUser.userProvider}).remove().exec();
};
