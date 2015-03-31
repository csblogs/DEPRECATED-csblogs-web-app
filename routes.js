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
        res.render('register');
      })
      .post(ensureAuthenticated, function(req, res) {
        newBlogger = new blogger({firstname:          req.body.firstName,
                                  lastname:           req.body.lastName,
                                  displayPictureUrl:  req.body.displayPictureUrl,
                                  emailAddress:       req.body.emailAddress,
                                  feedUrl:            req.body.feedUrl,
                                  blogWebsiteUrl:     req.body.blogWebsiteUrl,
                                  websiteUrl:         req.body.websiteUrl,
                                  cvUrl:              req.body.cvUrl,
                                  githubProfile:      req.body.githubProfile,
                                  twitterProfile:     req.body.twitterProfile,
                                  linkedInProfile:    req.body.linkedInProfile,
                                  bio:                req.body.bio,
                                  validated:          false});

        if(newBlogger.isValid(false)) {
          newBlogger.save();
          res.render('register-success');
        }
        else {
          res.render('register', {title: 'Register / CS Blogs', issues: newBlogger.isValid(true)});
        }
      });

//    app.get('/register', function(req, res) {
//        res.render('register', {title: 'Register / CS Blogs'});
//    });

  app.get('/blogs', function(req, res) {
      var blogs = require('./test-data/blogs.json');
      res.render('blogs', {title: 'Blogs / CS Blogs', content: blogs});
  });
}
