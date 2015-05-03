var mongoose = require('mongoose');
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

bloggerSchema.methods.isValid = function() {
    //TODO: Use validator package here
};

exports.Blogger = mongoose.model('Blogger', bloggerSchema);
