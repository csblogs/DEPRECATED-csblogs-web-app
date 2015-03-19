var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var WordpressStrategy = require('passport-wordpress').Strategy;
var StackExchangeStrategy = require('passport-stackexchange').Strategy;

//Github
passport.use(new GitHubStrategy({
    clientID: "fc9c9385c837b9eb420b",
    clientSecret: "2d8dec98f7cdc5259f6b3ee0bafb7c7fc42a94b1", //We're gonna change these secrets @ launch. Not a security issue having theme here atm.
    callbackURL: "http://csblogs.com/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log("Github User logged in: " + profile.id);
    done(null, profile);
  }
));

//Wordpress
passport.use(new WordpressStrategy({
    clientID: "39952",
    clientSecret: "pIdHytvmIIxCTFnl6zfAf1kAZctj3QqeVNGsRZbGlV3ip8HBe17bKnlHqwS3Vy4u",
    callbackURL: "http://csblogs.com/auth/wordpress/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log("Wordpress User logged in: " + profile.id);
    done(null, profile);
  }
));

//Stack Exchange
passport.use(new StackExchangeStrategy({
    clientID: "4485",
    clientSecret: "SkkfxnIq2oUb0V1DnjRkyQ((",
    callbackURL: "http://csblogs.com/auth/wordpress/callback",
    key: "B)qtqv9BuljF8MvlPjxbLw(("
  },
  function(accessToken, refreshToken, profile, done) {
    console.log("Stack Exchange User logged in: " + profile.id);
    done(null, profile);
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
  if(req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('/login');
  }
}

exports.serveOAuthRoutes = function(app) {
  //Github routes
  app.get('/auth/github', passport.authenticate('github'));

  app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login/failed' }),
    function(req, res) {
      // Successful authentication
      res.redirect('/profile');
    });

  //Wordpress routes
  app.get('/auth/wordpress', passport.authenticate('wordpress'));

  app.get('/auth/wordpress/callback',
    passport.authenticate('wordpress', { failureRedirect: '/login/failed' }),
    function(req, res) {
      // Successful authentication
      res.redirect('/profile');
    });

  //Stack Exchange routes
  app.get('/auth/stack-exchange', passport.authenticate('stackexchange'));

  app.get('/auth/stack-exchange/callback',
    passport.authenticate('stackexchange', { failureRedirect: '/login/failed' }),
    function(req, res) {
      // Successful authentication
      res.redirect('/profile');
    });
}
