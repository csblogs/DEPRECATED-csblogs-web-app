"use strict";

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

bloggerSchema.methods.validate = function() {    
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
    .withOptional('websiteUrl', validator.isUrl())
    .withOptional('cvUrl', validator.isUrl())
    .withOptional('githubProfile', validator.noWhitespace(), validator.isNotUrl())
    .withOptional('twitterProfile', validator.noWhitespace(), validator.isNotUrl())
    .withOptional('linkedInProfile', validator.noWhitespace(), validator.isNotUrl())
    .withOptional('bio', validator.noWhitespace(), validator.maxLength(120))
    .withRequired('validated')
    .withRequired('vanityUrl', validator.noSpaces(), validator.vanityUrl())
    
    validator.run(check, this._doc, function(errorCount, errors) {
        console.log(errors);
    });
};

exports.Blogger = mongoose.model('Blogger', bloggerSchema);
