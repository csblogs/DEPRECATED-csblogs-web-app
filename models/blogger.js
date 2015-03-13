var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var bloggerSchema = new Schema({
  //Personal Details
  firstName : String,
  lastName : String,
  emailAddress : String,
  displayPictureUrl: String,

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
});

exports.Blogger = mongoose.model('Blogger', bloggerSchema);
