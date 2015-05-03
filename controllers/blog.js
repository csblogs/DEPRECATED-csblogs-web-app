var Blog = require("../models/blog").Blog;
var Blogger = require("../models/blogger").Blogger;
var BloggerController = require("./blogger")
var paginate = require('express-paginate');

//Done of form (blogs, pageNumber, showBack, showNext, error)
exports.getPaginatedBlogs = function (options, req, done) {		
	Blog.paginate(options, req.query.page, req.query.limit, function (error, pageCount, blogs, itemCount) {
		if (error) { done(null, -1, false, false, error); }
		else {
			// Attach bloggers to blogs
			BloggerController.getAllProfiles(true, function(allBloggers, error) {
				if (error) { done(null, -1, false, false, error); }
				else {
					blogs.forEach(function(thisBlog, index, blogsArray) {	
						//Associate each blog with its blogger						
						blogsArray[index].author = allBloggers.filter(function(element) {
							return ((element.userId == thisBlog.userId) && (element.userProvider == thisBlog.userProvider));
						})[0];
					});
					done(blogs, req.query.page, (req.query.page > 1), paginate.hasNextPages(req)(pageCount), null);
				}
			});
		}
	}, {sortBy: {pubDate : 'desc'}, columns: {__v: 0}});
};

//Done of form (allBlogs, error)
exports.getAllBlogs = function (options, done) {
	Blog.find(options, function(error, allBlogs) {
		if(error) {
			done(null, error);
		}
		else {
			done(allBlogs, null);
		}
	});
};