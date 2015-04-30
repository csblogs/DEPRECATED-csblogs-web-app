var blog = require('../models/blog');
var blogger = require('../models/blogger');

//Callback of form done(profile, error);
exports.getUserProfile = function(passportUser, done) {
	if(passportUser.userProvider && passportUser.userId) {
		//This user is registered
		blog.find({userId: passportUser.userId, userProvider: passportUser.userProvider}, function(error, blogs) {
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
	blogger.findOne({vanityUrl: vanityUrl}, function(error, profile) {
		if (error) {
			console.log("[ERROR] %j", error);
			done(null, error);
		}
		else {
			if(profile) {
				//Attach blogs to user to create full profile
				blog.find({userId: profile.userId, userProvider: profile.userProvider}, function(error, blogs) {
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
}

exports.getAllProfiles = function (verifiedOnly, done) {
	var options = {};
	if(verifiedOnly) {
		options.verified = true;
	}
	blogger.find(options, function(error, allBloggers) {
		done(allBloggers, error);
	});
};
