var Blog = require('../models/blog').Blog;
var Blogger = require('../models/blogger').Blogger;

//Callback of form done(profile, error);
exports.getUserProfile = function(passportUser, done) {
	if(passportUser.userProvider && passportUser.userId) {
		//This user is registered (so their profile is actually already in req.user, but we need to attach some blogs)
		Blog.find({userId: passportUser.userId, userProvider: passportUser.userProvider}, function(error, blogs) {
			if(error) {
				console.log("[ERROR] %j", error);
				done(null, error);
			}
			else {
				//Attach blogs to user to create full profile
				blogs.sort(function(a,b) {
				    return b.pubDate - a.pubDate;
				});
				passportUser.blogs = blogs;
				done(passportUser, null);
			}
		});
	}
	else {
		// Not a registered user
		done(null, null);
	}
};

exports.getProfileByVanityUrl = function (vanityUrl, done) {
	Blogger.findOne({vanityUrl: vanityUrl}, function(error, profile) {
		if (error) {
			console.log("[ERROR] %j", error);
			done(null, error);
		}
		else {
			if(profile) {
				//Attach blogs to user to create full profile
				Blog.find({userId: profile.userId, userProvider: profile.userProvider}, function(error, blogs) {
					if(error) {
						console.log("[ERROR] %j", error);
					}
					else {						
						//Sort blogs
						blogs.sort(function(a,b) {
						    return b.pubDate - a.pubDate;
						});
						profile.blogs = blogs;
						done(profile, null);
					}
				});
			}
			else {
				done(null, null);
			}
		}
	});
};

exports.getAllProfiles = function (validatedOnly, done) {
	var options = {};
	if(validatedOnly) {
		options.validated = true;
	}
	
	Blogger.find(options, function(error, allBloggers) {
		done(allBloggers, error);
	});
};
