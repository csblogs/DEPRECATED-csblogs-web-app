var dannycomputerscientist = new blogger({firstName:"Danny", lastName: "Brown",
                                          emailAddress:"d.t.brown@outlook.com",
                                          feedUrl: "http://dannycomputerscientist.wordpress.com/feed",
                                          blogWebsiteUrl: "http://dannycomputerscientist.wordpress.com",
                                          websiteUrl: "http://dannybrown.net",
                                          cvUrl: "http://dannybrown.net/cv",
                                          githubProfile: "DannyBrown",
                                          twitterProfile: "DanTonyBrown",
                                          linkedInProfile: "DanTonyBrown",
                                          bio: "A Computer Science Student at The University of York",
                                          validated: true });
dannycomputerscientist.save(function(error, savedBlogger) {
  if(error) {
    console.error(error);
  }
  else {
    console.log("Saved!");
  }
});
