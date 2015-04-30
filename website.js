var BloggerController = require('./controllers/blogger');
var BlogController = require('./controllers/blog');
var blogger = require('./models/blogger').Blogger;
var blog = require('./models/blog').Blog;
var authentication = require('./authentication');
var ensureAuthenticated = authentication.ensureAuthenticated;
var paginate = require('./server').paginate;

exports.serveRoutes = function(app) {
    app.get('/', function(req, res) {
        BlogController.getPaginatedBlogs({}, req, function(blogs, pageNumber, showBack, showNext, error) {
            if(error) { internalError(res, error); }
            else {
                res.render('blogs', {
    	            title: 'Blogs / CS Blogs',
    	            content: blogs,
                    page: pageNumber,
                    hasLess: showBack,
                    hasMore: showNext,
    	            user: req.user
    	        });
            }
        });
    });
    
    app.get('/login', function(req, res) {
        res.render('login', {
            title: 'Login / CS Blogs'
        });
    });
    
	app.get('/logout', function(req, res) {
	  	req.logout();
	  	res.redirect('/');
	});

    app.get('/profile', ensureAuthenticated, function(req, res) {
        BloggerController.getUserProfile(req.user, function(profile, error) {
            if(error) { internalError(res, error); }
            else {  
                if(profile == null) {
                    res.redirect('/register');
                } 
                else {
                    var pageTitle = profile.firstName + ' ' + profile.lastName + ' / CS Blogs';
                    
                    res.render('profile', {
                        title: pageTitle,
                        blogger: profile,
                        user: req.user
                    });
                }
            }
        });
    });

    app.get('/bloggers', function(req, res) {
        BloggerController.getAllProfiles(true, function(allProfiles, error) {
            if(error) { internalError(res, error); }
            else {
                res.render('bloggers', {
                    title: 'Bloggers / CS Blogs',
                    bloggers: allProfiles,
                    user: req.user
                });
            }
        });
    });

    app.get('/bloggers/:vanityurl', function(req, res) {
        var vanityUrl = req.params.vanityurl;
        BloggerController.getProfileByVanityUrl(vanityUrl, function (profile, error) {
           if(error) { internalError(res, error); }
           else {
               if(!profile) { internalError(res, "Sorry, there is no user called %s", vanityUrl); }
               else {
                   var pageTitle = profile.firstName + ' ' + profile.lastName + ' / CS Blogs';
                   res.render('profile', {
                        title: pageTitle,
                        blogger: profile,
                        user: req.user
                    });
               }
           } 
        });
    });

    app.route('/register')
        .get(ensureAuthenticated, function(req, res) {
			if (authentication.isRegistered(req.user)) {
	            internalError(res, "You are already registered");
			}
			else {
				//User is logged in with an account, but not registered.
				//We need to parse thier data out and put it into the form
				//to aid them filling it in.
                var userAsBlogger = authentication.getBloggerFieldsFromAuthenticatedUser(req.user);
                
	            res.render('register', {
	                title: 'Register / CS Blogs',
	                submitText: 'Add your blog',
					postAction: 'register',
	                user: userAsBlogger,
	            });
			}
        })
        .post(ensureAuthenticated, function(req, res) {            	
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
			
            //VALIDATE FIELDS HERE
            //newBlogger.validate();
            
            newBlogger.save();
			req.session.passport.user = newBlogger;			
            res.redirect('/profile');
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
    	
    // Code to call errors ourselves
    function internalError(res, errorMessage) {
        res.status(500);
        res.render('error', {
            title: 'Error 500 / CS Blogs',
            errorCode: 500,
            errorMessage: errorMessage
        });
    }
};
