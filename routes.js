var blogger = require('./models/blogger').Blogger;
var authentication = require('./authentication');
var ensureAuthenticated = authentication.ensureAuthenticated;

module.exports = function(app) {
  authentication.serveOAuthRoutes(app);

  app.get('/', function(req, res) {
      res.render('index', {title: 'Index / CS Blogs'});
  });

  app.get('/login', function(req, res) {
      res.render('login', {title : 'Login / CS Blogs'});
  });

  app.get('/profile', ensureAuthenticated, function(req, res) {
      // Use provider id to get user from database
      console.log(req.user);
      blogger.findOne({userProvider: req.user.provider, userId: req.user.id}, function(error, profile) {
        console.log(profile)
        console.error(error);        
        if(error) {
            internalError(res, error ? error : "Unknown error connecting to blogger database");
        }
        else if(!profile) {
            //Blogger not registered.
            res.redirect('/register');
        } 
        else {
            var nameTitle = profile.firstName + ' ' + profile.lastName + ' / CS Blogs';
            res.render('profile', {title: nameTitle, blogger: profile});
        } 
      });
  });

  app.get('/bloggers', function(req, res) {
      blogger.find({}, function(error, allBloggers) {
        if (error || !allBloggers) {
            internalError(res, error ? error : "No bloggers found.");
        }
        else {
            res.render('bloggers', {title: 'Bloggers / CS Blogs', bloggers: allBloggers});
        }
      });
  });

  app.get('/bloggers/:vanityurl', function(req, res) {
      renderBlogger(req, res);
  });

  app.get('/b/:vanityurl', function(req, res) {
      renderBlogger(req, res);
  });

  function renderBlogger(req, res) {
      var userVanityUrl = req.params.vanityurl;

      blogger.findOne({vanityUrl: userVanityUrl}, function(error, profile) {
          if (error || !profile) {
              internalError(res, error ? error : "Blogger profile not found.");
          }
          else {
              var nameTitle = profile.firstName + ' ' + profile.lastName + ' / CS Blogs';
              res.render('profile', {title: nameTitle, blogger: profile});
          }
      });
  }

  app.route('/register')
  	.get(ensureAuthenticated, function(req, res) {
        var usersName = req.user.displayName.split(' ');
        req.user.firstname = usersName[0];
        req.user.lastname = usersName[1];
        res.render('register', {title: 'Register / CS Blogs', submitText: 'Add your blog', user: req.user});
  	})
	.post(ensureAuthenticated, function(req, res) {
		newBlogger = new blogger({
                                  userProvider:       req.user.provider,
                                  userId:             req.user.id,
                                  firstName:          req.body.first_name,
		                          lastName:           req.body.last_name,
                                  avatarUrl:          req.user._json.avatar_url,
		                          emailAddress:       req.body.email,
		                          feedUrl:            req.body.feed_url,
		                          blogWebsiteUrl:     req.body.blog_url,
		                          websiteUrl:         req.body.site_url,
		                          cvUrl:              req.body.cv_url,
		                          githubProfile:      req.body.github_name,
		                          twitterProfile:     req.body.twitter_name,
		                          linkedInProfile:    req.body.linkedIn_name,
		                          bio:                req.body.bio,
								  vanityUrl: 		  req.body.vanity_url,
		                          validated:          false});
        newBlogger.save();
		res.redirect('/profile');
	});

    app.get('/blogs', function(req, res) {
      var blogs = require('./test-data/blogs.json');
      res.render('blogs', {title: 'Blogs / CS Blogs', content: blogs});
    });
    
    // Handle error 404
    app.use(function(req, res) {
        res.status(404);
        res.render('error', {title: 'Error 404 / CS Blogs', errorCode: 404, errorMessage: 'Page Not Found'});
    });
    
    // Handle error 500
    app.use(function(error, req, res, next) {
        internalError(res, error);
    });
    
    function internalError(res, errorMessage) {
        res.status(500);
        res.render('error', {title: 'Error 500 / CS Blogs', errorCode: 500, errorMessage: errorMessage});
    }
}
