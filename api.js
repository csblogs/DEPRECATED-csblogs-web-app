"use strict";

var BlogController = require('./controllers/blog');
var BloggerController = require('./controllers/blogger');

exports.serveRoutes = function(router) {
    router.get('/v0.1/blogs', function(req, res) {
        var includeAuthor = true;
        var bloggerFilter = {};

        if (req.query.authors) {
            if (req.query.authors === 'false') {
                includeAuthor = false;
            }
            else if (req.query.authors === 'minimal') {
                bloggerFilter = {
                    cvUrl: 0,
                    githubProfile: 0,
                    twitterProfile: 0,
                    linkedInProfile: 0,
                    bio: 0
                };
            }
        }

        BlogController.getPaginatedBlogs({}, includeAuthor, bloggerFilter, req,
            function(blogs, pageNumber, showBack, showNext, error) {
                if (error) {
                    res.send(error);
                }
                else {
                    if (req.query.original !== 'true') {
                        BlogController.removeAllHTML(blogs, 400);
                    }

                    var page = {
                        blogs: blogs,
                        pageNumber: pageNumber,
                        hasLess: showBack,
                        hasMore: showNext
                    };

                    res.json(page);
                }
        });
    });

    router.get('/v0.1/bloggers', function(req, res) {
        BloggerController.getAllProfiles(true, function (profiles, error) {
            if(error) {
                res.send(error);
            }
            else {
                res.json(profiles);
            }
        });
    });

    router.get('/v0.1/bloggers/:vanityurl', function(req, res) {
        var vanityUrl = req.params.vanityurl;
        BloggerController.getProfileByVanityUrl(vanityUrl, req, function (profile, page, error) {
            if(error) {
                res.send(error);
            }
            else if (profile && page) {
                var blogger = {
                    profile: profile,
                    page: page
                };
                res.json(blogger);
            }
            else {
                sendError(res, 404, 'Blogger not found');
            }
        });
    });

    // Handle error 404
    router.use(function(req, res) {
        console.error('ERROR 404. Request: %j', req);
        res.status(404);
        res.json({
            error: '404 Not Found'
        });
    });

    // Handle error 500
    router.use(function(error, req, res, next) {
        console.error("ERROR 500. Error: %j", error);
        res.status(500);
        res.json({
            error: 'Internal Server Error: ' + error
        });
    });

    function sendError(res, errorCode, errorMessage) {
        res.status(errorCode);
        res.json({
            error: errorMessage
        });
    }
};
