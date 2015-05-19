"use strict";

var Blog = require("../models/blog").Blog;
var Blogger = require("../models/blogger").Blogger;
var BloggerController = require("./blogger");
var paginate = require('express-paginate');
var sanitizeHtml = require('sanitize-html');

/** Retrieve blog posts in paginated form
 * @param   {Object}   options        for blogs
 * @param   {Boolean}  includeAuthors Include authors in result
 * @param   {Object}   columns        Select columns for bloggers
 * @param   {Object}   req            Request object
 * @param   {function} done           Callback method of form: (blogs, pageNumber, showBack, showNext, error)
 */
exports.getPaginatedBlogs = function(options, includeAuthors, columns, req, done) {
    Blog.paginate(options, {
        page: req.query.page,
        limit: req.query.limit,
        sort: { pubDate: 'desc' },
        columns: { __v: 0 },
        lean: true
    }, function (error, page) {
        if (error) {
            done(null, -1, false, false, error);
        }
        else {
            if (includeAuthors) {
                // Attach bloggers to blogs
                BloggerController.getAllProfiles(true, columns, function(allBloggers, error) {
                    if (error) {
                        done(null, -1, false, false, error);
                    }
                    else {
                        for (var i = 0; i < page.results.length; ++i) {
                            // Associate each blog with its blogger
                            page.results[i].author = allBloggers.filter(function(element) {
                                return ((element.userId == page.results[i].userId) && (element.userProvider == page.results[i].userProvider));
                            })[0];
                        }

                        done(page.results, req.query.page, (req.query.page > 1), paginate.hasNextPages(req)(page.pageCount), null);
                    }
                });
            }
            else {
                done(page.results, req.query.page, (req.query.page > 1), paginate.hasNextPages(req)(page.pageCount), null);
            }
        }
    });
};

//Done of form (recentBlogs, error)
exports.getMostRecentBlogs = function(options, howMany, done) {
    Blog.find(options, null, {skip: 0, limit: howMany, sort: {pubDate: 'desc'}}, function(error, recentBlogs) {
        if (error) {
            done(null, error);
        }
        else {
            // Attach bloggers to blogs
            BloggerController.getAllProfiles(true, {}, function(allBloggers, error) {
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

        return new_str.trim() + '&hellip;';
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

    return str.trim();
};

exports.removeAllHTML = function(blogs, len) {
    for (var i = 0; i < blogs.length; ++i) {
        blogs[i].summary = exports.truncateAndRemoveHTML(blogs[i].summary, len);
    }
}
