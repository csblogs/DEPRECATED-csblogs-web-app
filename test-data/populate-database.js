var blogger = require("../models/blogger").Blogger;

exports.Populate = function () {
  var dannybrown = new blogger({firstName:"Danny", lastName: "Brown",
                                avatarUrl: "https://avatars2.githubusercontent.com/u/342035?v=3&s=460",
                                emailAddress:"d.t.brown@outlook.com",
                                feedUrl: "http://dannycomputerscientist.wordpress.com/feed",
                                blogWebsiteUrl: "http://dannycomputerscientist.wordpress.com",
                                websiteUrl: "http://dannybrown.net",
                                cvUrl: "http://dannybrown.net/cv",
                                githubProfile: "DannyBrown",
                                twitterProfile: "DanTonyBrown",
                                linkedInProfile: "DanTonyBrown",
                                bio: "A Computer Science Student at The University of York",
                                validated: true,
                                vanityUrl: "dannybrown"});

  var robcrocombe = new blogger({firstName: "Robert", lastName: "Crocombe",
                                 avatarUrl: "https://avatars2.githubusercontent.com/u/4536038?v=3&s=460",
                                 emailAddress: "Draxfear@hotmail.co.uk",
                                 feedUrl: "http://robcrocombe.com/feed",
                                 blogWebsiteUrl: "http://robcrocombe.com",
                                 websiteUrl: "http://robcrocombe.com",
                                 cvUrl: "",
                                 githubProfile: "robcrocombe",
                                 twitterProfile: "draxfear",
                                 linkedInProfile: "robcrocombe",
                                 bio: "York Comp Sci Student. Windows Phone Fanatic.",
                                 validated: false,
                                 vanityUrl: "robcrocombe"});

 var charlottegodley = new blogger({firstName: "Charlotte", lastName: "Godley",
                                    avatarUrl: "https://avatars1.githubusercontent.com/u/4128117?v=3&s=460",
                                    emailAddress: "charlotte@charlottegodley.co.uk",
                                    feedUrl: "http://charlottegodley.co.uk.com/rss",
                                    blogWebsiteUrl: "http://charlottegodley.co.uk",
                                    websiteUrl: "http://charlottegodley.co.uk",
                                    cvUrl: "charlottegodley.co.uk/cv",
                                    githubProfile: "godley",
                                    twitterProfile: "charwarz",
                                    linkedInProfile: "charlotte godley",
                                    bio: "Hull Comp Sci Student. Raspberry Pi Fanatic.",
                                    validated: true,
                                    vanityUrl: "charwarz"});

  var bloggersToAdd = [dannybrown, robcrocombe, charlottegodley];

  for(var i = 0; i < bloggersToAdd.length; i++) {
    bloggersToAdd[i].save(function(error, savedBlogger) {
      if(error) {
        console.error(error);
      }
    });
  }
}
