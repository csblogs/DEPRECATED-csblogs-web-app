"use strict";

var request = require('request');
var async = require('async')
var mongoose = require('mongoose');
var validator = require('../validator');
var Schema = mongoose.Schema;

var bloggerSchema = new Schema({
    //Log in Details
    userProvider: String,
    userId: String,

    //Personal Details
    firstName: String,
    lastName: String,
    emailAddress: String,
    avatarUrl: String,

    //Links
    feedUrl: String,
    blogWebsiteUrl: String,
    websiteUrl: String,
    cvUrl: String,

    //Social
    githubProfile: String,
    twitterProfile: String,
    linkedInProfile: String,

    //Profile
    bio: String,
    validated: Boolean,
    vanityUrl: String,
});

bloggerSchema.methods.sanitize = function() {
    validator.trimStrings(this._doc);
    validator.formatUrls(this._doc,
                         'feedUrl',
                         'blogWebsiteUrl',
                         'websiteUrl',
                         'cvUrl'
                        );
}

bloggerSchema.methods.validate = function(done) {    
    var check = validator.isObject()
    .withRequired('_id')
    .withRequired('userProvider')
    .withRequired('userId')
    .withRequired('firstName')
    .withRequired('lastName')
    .withRequired('emailAddress', validator.isEmail())
    .withRequired('avatarUrl', validator.isUrl())
    .withRequired('feedUrl', validator.isUrl())
    .withRequired('blogWebsiteUrl', validator.isUrl())
    .withRequired('websiteUrl', validator.isUrl())
    .withOptional('cvUrl', validator.isUrl())
    .withOptional('githubProfile', validator.notBlank(), validator.notUrl())
    .withOptional('twitterProfile', validator.notBlank(), validator.notUrl())
    .withOptional('linkedInProfile', validator.notBlank(), validator.notUrl())
    .withOptional('bio', validator.notBlank(), validator.maxLength(200))
    .withRequired('validated')
    .withRequired('vanityUrl', validator.noSpaces(), validator.vanityUrl());

    var modelData = this._docs;
    validator.run(check, modelData, function(errors) {
		//Everything is valid in terms of syntax. Now lets make sure user submitted URLs are real/live
		var brokenUrls = [];
		var urls = [modelData.feedUrl, modelData.blogWebsiteUrl, modelData.websiteUrl, modelData.cvUrl];
		async.each(urls, function(url, asyncCallback) {
            //Improve this by requesting headers only...
			request(url, function (err, resp) {
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
		},
		function(err) {
			//All done on URL Checks
			if(brokenUrls.length > 0 ){
				brokenUrls.forEach(function(item) {
					errors.push("Invalid url: %s", item);
				});
			}
		    done(errors);
		});
    });
};

exports.Blogger = mongoose.model('Blogger', bloggerSchema);
