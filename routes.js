var blogger = require('./models/blogger').Blogger;
var blog = require('./models/blog').Blog;
var authentication = require('./authentication');
var ensureAuthenticated = authentication.ensureAuthenticated;

module.exports = function(app) {
    authentication.serveOAuthRoutes(app);

    app.get('/login', function(req, res) {
		console.log("/login called");
		
        res.render('login', {
            title: 'Login / CS Blogs'
        });
    });

    app.get('/profile', ensureAuthenticated, function(req, res) {
		console.log("/profile called");
		console.log('\n\n\n\nREQ.USER in profile', req.user);
		
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
			console.log("/account GET called");
			
            res.render('register', {
                title: 'Account / CS Blogs',
                postAction: 'account',
                submitText: 'Update profile',
                user: req.user
            });
        })
        .post(ensureAuthenticated, function(req, res) {
            console.log('/account POST called');
    });

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

			if(req.user.userProvider && req.user.userId) {
				//Already registered user doing an edit.
	            res.render('register', {
	                title: 'Edit Account / CS Blogs',
	                submitText: 'Update',
					postAction: 'account',
	                user: req.user
	            });
			}
			else {
				//User is logged in with an account, but not registered.
				//We need to parse thier data out and put it into the form
				//to aid them filling it in.
				switch(req.user.provider) {
					case 'github':
			            var usersName = req.user.displayName.split(' ');				
			            var userAsBlogger = new blogger({
							avatarUrl: 		req.user._json.avatar_url,
			                firstName: 		usersName[0],
			                lastName: 		usersName[1],
			                emailAddress: 	req.user._json.email,
			                blogWebsiteUrl: req.user._json.blog,
			                githubProfile: 	req.user._json.login,
			                bio: 			req.user._json.bio,
			                vanityUrl: 		req.user.username,
			            });
						break;
					case 'Wordpress':
			            var userAsBlogger = new blogger({
							avatarUrl: 		req.user._json.avatar_URL,
			                emailAddress: 	req.user._json.email,
			                blogWebsiteUrl: "http://" + req.user._json.user + ".wordpress.com",
			                vanityUrl: 		req.user._json.display_name,
			            });
						break;
					case 'stackexchange':
			            var userAsBlogger = new blogger({
							avatarUrl: 		req.user.profile_image,
			                vanityUrl: 		req.user.display_name,
							websiteUrl: 	req.user.website_url
			            });
						break;
				}
				
	            res.render('register', {
	                title: 'Register / CS Blogs',
	                submitText: 'Register',
					postAction: 'register',
	                user: userAsBlogger,
	            });
			}
        })
        .post(ensureAuthenticated, function(req, res) {
			console.log("/register POST called");
			
			//VALIDATE FIELDS HERE
			
			var newBlogger = new blogger({
                userProvider: 		req.user.provider,
                firstName: 			req.body.firstName,
                lastName: 			req.body.lastName,
                emailAddress: 		req.body.emailAddress,
                feedUrl: 			req.body.feedUrl,
                blogWebsiteUrl: 	req.body.blogWebsiteUrl,
                websiteUrl: 		req.body.websiteUrl,
                cvUrl: 				req.body.cvUrl,
                githubProfile: 		req.body.githubProfile,
                twitterProfile: 	req.body.twitterProfile,
                linkedInProfile: 	req.body.linkedInProfile,
                bio: 				req.body.bio,
                vanityUrl: 			req.body.vanityUrl,
                validated: 			false
            });
			
			switch(req.user.provider) {
				case 'github':
                	newBlogger.userId = req.user.id,
					newBlogger.avatarUrl = req.user._json.avatar_url;
					break;
				case 'Wordpress':
					newBlogger.userId = req.user._json.ID;
					newBlogger.avatarUrl = req.user._json.avatar_URL;
					break;
				case 'stackexchange':
					newBlogger.userId = req.user.user_id;
					newBlogger.avatarUrl = req.user.profile_image;
					break;
			}
			
            newBlogger.save();
			req.session.passport.user = newBlogger;			
            res.redirect('/profile');
    });

    app.get('/', function(req, res) {
		console.log("/ called");
		
	    blog.find(function(error, blogs) {
	        if (error) {
				internalError(res, error);
			}
			else
			{
		        blogger.find({}, function(error, allBloggers) {
		            if (error || !allBloggers) {
		                internalError(res, error ? error : "No bloggers found.");
		            } else {
						blogs.forEach(function(thisBlog) {
							thisBlog.author = allBloggers.filter(function(element) {
								return ((element.userId == thisBlog.userId) && (element.userProvider == thisBlog.userProvider));
							});
						})
						
				        res.render('blogs', {
				            title: 'Blogs / CS Blogs',
				            content: blogs,
				            user: req.user
				        });
		            }
		        });
			}
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
