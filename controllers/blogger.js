"use strict";

var request = require('request');
var async = require('async')
var Blog = require('../models/blog').Blog;
var BlogController = require('./blog');
var Blogger = require('../models/blogger').Blogger;

// Callback of form done(profile, error);
exports.getUserProfile = function(passportUser, req, done) {
    if (passportUser.userProvider && passportUser.userId) {
        // This user is registered (so their profile is actually already in req.user, but we need to attach some blogs)
        getBlogs({userId: passportUser.userId, userProvider: passportUser.userProvider}, req, function(page, error) {
            if (error) {
                console.log("[ERROR] %j", error);
                done(null, null, error);
            }
            else {
                done(passportUser, page, null);
            }
        });
    }
    else {
        // Not a registered user
        done(null, null, null);
    }
};

exports.getProfileByVanityUrl = function(vanityUrl, req, done) {
    Blogger.findOne({vanityUrl: vanityUrl}, {emailAddress: 0, __v: 0}, function(error, profile) {
        if (error) {
            console.log("[ERROR] %j", error);
            done(null, null, error);
        }
        else if (profile) {
            // Attach blogs to user to create full profile
            getBlogs({userId: profile.userId, userProvider: profile.userProvider}, req, function(page, error) {
                if (error) {
                    console.log("[ERROR] %j", error);
                    done(null, null, error);
                }
                else {
                    done(profile, page, null);
                }
            });
        }
        else {
            // Not a registered user
            done(null, null, null);
        }
    });
};

exports.getAllProfiles = function(validatedOnly, columns, done) {
    var keys = Object.keys(columns);
    if ((keys.length > 0 && columns[keys[0]] !== 1) || (keys.length === 0)) {
        columns.__v = 0;
        columns.emailAddress = 0;
    }

    Blogger.find({validated: validatedOnly}, columns, {sort: {firstName: 'asc'}}, function(error, allBloggers) {
        done(allBloggers, error);
    });
};

exports.updateProfile = function(user, update, done) {
    Blogger.update({userId: user.userId, userProvider: user.userProvider}, update, done);
}

exports.getValidatedBloggers = function(done) {
    Blogger.find({validated: true}, {_id: 0, userId: 1, userProvider: 1}).lean().exec(
    function(error, bloggers) {
        if (error) {
            done(error, null, null);
        }
        else {
            var ids = [];
            var providers = [];

            for (var i = 0; i < bloggers.length; ++i) {
                ids.push(bloggers[i].userId);
                providers.push(bloggers[i].userProvider);
            }

            done(null, ids, providers);
        }
    });
}

function isVanityUrlTaken(user, done) {
    Blogger.findOne({vanityUrl: user.vanityUrl}, function(error, profile) {
        if (error) {
            console.log("[ERROR] %j", error);
            done(true, error);
        }
        else if (profile) {
            if (profile.userId === user.userId && profile.userProvider === user.userProvider) {
                done(false, null); // Vanity url belongs to current user
            }
            else {
                done(true, null);
            }
        }
        else {
            done(false, null);
        }
    });
};

function getBlogs(bloggerQuery, req, done) {
    BlogController.getPaginatedBlogs(bloggerQuery, false, {}, req,
        function(blogs, pageNumber, showBack, showNext, error) {
            var page = {
                blogs: blogs,
                pageNumber: pageNumber,
                hasLess: showBack,
                hasMore: showNext
            };

            done(page, error);
    });
}

exports.validate = function(newBlogger, done) {
    newBlogger.sanitize();
    newBlogger.validate(function(errors) {
        isVanityUrlTaken(newBlogger, function(taken, error) {
            validateUserSubmittedUrls(newBlogger, function(brokenUrls) {
                if (error) {
                    return done(null, null, error);
                }
                else if (taken) {
                    errors.push({
                        parameter: 'vanityUrl',
                        value: newBlogger.vanityUrl,
                        message: 'Profile name is already taken by another user.'
                    });
                }

                for (var i = 0; i < brokenUrls.length; ++i) {
                   errors.push({
                       parameter: brokenUrls[i].name,
                       value: brokenUrls[i].location,
                       message: 'URL doesn\'t appear to link to valid location.'
                   });
                }

                if (brokenUrls.length > 0) { console.log("%j", brokenUrls); }
                if (errors.length > 0) { console.log("%j", errors); }

                done(newBlogger, errors, null);
            });
        });
    });
};

//Done of form done(brokenUrls);
function validateUserSubmittedUrls(blogger, done) {
    //Everything is valid in terms of syntax. Now lets make sure user submitted URLs are real/live
    var brokenUrls = [];
    var urls = [{name: "feedUrl",     	    location: blogger.feedUrl},
                {name: "blogWebsiteUrl",    location: blogger.blogWebsiteUrl},
                {name: "websiteUrl",        location: blogger.websiteUrl},
                {name: "cvUrl",             location: blogger.cvUrl}];

    async.each(urls, function(url, asyncCallback) {
        if (url.location != "") {
            request({url: url.location, method: 'HEAD'}, function (err, resp) {
                if (err) {
                    brokenUrls.push(url);
                }
                else {
                    if (resp.statusCode === 200) {
                          // url exists
                    }
                        else {
                            brokenUrls.push(url);
                        }
                   }
                asyncCallback();
            });
        }
        else {
            asyncCallback();
        }
    },
    function(err) {
        if (err) {
            console.error("[ERROR] %j", err);
        }
        done(brokenUrls);
    });
};
