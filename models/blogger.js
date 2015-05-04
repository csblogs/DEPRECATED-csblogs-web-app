"use strict";

var mongoose = require('mongoose');
var validator = require('../utils/validator');
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
};

bloggerSchema.methods.validate = function(done) {    
    var check = validator.isObject()
    .withRequired('_id')
    .withRequired('userProvider')
    .withRequired('userId')
    .withRequired('firstName', validator.isAlphanumeric())
    .withRequired('lastName', validator.isAlphanumeric())
    .withRequired('emailAddress', validator.isEmail())
    .withRequired('avatarUrl', validator.isUrl())
    .withRequired('feedUrl', validator.isUrl())
    .withRequired('blogWebsiteUrl', validator.isUrl())
    .withRequired('websiteUrl', validator.isUrl())
    .withOptional('cvUrl', validator.isUrl())
    .withOptional('githubProfile', validator.noSpaces(), validator.notUrl())
    .withOptional('twitterProfile', validator.noSpaces(), validator.notUrl())
    .withOptional('linkedInProfile', validator.noSpaces(), validator.notUrl())
    .withOptional('bio', validator.maxLength(200))
    .withRequired('validated')
    .withRequired('vanityUrl', validator.noSpaces(), validator.vanityUrl());

    validator.run(check, this._doc, function(errors) {
		done(errors);
    });
};

exports.Blogger = mongoose.model('Blogger', bloggerSchema);
