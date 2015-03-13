var blogger = require("./models/blogger").Blogger;

module.exports = function(app) {
  app.get('/', function(req, res) {
      res.render('index', {title: 'Index | CS Blogs'});
  });

  app.get('/bloggers',function(req, res) {
      bloggers = blogger.find({}, function(error, allBloggers) {
        if(error) {
          res.render('error', {title: "Error | CS Blogs", error: error});
        }
        else {
          res.render('bloggers', {title: "Bloggers | CS Blogs", bloggers: allBloggers});
        }
      });
  });

  app.get('/blogs', function(req, res) {
      var blogs = require('./test-data/blogs.json');
      res.render('blogs', {title: 'Blogs | CS Blogs', content: blogs});
  });
}
