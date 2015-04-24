var blogger = require('./models/blogger').Blogger;
var authentication = require('./authentication');
var ensureAuthenticated = authentication.ensureAuthenticated;

module.exports = function(app) {
    authentication.serveOAuthRoutes(app);

    app.get('/', function(req, res) {
		console.log("/ called");
		
        res.render('index', {
            title: 'Index / CS Blogs',
            user: req.user
        });
    });

    app.get('/login', function(req, res) {
		console.log("/login called");
		
        res.render('login', {
            title: 'Login / CS Blogs'
        });
    });

    app.get('/profile', ensureAuthenticated, function(req, res) {
		console.log("/profile called");
		
		if(req.user.userProvider && req.user.userId) {
			console.log("Registered user");
			console.log("Blogger user: %j", req.user);
			var nameTitle = req.user.firstName + ' ' + req.user.lastName + ' / CS Blogs';
            res.render('profile', {
                title: nameTitle,
                blogger: req.user,
				user: req.user
            });
		}
		else {
			console.log("Not a registered user");
			console.log("Passport.js user: %j", req.user);
			res.redirect('/register');
		}
    });

    app.route('/account')
        .get(ensureAuthenticated, function(req, res) {
			console.log("/account called");
			
            res.render('register', {
                title: 'Account / CS Blogs',
                submitText: 'Update profile',
                user: req.user
            });
        })
        .post(ensureAuthenticated, function(req, res) {});

    app.get('/bloggers', function(req, res) {
		console.log("/bloggers called");
		
        blogger.find({}, function(error, allBloggers) {
            if (error || !allBloggers) {
                internalError(res, error ? error : "No bloggers found.");
            } else {
                res.render('bloggers', {
                    title: 'Bloggers / CS Blogs',
                    bloggers: allBloggers,
                    user: req.user
                });
            }
        });
    });

    app.get('/bloggers/:vanityurl', function(req, res) {
		console.log("/bloggers/:vanityurl called")
        renderBlogger(req, res);
    });

    app.get('/b/:vanityurl', function(req, res) {
		console.log("/b/:vanityurl called");
        renderBlogger(req, res);
    });

    function renderBlogger(req, res) {
        var userVanityUrl = req.params.vanityurl;

        blogger.findOne({vanityUrl: userVanityUrl}, function(error, profile) {
            if (error || !profile) {
                internalError(res, error ? error : 'Blogger profile not found.');
            }
            else {
                var nameTitle = profile.firstName + ' ' + profile.lastName + ' / CS Blogs';
                res.render('profile', {
                    title: nameTitle,
                    blogger: profile,
                    user: req.user
                });
            }
        });
    }

    app.route('/register')
        .get(ensureAuthenticated, function(req, res) {
			console.log("/register GET called");
			
            var usersName = req.user.displayName.split(' ');
            req.user.firstname = usersName[0];
            req.user.lastname = usersName[1];
            res.render('register', {
                title: 'Register / CS Blogs',
                submitText: 'Add your blog',
                user: req.user
            });
        })
        .post(ensureAuthenticated, function(req, res) {
			console.log("/register POST called");
			
            newBlogger = new blogger({
                userProvider: req.user.provider,
                userId: req.user.id,
                firstName: req.body.first_name,
                lastName: req.body.last_name,
                avatarUrl: req.user._json.avatar_url,
                emailAddress: req.body.email,
                feedUrl: req.body.feed_url,
                blogWebsiteUrl: req.body.blog_url,
                websiteUrl: req.body.site_url,
                cvUrl: req.body.cv_url,
                githubProfile: req.body.github_name,
                twitterProfile: req.body.twitter_name,
                linkedInProfile: req.body.linkedIn_name,
                bio: req.body.bio,
                vanityUrl: req.body.vanity_url,
                validated: false
            });
            newBlogger.save();
            res.redirect('/profile');
    });

    app.get('/blogs', function(req, res) {
		console.log("/blogs called");
		
        var blogs = require('./test-data/blogs.json');
        res.render('blogs', {
            title: 'Blogs / CS Blogs',
            content: blogs,
            user: req.user
        });
    });

	app.get('/logout', function(req, res) {
		console.log("/logout called");
	  	req.logout();
	  	res.redirect('/');
	});

    // Handle error 404
    app.use(function(req, res) {
		console.error("ERROR 404. Request: %j", req);
		
        res.status(404);
        res.render('error', {
            title: 'Error 404 / CS Blogs',
            errorCode: 404,
            errorMessage: 'Page Not Found',
            user: req.user
        });
    });

    // Handle error 500
    app.use(function(error, req, res, next) {
		console.error("ERROR 500. Error: %j", error);
        internalError(res, error);
    });

    function internalError(res, errorMessage) {
        res.status(500);
        res.render('error', {
            title: 'Error 500 / CS Blogs',
            errorCode: 500,
            errorMessage: errorMessage
        });
    }
}
