"use strict";

var URI = require('URIjs');
var BloggerController = require('./controllers/blogger');
var BlogController = require('./controllers/blog');
var blogger = require('./models/blogger').Blogger;
var blog = require('./models/blog').Blog;
var authentication = require('./authentication');
var ensureAuthenticated = authentication.ensureAuthenticated;
var paginate = require('./server').paginate;
var defaultLimit = 10;

exports.serveRoutes = function(app) {
    app.get('/', function(req, res) {
        var url = '/?';
        if (req.query.limit != defaultLimit) {
            url += 'limit=' + req.query.limit + '&'
        }

        var columns = {
            userId: 1,
            userProvider: 1,
            firstName: 1,
            lastName: 1,
            avatarUrl: 1,
            vanityUrl: 1
        };

        BloggerController.getValidatedBloggers(function(error, ids, providers) {
            if (error) {
                internalError(res, error.$err);
            }
            else {
                var options = {
                    userId: {$in: ids},
                    userProvider: {$in: providers}
                };

                BlogController.getPaginatedBlogs(options, true, columns, req,
                    function(blogs, pageNumber, showBack, showNext, error) {
                        if (error) { internalError(res, error); }
                        else {
                            res.render('blogs', {
                                title: 'Home / CS Blogs',
                                blogs: blogs,
                                url: url,
                                pageNumber: pageNumber,
                                hasLess: showBack,
                                hasMore: showNext,
                                user: req.user
                            });
                        }
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

    app.get('/confirm-delete', ensureAuthenticated, function (req, res) {
        res.render('confirm-delete', {
            title: 'Confirm account deletion / CS Blogs',
            user: req.user
        });
    });

    app.get('/delete-account', ensureAuthenticated, function (req, res) {
        authentication.deleteUser(req.user);
        req.logout();
        res.redirect('/');
    })

    app.get('/profile', ensureAuthenticated, function(req, res) {
        var url = '/profile?';
        if (req.query.limit != defaultLimit) {
            url += 'limit=' + req.query.limit + '&'
        }

        BloggerController.getUserProfile(req.user, req, function(profile, page, error) {
            if (error) { internalError(res, error); }
            else {
                if (profile == null) {
                    res.redirect('/register');
                }
                else {
                    var pageTitle = profile.firstName + ' ' + profile.lastName + ' / CS Blogs';

                    res.render('profile', {
                        title: pageTitle,
                        url: url,
                        blogger: profile,
                        page: page,
                        user: req.user
                    });
                }
            }
        });
    });

    app.get('/bloggers', function(req, res) {
        BloggerController.getAllProfiles(true, {}, function(allProfiles, error) {
            if (error) { internalError(res, error); }
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
        var url = '/bloggers/' + vanityUrl + '?';
        if (req.query.limit != defaultLimit) {
            url += 'limit=' + req.query.limit + '&'
        }

        BloggerController.getProfileByVanityUrl(vanityUrl, req, function(profile, page, error) {
           if (error) { internalError(res, error); }
           else {
               if (!profile || !profile.validated) { renderError(res, 404, "Sorry, there is no user named " + vanityUrl); }
               else {
                   var pageTitle = profile.firstName + ' ' + profile.lastName + ' / CS Blogs';
                   res.render('profile', {
                       title: pageTitle,
                       url: url,
                       blogger: profile,
                       page: page,
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
                // User is logged in with an account, but not registered.
                // We need to parse thier data out and put it into the form
                // to aid them filling it in.
                var userAsBlogger = authentication.getBloggerFieldsFromAuthenticatedUser(req.user);

                res.render('register', {
                    title: 'Register / CS Blogs',
                    submitText: 'Add your blog',
                    postAction: 'register',
                    user: userAsBlogger
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
                    newBlogger.avatarUrl = new URI(req.user._json.avatar_url).removeSearch("v");
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

            BloggerController.validate(newBlogger, function(validBlogger, errors, dbError) {
                if (dbError) {
                    internalError(res, dbError);
                }
                else if (errors.length > 0) {
                    res.render('register', {
                            title: 'Register / CS Blogs',
                            submitText: 'Add your blog',
                            postAction: 'register',
                            user: newBlogger,
                            errors: errors
                        });
                }
                else {
                    validBlogger.save();
                    req.session.passport.user = validBlogger;
                    res.redirect('/profile');
                }
            });
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

        var newBlogger = new blogger({
            _id:                req.user._id,
            userId:             req.user.userId,
            userProvider:       req.user.userProvider,
            avatarUrl:          req.user.avatarUrl,
            firstName: 			req.body.firstName,
            lastName: 			req.body.lastName,
            emailAddress: 		req.body.emailAddress,
            feedUrl: 			req.body.feedUrl,
            blogWebsiteUrl: 	req.body.blogWebsiteUrl,
            websiteUrl: 		req.body.websiteUrl,
            cvUrl: 				req.body.cvUrl,
            githubProfile:      req.body.githubProfile,
            twitterProfile: 	req.body.twitterProfile,
            linkedInProfile: 	req.body.linkedInProfile,
            bio: 				req.body.bio,
            vanityUrl:          req.body.vanityUrl,
            validated:          req.user.validated
        });

        BloggerController.validate(newBlogger, function(validBlogger, errors, dbError) {
            if (dbError) {
                internalError(res, dbError);
            }
            else if (errors.length > 0) {
                res.render('register', {
                    title: 'Account / CS Blogs',
                    submitText: 'Update profile',
                    postAction: 'account',
                    user: newBlogger,
                    errors: errors
                });
            }
            else {
                BloggerController.updateProfile(req.user, validBlogger.toObject(), function(updateError, numAffected) {
                    if (updateError) {
                        internalError(res, updateError);
                    }
                    else {
                        req.session.passport.user = validBlogger;
                        res.redirect('/profile');
                    }
                });
            }
        });
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

    // Code to call any error code (could replace internalError)
    function renderError(res, errorCode, errorMessage) {
        res.status(errorCode);
        res.render('error', {
            title: 'Error ' + errorCode + ' / CS Blogs',
            errorCode: errorCode,
            errorMessage: errorMessage
        });
    }
};
