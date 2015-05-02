"use strict";

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
  pubDate : Date,
  updateDate : Date,
  link : String
});

blogSchema.plugin(require('mongoose-paginate'));

exports.Blog = mongoose.model('Blog', blogSchema);
