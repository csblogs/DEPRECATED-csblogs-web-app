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
      res.render('profile', {title: 'Your Profile / CS Blogs'});
  });

  app.get('/bloggers', function(req, res) {
      bloggers = blogger.find({}, function(error, allBloggers) {
        if(error) {
          res.render('error', {title: 'Error / CS Blogs', error: error});
        }
        else {
          res.render('bloggers', {title: 'Bloggers / CS Blogs', bloggers: allBloggers});
        }
      });
  });
  
  app.route('/register')
  	.get(ensureAuthenticated, function(req, res) {
      var usersName = req.user.displayName.split(' ');
      req.user.firstname = usersName[0];
      req.user.lastname = usersName[1];
      res.render('register', {title: 'Register / CS Blogs', submitText: 'Add your blog', user: req.user});
  	});
	.post(ensureAuthenticated, function(req, res) {
		newBlogger = new blogger({firstname:          req.body.first_name,
		                          lastname:           req.body.last_name,
		                          displayPictureUrl:  req.user._json.avatar_url,
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
    
    app.get('/debugreg', function(req, res) {
        res.render('register', {title: 'Register / CS Blogs', submitText: 'Add your blog'});
    });

  app.get('/blogs', function(req, res) {
      var blogs = require('./test-data/blogs.json');
      res.render('blogs', {title: 'Blogs / CS Blogs', content: blogs});
  });
}
