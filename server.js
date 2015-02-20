var express = require('express')
var compression = require('compression')
var exphbs  = require('express-handlebars')
//var database = require('./database.js')

var app = express()
app.use(compression())
app.use(express.static(__dirname + '/static'))
app.engine('handlebars', exphbs({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')
app.use(require('less-middleware')(
    __dirname + 'static/style/less', // source
    { dest: __dirname + 'static/style/css' }, // options
    {}, // parser
    { compress: 'auto' } // complier
))

// respond with the handlebars compiled homepage
app.get('/', function(req, res) {
  res.render('index', {title:"Index | CS Blogs"})
})

// respond with bloggers from mongo
//app.get('/bloggers',function(req, res) {
//        database.Blogger.find(function(error,bloggers) {
//        if(error) {
//            console.log('Error fetching bloggers')
//        }
//        else {
//            res.render('bloggers', {title:"All Bloggers | CS Blogs", bloggers: bloggers})
//        }
//    })
//})

var port = process.env.PORT || 3000; //process.evn.PORT is required to work on Azure
var server = app.listen(port, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Website live at http://localhost:%s', port)
})
