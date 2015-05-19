"use strict";

var BlogController = require('./controllers/blog');
var BloggerController = require('./controllers/blogger');
var RSS = require('rss');

exports.serveRoutes = function(router) {
    router.get('/main', function(req, res) {
        var mainFeed = new RSS({
            title: "Computer Science Blogs",
            description: "All of the posts from bloggers on CSBlogs.com",
            feed_url: "http://feeds.csblogs.com/main",
            site_url: "http://csblogs.com",
            image_url: "http://csblogs.com/apple-touch-icon-precomposed.png",
            custom_namespaces: {
                media: "http://search.yahoo.com/mrss/"
            }
        });

        BloggerController.getValidatedBloggers(function(error, ids, providers) {
            if (error) {
                internalError(res, error.$err);
            }
            else {
                var options = {
                    userId: {$in: ids},
                    userProvider: {$in: providers}
                };

                BlogController.getMostRecentBlogs(options, 20, function(blogs, error) {
                    if (req.query.original !== 'true') {
                        BlogController.removeAllHTML(blogs, 400);
                    }
                    for (var i = 0; i < blogs.length; ++i) {
                        if (blogs[i].imageUrl) {
                            mainFeed.item({
                                title: 			blogs[i].title,
                                description: 	blogs[i].summary,
                                url: 			blogs[i].link,
                                guid: 			blogs[i]._id.toString(),
                                author: 		blogs[i].author.firstName + ' ' + blogs[i].author.lastName,
                                date: 			blogs[i].pubDate,
                                custom_elements: [{
                                    "media:content": [{
                                        _attr: {
                                            url: blogs[i].imageUrl,
                                            medium: "image"
                                        }
                                    }]
                                }]
                            });
                        }
                        else {
                            mainFeed.item({
                                title: 			blogs[i].title,
                                description: 	blogs[i].summary,
                                url: 			blogs[i].link,
                                guid: 			blogs[i]._id.toString(),
                                author: 		blogs[i].author.firstName + ' ' + blogs[i].author.lastName,
                                date: 			blogs[i].pubDate
                            });
                        }
                    }

                    res.header('Content-Type','application/rss+xml');
                    res.send(mainFeed.xml({indent: true}));
                });
            }
        });
    });
};
