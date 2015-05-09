"use strict";

var BlogController = require('./controllers/blog');
var BloggerController = require('./controllers/blogger');
var RSS = require('rss');

exports.serveRoutes = function(router) {
	router.get('/main', function(req, res) {
		var mainFeed = new RSS({
			title: "CS Blogs Main Feed",
			description: "All of the blog posts from bloggers on CSBlogs.com",
			feed_url: "http://feeds.csblogs.com/main",
			site_url: "http://csblogs.com",
		});
		
		BlogController.getAllBlogs({}, function(blogs, error) {
			blogs.forEach(function(blog) {
				mainFeed.item({
					title: 			blog.title,
					description: 	blog.summary,
					url: 			blog.link,
					guid: 			blog.link,
					author: 		"CS Blogs User",
					date: 			blog.pubDate
				});	
			});
			
			res.header('Content-Type','application/rss+xml');
			res.send(mainFeed.xml({indent: true}));
		});
	});	
};
