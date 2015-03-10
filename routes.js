module.exports = function(app, blogger, blog, organisation, mongoose) {
  app.get('/', function(req, res) {
      res.render('index', {title: 'Index | CS Blogs'});
  });

  app.get('/bloggers',function(req, res) {
      blogger.Blogger.find(function(error,bloggers) {
          if(error) {
              console.error('Error fetching bloggers');
          }
          else {
              res.render('bloggers', {title: 'All Bloggers | CS Blogs', bloggers: bloggers});
          }
      });
  });

  app.get('/blogs', function(req, res) {
      var blogs = require('./test-data/blogs.json');
      res.render('blogs', {title: 'Blogs | CS Blogs', content: blogs});
  });
}
