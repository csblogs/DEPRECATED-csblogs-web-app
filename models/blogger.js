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
    validator.formatUrls(this._doc, 'firstName', 'lastName');
}

bloggerSchema.methods.validate = function() {    
    var check = validator.isObject()
    .withRequired('_id')
    .withRequired('firstName', validator.isUrl())
    .withOptional('lastName', validator.isUrl())
    
    validator.run(check, this._doc, function(errorCount, errors) {
        console.log(errors);
    });
};

exports.Blogger = mongoose.model('Blogger', bloggerSchema);
