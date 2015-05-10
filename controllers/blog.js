"use strict";

var Blog = require("../models/blog").Blog;
var Blogger = require("../models/blogger").Blogger;
var BloggerController = require("./blogger")
var paginate = require('express-paginate');
var sanitizeHtml = require('sanitize-html');

//Done of form (blogs, pageNumber, showBack, showNext, error)
exports.getPaginatedBlogs = function (options, req, done) {
    Blog.paginate(options, req.query.page, req.query.limit, function (error, pageCount, blogs, itemCount) {
        if (error) {
            done(null, -1, false, false, error);
        }
        else {
            // Attach bloggers to blogs
            BloggerController.getAllProfiles(true, function(allBloggers, error) {
                if (error) {
                    done(null, -1, false, false, error);
                }
                else {
                    for (var i = 0; i < blogs.length; ++i) {
                        // Associate each blog with its blogger
                        blogs[i].author = allBloggers.filter(function(element) {
                            return ((element.userId == blogs[i].userId) && (element.userProvider == blogs[i].userProvider));
                        })[0];
                    }

                    done(blogs, req.query.page, (req.query.page > 1), paginate.hasNextPages(req)(pageCount), null);
                }
            });
        }
    }, {sortBy: {pubDate : 'desc'}, columns: {__v: 0}});
};

//Done of form (recentBlogs, error)
exports.getMostRecentBlogs = function(options, howMany, done) {
    Blog.find(options, null, {skip: 0, limit: howMany, sort: {pubDate: 'desc'}}, function(error, recentBlogs) {
        if (error) {
            done(null, error);
        }
        else {
            // Attach bloggers to blogs
            BloggerController.getAllProfiles(true, function(allBloggers, error) {
                if (error) {
                    done(null, error);
                }
                else {
                    for (var i = 0; i < recentBlogs.length; ++i) {
                        // Associate each blog with its blogger
                        recentBlogs[i].author = allBloggers.filter(function(element) {
                            return ((element.userId == recentBlogs[i].userId) && (element.userProvider == recentBlogs[i].userProvider));
                        })[0];
                    }

                    done(recentBlogs, null);
                }
            });
        }
    });
};

exports.truncateAndRemoveHTML = function(str, len) {
    str = sanitizeHtml(str, {
        allowedTags: [],
        allowedAttributes: {}
    });
    if (str.length > len && str.length > 0) {
        var new_str = str + " ";
        new_str = str.substr(0, len);
        new_str = str.substr(0, new_str.lastIndexOf(" "));
        new_str = (new_str.length > 0) ? new_str : str.substr(0, len);

        return new_str + '&hellip;';
    }

    // Some blogs leave annoying bits at then end, such as their own
    // continue reading link or ellipses. Remove these.
    var continueReadingPosition = str.indexOf('… Continue reading →');
    if (continueReadingPosition !== -1) {
        str = str.substring(0, continueReadingPosition);
    }

    var readMorePosition = str.indexOf('... Read more');
    if (readMorePosition !== -1) {
        str = str.substring(0, readMorePosition);
    }

    if (str.indexOf('[…]', str.length - 3) !== -1) {
        str = str.substring(0, str.length - 3);
    }

    // Trim start and end of string
    str = str.replace(/^\s+|\s+$/g, '');

    return str;
};

exports.removeAllHTML = function(blogs, len) {
    for (var i = 0; i < blogs.length; ++i) {
        blogs[i].summary = exports.truncateAndRemoveHTML(blogs[i].summary, len);
    }
}
