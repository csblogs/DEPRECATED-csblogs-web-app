var express = require('express')
var compression = require('compression')
var exphbs  = require('express-handlebars')
var database = require('./database.js')
var lessMiddleware = require('less-middleware')

var app = express()
app.use(compression())
app.use(lessMiddleware(__dirname + '/static', {cacheFile: '/static/style'}))
app.use(express.static(__dirname + '/static'))
app.engine('handlebars', exphbs({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

// respond with the handlebars compiled homepage
app.get('/', function(req, res) {
  res.render('index', {title: 'Index | CS Blogs'})
})

//respond with bloggers from mongo
app.get('/bloggers',function(req, res) {
        database.Blogger.find(function(error,bloggers) {
        if(error) {
            console.error('Error fetching bloggers')
        }
        else {
            res.render('bloggers', {title: 'All Bloggers | CS Blogs', bloggers: bloggers})
        }
    })
})

var port = process.env.PORT || 3000; //process.evn.PORT is required to work on Azure
var server = app.listen(port, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Website live at http://localhost:%s', port)
})
