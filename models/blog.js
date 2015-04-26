var mongoose = require('mongoose');
var validator = require('validator');
var Schema = mongoose.Schema;

var blogSchema = new Schema({
  // Author Details
  userProvider : String,
  userId : String,

  // Information about blog
  title: String,
  imageUrl : String,
  summary : String,
  pubDate : String,
  updateDate : String,
  link : String
});

exports.Blog = mongoose.model('Blog', blogSchema);
