var mongoose = require('mongoose');
var validator = require('validator');
var Schema = mongoose.Schema;

var bloggerSchema = new Schema({
  //Log in Details
  userProvider : String,
  userId : String,

  //Personal Details
  firstName : String,
  lastName : String,
  emailAddress : String,
  avatarUrl: String,

  //Links
  feedUrl : String,
  blogWebsiteUrl : String,
  websiteUrl : String,
  cvUrl : String,

  //Social
  githubProfile : String,
  twitterProfile : String,
  linkedInProfile : String,

  //Profile
  bio : String,
  validated : Boolean,
  vanityUrl : String,
});

bloggerSchema.methods.isValid = function(returnIssues) {
  //TODO: Implement this.
  var issues = [];
  if(returnIssues) {
    return issues;
  }
  else {
    return true;
  }

  /*
  var issues = [];

  if(validator.isURL(displayPictureUrl)) {

  }

  if(validator.isURL(feedUrl)) {

  }

  if(validator.isURL(blogWebsiteUrl)) {

  }

  if(validator.isURL(websiteUrl)) {

  }

  if(validator.isURL(cvUrl)) {

  }

  if(validator.isEmail(emailAddress)) {

  } */
}

exports.Blogger = mongoose.model('Blogger', bloggerSchema);
