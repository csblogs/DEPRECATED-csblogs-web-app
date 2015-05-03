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

exports.getAllProfiles = function(validatedOnly, done) {
	var options = {};
	if (validatedOnly) {
		options.validated = true;
	}
	
    Blogger.find(options, {emailAddress: 0, __v: 0}, function(error, allBloggers) {
		done(allBloggers, error);
	});
};

function isVanityUrlTaken(vanityUrl, done) {
    Blogger.findOne({vanityUrl: vanityUrl}, function(error, profile) {
        if (error) {
            console.log("[ERROR] %j", error);
            done(true, error);
        }
        else if (profile) {
            done(true, null);
        }
        else {
            done(false, null);
        }
    });
};

function getBlogs(bloggerQuery, req, done) {
    BlogController.getPaginatedBlogs(bloggerQuery, req, function(blogs, pageNumber, showBack, showNext, error) {
        var page = {
            blogs: blogs,
            pageNumber: pageNumber,
            hasLess: showBack,
            hasMore: showNext
        };
        
        done(page, error);
    });
}

exports.register = function(newBlogger, done) {
    newBlogger.sanitize();
    newBlogger.validate(function(errors) {
        isVanityUrlTaken(newBlogger.vanityUrl, function(taken, error) {
            validateUserSubmittedUrls(newBlogger, function (brokenUrls) {
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
                brokenUrls.forEach(function(brokenUrl) {
                   errors.push({
                       parameter: brokenUrl.name,
                       value: brokenUrl.location,
                       message: 'URL doesnt appear to be correct, or site is broken'
                   });
                });
            	done(newBlogger, errors, null);
            });
        });
    });
};

//Done of form done(brokenUrls);
function validateUserSubmittedUrls (blogger, done) {
    //Everything is valid in terms of syntax. Now lets make sure user submitted URLs are real/live
	var brokenUrls = [];
	var urls = [{name: "feedUrl",     	    location: blogger.feedUrl}, 
                {name: "blogWebsiteUrl",    location: blogger.blogWebsiteUrl}, 
                {name: "websiteUrl",        location: blogger.websiteUrl}, 
                {name: "cvUrl",             location: blogger.cvUrl}];
                
	async.each(urls, function(url, asyncCallback) {
        if(url != "") {        
            //Improve this by requesting headers only...
    		request(url.location, function (err, resp) {
    			if(err) {
    				brokenUrls.push(url);
    			}
    			else{
    		    	if (resp.statusCode === 200) {
    		      	  	return; // url exists
    		    	}
    		  	  	else {
    			   	 	brokenUrls.push(url);
    		   	 	}
    	   		}
    			asyncCallback();
    		});
        }
		asyncCallback();
	},
	function(err) {
        if(err) {
            console.error("[ERROR] %j", err);
        }
	    done(brokenUrls);
	});
};